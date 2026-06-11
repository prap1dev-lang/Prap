import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";

/**
 * POST /api/admin/bookings/visit  — ADMIN ONLY.
 *
 * Confirms a completed site visit and credits PRAP coins atomically:
 *   Visit 1 & 2 → referrer +10,000 ; referring corporate +5,000
 *   Visit 3+    → no bonus
 *
 * Security / abuse model:
 *   - Admin-gated (requireAdmin) — only staff can trigger a payout.
 *   - Idempotent: the DB credit_visit() function uses a unique (booking,visit_no)
 *     row, so retries / double-submits never double-credit.
 *   - Self-referral block: a corporate that referred its own client account gets
 *     no corporate cut (handled inside credit_visit()).
 *   - Min 2 attendees enforced both here and in the DB function.
 *   - Rate-limited per booking to slow scripted abuse.
 */

const Body = z.object({
  bookingId: z.string().uuid(),
  visitNo: z.number().int().min(1).max(10),
  attendees: z.array(z.string().min(1)).min(2, "At least 2 attendees required"),
});

// In-process best-effort rate limit (per booking). The DB unique constraint is
// the real guarantee; this just sheds obvious floods cheaply.
const RECENT = new Map<string, number>();
const RATE_WINDOW_MS = 10_000;

export async function POST(req: Request) {
  let admin_id: string;
  try {
    const me = await requireAdmin();
    admin_id = me.authId;
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }
  const { bookingId, visitNo, attendees } = parsed.data;

  // Rate-limit: same booking can't be hammered within the window.
  const key = `${bookingId}`;
  const last = RECENT.get(key) ?? 0;
  const now = Date.now();
  if (now - last < RATE_WINDOW_MS) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts for this booking. Try again shortly." },
      { status: 429 },
    );
  }
  RECENT.set(key, now);

  const sb = supabaseAdmin();

  // Pre-flight: booking exists and visit number is the expected next one.
  const { data: booking, error: bErr } = await sb
    .from("bookings")
    .select("id, visits_completed, status, client_id")
    .eq("id", bookingId)
    .maybeSingle();

  if (bErr) {
    return NextResponse.json({ ok: false, error: bErr.message }, { status: 500 });
  }
  if (!booking) {
    return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });
  }
  if (visitNo !== booking.visits_completed + 1) {
    return NextResponse.json(
      {
        ok: false,
        error: `Next visit for this booking is #${booking.visits_completed + 1}, not #${visitNo}.`,
      },
      { status: 409 },
    );
  }

  // Atomic credit via the SECURITY DEFINER function.
  const { data, error } = await sb.rpc("credit_visit", {
    p_booking_id: bookingId,
    p_visit_no: visitNo,
    p_attendees: attendees,
    p_admin_id: admin_id,
  });

  if (error) {
    const msg = error.message || "";
    if (msg.includes("already_credited")) {
      return NextResponse.json(
        { ok: false, error: "This visit has already been credited." },
        { status: 409 },
      );
    }
    if (msg.includes("min_attendees")) {
      return NextResponse.json(
        { ok: false, error: "At least 2 attendees are required." },
        { status: 400 },
      );
    }
    if (msg.includes("booking_not_found")) {
      return NextResponse.json({ ok: false, error: "Booking not found." }, { status: 404 });
    }
    console.error("[admin/visit] credit_visit failed:", error);
    return NextResponse.json({ ok: false, error: msg || "Credit failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, result: data });
}
