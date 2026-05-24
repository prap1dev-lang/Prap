import { NextResponse } from "next/server";
import { genReferralCode } from "@/lib/utils";

/**
 * POST /api/corporate/referral-code
 * Generate (or rotate) the unique referral code for the authenticated Corporate.
 * Code format: PRAP-XXXXXX (6-char alphanumeric).
 */

export async function POST(_req: Request) {
  // TODO: ensure caller is role='corporate' and verified.
  // INSERT into referral_codes (corporate_user_id, code) — unique on code.
  // Old code (if any) is soft-deactivated (active=false) but historical attribution preserved.
  const code = genReferralCode();
  return NextResponse.json({ ok: true, code });
}

export async function GET(_req: Request) {
  return NextResponse.json({ ok: true, code: "PRAP-DEMO01" });
}
