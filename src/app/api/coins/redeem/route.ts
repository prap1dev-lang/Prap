import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRedeem } from "@/lib/coins";

/**
 * POST /api/coins/redeem
 * - User must have an active booking with paidPercent >= 50%.
 * - Amount capped at 50% of balance, and at ₹1,00,000 absolute.
 * - On success: debit coin_ledger + create payout_requests row -> Razorpay payout.
 */

const Body = z.object({
  bookingId: z.string(),
  amount: z.number().int().positive(),
  payoutMethod: z.enum(["upi", "bank"]),
  payoutDestination: z.string().min(4),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }
  const { amount } = parsed.data;

  // Demo state — replace with DB read
  const balance = 25000;
  const paidPercent = 0.6;

  const check = checkRedeem({ balance, requested: amount, paidPercent });
  if (!check.ok) {
    return NextResponse.json({ ok: false, error: check.reason }, { status: 422 });
  }

  // TODO (transactional):
  // 1. SELECT FOR UPDATE wallet — re-check balance & cap
  // 2. INSERT coin_ledger(source='redemption', delta = -amount)
  // 3. INSERT payout_requests(amount, method, dest, status='queued')
  // 4. Enqueue Razorpay Payout job (background worker)

  return NextResponse.json({
    ok: true,
    payoutRequestId: "PR-DEMO",
    amount,
    expectedArrival: "Within 24 banking hours",
  });
}
