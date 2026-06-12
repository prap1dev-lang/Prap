import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { ensureReferralCode } from "@/lib/referrals";

/**
 * Referral code for ANY user (broker / corporate / referrer).
 *
 * Each user has exactly ONE permanent code, created once on first request and
 * never changed. GET returns it (creating it if missing). There is no rotation.
 */

export async function GET() {
  const me = await requireUser();
  try {
    const code = await ensureReferralCode(me.authId);
    return NextResponse.json({ ok: true, code });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 });
  }
}
