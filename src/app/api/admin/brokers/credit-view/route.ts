import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import { creditCoins } from "@/lib/referrals";
import { COIN } from "@/lib/coins";

/**
 * POST /api/admin/brokers/credit-view — ADMIN ONLY.
 *
 * Credits the broker-programme "property view" bonus: both the broker and the
 * client receive COIN.BROKER.VIEW_BONUS (25,000) the first time the client
 * views a property through the broker. Consumes one of the broker's client
 * slots. Idempotent per booking via a ledger lookup.
 */

const Body = z.object({ bookingId: z.string().uuid() });

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }
  const { bookingId } = parsed.data;
  const sb = supabaseAdmin();

  // Booking + parties.
  const { data: booking, error: bErr } = await sb
    .from("bookings")
    .select("id, broker_id, client_id")
    .eq("id", bookingId)
    .maybeSingle();
  if (bErr) return NextResponse.json({ ok: false, error: bErr.message }, { status: 500 });
  if (!booking) return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });
  if (!booking.broker_id) {
    return NextResponse.json({ ok: false, error: "This booking has no broker — view bonus is broker-only." }, { status: 400 });
  }

  // Idempotency: never credit the same booking's view bonus twice.
  const { data: existing } = await sb
    .from("coin_ledger")
    .select("id")
    .eq("source", "broker_view_bonus")
    .eq("ref_id", bookingId)
    .limit(1)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ ok: false, error: "View bonus already credited for this booking." }, { status: 409 });
  }

  // Slot guard.
  const { data: broker } = await sb
    .from("users")
    .select("broker_slots_total, broker_slots_used")
    .eq("id", booking.broker_id)
    .maybeSingle();
  const total = Number(broker?.broker_slots_total ?? COIN.BROKER.FREE_SLOTS_BATCH);
  const used = Number(broker?.broker_slots_used ?? 0);
  if (used >= total) {
    return NextResponse.json(
      { ok: false, error: "No client slots left. Close 5 deals to unlock the next batch." },
      { status: 409 },
    );
  }

  // Credit both parties + consume a slot.
  try {
    await creditCoins(sb, booking.broker_id, COIN.BROKER.VIEW_BONUS, "broker_view_bonus", {
      notes: "Broker property-view bonus", refTable: "bookings", refId: bookingId,
    });
    await creditCoins(sb, booking.client_id, COIN.BROKER.VIEW_BONUS, "broker_view_bonus", {
      notes: "Client property-view bonus", refTable: "bookings", refId: bookingId,
    });
    await sb.from("users").update({ broker_slots_used: used + 1 }).eq("id", booking.broker_id);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Credit failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, credited: COIN.BROKER.VIEW_BONUS, slotsRemaining: total - used - 1 });
}
