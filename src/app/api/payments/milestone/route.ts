import { NextResponse } from "next/server";
import { z } from "zod";
import { COIN, investmentBonus } from "@/lib/coins";

/**
 * POST /api/payments/milestone
 * Creates a Razorpay order for the next pending milestone (50/25/25).
 * Webhook /api/payments/webhook updates booking + credits investment bonus on the FIRST milestone.
 */

const Body = z.object({
  bookingId: z.string(),
  milestoneIndex: z.number().int().min(0).max(COIN.PAYMENT_SCHEDULE.length - 1),
  totalPropertyPrice: z.number().int().positive(),
  applyCoins: z.number().int().min(0).optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }
  const { milestoneIndex, totalPropertyPrice, applyCoins = 0 } = parsed.data;

  const pct = COIN.PAYMENT_SCHEDULE[milestoneIndex];
  const grossDue = Math.round(totalPropertyPrice * pct);
  const coinDiscount = Math.min(applyCoins, grossDue);
  const netDue = grossDue - coinDiscount;

  // TODO:
  // 1. Validate booking is active and belongs to user
  // 2. If milestoneIndex > 0, ensure prior milestone status='captured'
  // 3. Razorpay.orders.create({ amount: netDue * 100, currency: 'INR', notes:{...} })
  // 4. INSERT payments(booking_id, milestone_index, gross, coin_discount, net, status='created', rzp_order_id)
  // 5. If applyCoins>0: reserve those coins (mark coin_ledger source='hold') — release on webhook capture/refund.

  const onFirstMilestoneInvestmentBonus =
    milestoneIndex === 0 ? investmentBonus(totalPropertyPrice) : 0;

  return NextResponse.json({
    ok: true,
    razorpayOrder: { id: "order_DEMO", amount: netDue * 100, currency: "INR" },
    grossDue,
    coinDiscount,
    netDue,
    investmentBonusPreview: onFirstMilestoneInvestmentBonus,
    note:
      milestoneIndex === 0
        ? "Once captured, investment-tier bonus will be credited and redemption will UNLOCK."
        : "Standard milestone payment.",
  });
}
