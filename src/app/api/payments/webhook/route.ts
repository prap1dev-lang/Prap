import { NextResponse } from "next/server";

/**
 * Razorpay webhook receiver.
 * Verify signature with RAZORPAY_WEBHOOK_SECRET (HMAC-SHA256 of raw body).
 * Handle events: payment.captured, payment.failed, refund.processed.
 */

export async function POST(req: Request) {
  const sig = req.headers.get("x-razorpay-signature");
  const raw = await req.text();

  // TODO:
  // 1. const expected = crypto.createHmac('sha256', WEBHOOK_SECRET).update(raw).digest('hex')
  //    if (sig !== expected) return 401
  // 2. Parse event. For payment.captured:
  //    - UPDATE payments SET status='captured', captured_at=now() WHERE rzp_payment_id=...
  //    - If milestone_index == 0:
  //        a) INSERT coin_ledger(source='investment_bonus', delta = investmentBonus(totalPropertyPrice))
  //        b) UPDATE bookings SET first_milestone_paid_at=now()  -- this UNLOCKS redemption
  //    - Generate receipt (PDF) and email it.
  //    - On refund: reverse coin holds + investment bonus pro-rata.

  if (!sig) {
    return NextResponse.json({ ok: false, error: "Missing signature" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
