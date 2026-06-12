/**
 * PRAP Coin business logic — single source of truth.
 * 1 PRAP Coin = 1 INR. All values are in coins (= INR).
 */

export const COIN = {
  ONBOARDING_BONUS: 25_000,
  // Paid to BOTH the referrer and the newly-referred user on successful signup.
  REFERRAL_BONUS: 5_000,
  INVESTMENT_TIERS: [
    { upTo: 1_00_00_000, coins: 25_000 },       // ≤ 1 Cr
    { upTo: 2_00_00_000, coins: 50_000 },       // 1 - 2 Cr
    { upTo: 3_00_00_000, coins: 75_000 },       // 2 - 3 Cr
    { upTo: Infinity,    coins: 75_000 },       // 3 Cr+ keeps top tier (extend later)
  ],
  VISIT_BONUS: {
    1: { corporate: 5_000, referrer: 10_000 },
    2: { corporate: 5_000, referrer: 10_000 },
  } as Record<number, { corporate: number; referrer: number }>,
  REDEMPTION: {
    MAX_PERCENT: 0.5,             // can redeem up to 50% of balance
    HARD_CAP_INR: 1_00_000,       // and never more than ₹1,00,000 per request
    UNLOCK_AFTER_PAYMENT_PCT: 0.5, // only after 50% property payment is paid
  },
  PAYMENT_SCHEDULE: [0.5, 0.25, 0.25] as const, // 50 / 25 / 25
} as const;

export function investmentBonus(investmentInr: number): number {
  for (const tier of COIN.INVESTMENT_TIERS) {
    if (investmentInr <= tier.upTo) return tier.coins;
  }
  return 0;
}

export function visitBonus(visitNo: number): { corporate: number; referrer: number } {
  return COIN.VISIT_BONUS[visitNo] || { corporate: 0, referrer: 0 };
}

export type RedeemCheck =
  | { ok: true; amount: number }
  | { ok: false; reason: string };

export function checkRedeem(opts: {
  balance: number;
  requested: number;
  paidPercent: number; // 0..1 of total property cost paid
}): RedeemCheck {
  if (opts.paidPercent < COIN.REDEMPTION.UNLOCK_AFTER_PAYMENT_PCT) {
    return { ok: false, reason: "Redemption unlocks after 50% property payment." };
  }
  if (opts.requested <= 0) return { ok: false, reason: "Enter a valid amount." };
  const maxByPct = Math.floor(opts.balance * COIN.REDEMPTION.MAX_PERCENT);
  const cap = Math.min(maxByPct, COIN.REDEMPTION.HARD_CAP_INR);
  if (opts.requested > cap) {
    return {
      ok: false,
      reason: `Max redeemable right now is ₹${cap.toLocaleString("en-IN")} (50% of balance, capped at ₹1,00,000).`,
    };
  }
  return { ok: true, amount: opts.requested };
}
