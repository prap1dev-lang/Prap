import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";

/**
 * Self-serve booking — any authenticated user (broker / corporate / referrer)
 * can book a site visit for a RERA-verified project. The booking immediately
 * appears in the admin panel as an in-process item.
 *
 * Aadhaar lock-in: the DB enforces UNIQUE(project_id, client_aadhaar_hash), so a
 * project+client pair can only be locked once. A second attempt returns 409 with
 * the locking broker's (masked) name.
 *
 *   GET  → the caller's own bookings (newest first).
 *   POST → create a booking for { projectSlug, scheduledAt, notes? }.
 */

const Body = z.object({
  projectSlug: z.string().min(1),
  scheduledAt: z.string().min(1), // ISO datetime
  notes: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  const me = await requireUser();
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { projectSlug, scheduledAt, notes } = parsed.data;
  const admin = supabaseAdmin();

  // Resolve the real project row (bookings.project_id is a strict FK).
  const { data: project } = await admin
    .from("projects")
    .select("id, name, city")
    .eq("slug", projectSlug)
    .maybeSingle();
  if (!project) {
    return NextResponse.json(
      { ok: false, error: "This project isn't available for online booking yet. Please contact us." },
      { status: 404 },
    );
  }

  // The booker is the client. We need their stored Aadhaar hash for lock-in.
  const { data: meRow } = await admin
    .from("users")
    .select("aadhaar_hash, role")
    .eq("id", me.authId)
    .maybeSingle();
  if (!meRow?.aadhaar_hash) {
    return NextResponse.json(
      { ok: false, error: "Complete your KYC before booking a visit." },
      { status: 422 },
    );
  }

  const when = new Date(scheduledAt);
  if (Number.isNaN(when.getTime())) {
    return NextResponse.json({ ok: false, error: "Invalid visit date/time." }, { status: 400 });
  }

  const { data: booking, error } = await admin
    .from("bookings")
    .insert({
      project_id: project.id,
      // A broker booking is attributed to them; other roles self-book.
      broker_id: meRow.role === "broker" ? me.authId : null,
      client_id: me.authId,
      client_aadhaar_hash: meRow.aadhaar_hash,
      scheduled_at: when.toISOString(),
      status: "scheduled",
      created_by: me.authId,
      notes: notes ?? null,
    })
    .select("id, status, scheduled_at")
    .maybeSingle();

  if (error) {
    const e = error as any;
    if (e.code === "23505") {
      // Lock-in violation — surface who holds the lock.
      const { data: locked } = await admin
        .from("bookings")
        .select("broker:users!bookings_broker_id_fkey ( name ), client:users!bookings_client_id_fkey ( name )")
        .eq("project_id", project.id)
        .eq("client_aadhaar_hash", meRow.aadhaar_hash)
        .maybeSingle();
      const holder = (locked as any)?.broker?.name || (locked as any)?.client?.name || "another user";
      return NextResponse.json(
        { ok: false, error: `This project is already locked to ${holder} for your Aadhaar.` },
        { status: 409 },
      );
    }
    console.error("[bookings] insert failed:", e);
    return NextResponse.json({ ok: false, error: e.message || "Could not create booking." }, { status: 500 });
  }

  // Audit trail so admins can trace self-serve bookings.
  await admin.from("audit_log").insert({
    actor_id: me.authId,
    action: "booking_created",
    payload: { booking_id: booking?.id, project: project.name, role: meRow.role },
  });

  return NextResponse.json({
    ok: true,
    booking: { id: booking?.id, status: booking?.status, project: project.name, scheduledAt: booking?.scheduled_at },
  });
}

export async function GET() {
  const me = await requireUser();
  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("bookings")
    .select("id, status, scheduled_at, visits_completed, created_at, project:projects ( name, city )")
    .or(`client_id.eq.${me.authId},broker_id.eq.${me.authId},created_by.eq.${me.authId}`)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, bookings: data ?? [] });
}
