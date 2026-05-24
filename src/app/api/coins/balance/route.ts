import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // TODO: derive user from session, then:
  //   SELECT balance, lifetime_earned, lifetime_redeemed FROM wallets WHERE user_id = $1
  //   SELECT * FROM coin_ledger WHERE user_id = $1 ORDER BY at DESC LIMIT 50

  return NextResponse.json({
    ok: true,
    balance: 25000,
    lifetimeEarned: 25000,
    lifetimeRedeemed: 0,
    ledger: [
      { id: "L-0001", at: new Date().toISOString(), source: "onboarding", delta: 25000, balanceAfter: 25000 },
    ],
  });
}
