import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireUser } from "@/lib/auth";
import { ensureReferralCode } from "@/lib/referrals";

/**
 * Referral code management for ANY user (broker / corporate / referrer).
 *
 *   GET  → returns the caller's current active code (creates one if missing).
 *   POST → rotates the code: deactivates the old one (history preserved),
 *          issues a fresh PRAP-XXXXXX. A unique partial index enforces exactly
 *          one active code per owner.
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

export async function POST() {
  const me = await requireUser();
  const admin = supabaseAdmin();
  // Deactivate any current active code first (frees the unique-active slot).
  await admin
    .from("referral_codes")
    .update({ active: false, rotated_at: new Date().toISOString() })
    .eq("corporate_id", me.authId)
    .eq("active", true);

  try {
    const code = await ensureReferralCode(me.authId);
    return NextResponse.json({ ok: true, code });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 });
  }
}
