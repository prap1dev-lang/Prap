import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import { creditCoins } from "@/lib/referrals";
import { COIN } from "@/lib/coins";

/**
 * POST /api/admin/brokers/close-deal — ADMIN ONLY.
 *
 * Marks a broker deal as closed: credits both broker and client the
 * COIN.BROKER.DEAL_CLOSE_BONUS (5,000), increments the broker's closed-deal
 * count, and unlocks the next batch of client slots every DEALS_PER_REFILL.
 * Idempotent per booking via a ledger lookup.
 */

const Body = z.object({
  bookingId: z.string().uuid(),
  dealValueInr: z.number().int().nonnegative().optional(),
});

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
  const { bookingId, dealValueInr } = parsed.data;
  const sb = supabaseAdmin();

  const { data: booking, error: bErr } = await sb
    .from("bookings")
    .select("id, broker_id, client_id")
    .eq("id", bookingId)
    .maybeSingle();
  if (bErr) return NextResponse.json({ ok: false, error: bErr.message }, { status: 500 });
  if (!booking) return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });
  if (!booking.broker_id) {
    return NextResponse.json({ ok: false, error: "This booking has no broker." }, { status: 400 });
  }

  // Idempotency.
  const { data: existing } = await sb
    .from("coin_ledger")
    .select("id")
    .eq("source", "broker_deal_close")
    .eq("ref_id", bookingId)
    .limit(1)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ ok: false, error: "This deal has already been closed." }, { status: 409 });
  }

  try {
    await creditCoins(sb, booking.broker_id, COIN.BROKER.DEAL_CLOSE_BONUS, "broker_deal_close", {
      notes: "Broker deal-close bonus", refTable: "bookings", refId: bookingId,
    });
    await creditCoins(sb, booking.client_id, COIN.BROKER.DEAL_CLOSE_BONUS, "broker_deal_close", {
      notes: "Client deal-close bonus", refTable: "bookings", refId: bookingId,
    });

    // Bump closed-deal count and refill slots every Nth deal.
    const { data: broker } = await sb
      .from("users")
      .select("broker_slots_total, broker_deals_closed")
      .eq("id", booking.broker_id)
      .maybeSingle();
    const closed = Number(broker?.broker_deals_closed ?? 0) + 1;
    const total = Number(broker?.broker_slots_total ?? COIN.BROKER.FREE_SLOTS_BATCH);
    const refill = closed % COIN.BROKER.DEALS_PER_REFILL === 0;
    await sb
      .from("users")
      .update({
        broker_deals_closed: closed,
        broker_slots_total: refill ? total + COIN.BROKER.FREE_SLOTS_BATCH : total,
      })
      .eq("id", booking.broker_id);

    // Record the deal value + booked status when supplied.
    const patch: Record<string, any> = { status: "booked" };
    if (typeof dealValueInr === "number") patch.total_property_price_inr = dealValueInr;
    await sb.from("bookings").update(patch).eq("id", bookingId);

    return NextResponse.json({
      ok: true,
      credited: COIN.BROKER.DEAL_CLOSE_BONUS,
      dealsClosed: closed,
      slotsUnlocked: refill,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Close failed" }, { status: 500 });
  }
}
