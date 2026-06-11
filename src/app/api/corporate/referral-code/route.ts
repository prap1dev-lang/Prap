import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireUser } from "@/lib/auth";
import { genReferralCode } from "@/lib/utils";

/**
 * Corporate referral code management. Corporate role only.
 *
 *   GET  → returns the caller's current active code (creates one if missing).
 *   POST → rotates the code: deactivates the old one (history preserved),
 *          issues a fresh PRAP-XXXXXX. A unique partial index enforces exactly
 *          one active code per corporate.
 */

async function ensureActiveCode(corporateId: string): Promise<string> {
  const admin = supabaseAdmin();
  const { data: existing } = await admin
    .from("referral_codes")
    .select("code")
    .eq("corporate_id", corporateId)
    .eq("active", true)
    .maybeSingle();
  if (existing?.code) return existing.code;

  for (let attempt = 0; attempt < 3; attempt++) {
    const code = genReferralCode();
    const { error } = await admin
      .from("referral_codes")
      .insert({ corporate_id: corporateId, code, active: true });
    if (!error) return code;
    if ((error as any).code !== "23505") throw error;
    // 23505: either code collision (retry) or an active row appeared (re-read).
    const { data: race } = await admin
      .from("referral_codes")
      .select("code")
      .eq("corporate_id", corporateId)
      .eq("active", true)
      .maybeSingle();
    if (race?.code) return race.code;
  }
  throw new Error("Could not allocate a referral code");
}

export async function GET() {
  const me = await requireUser();
  if (me.role !== "corporate") {
    return NextResponse.json({ ok: false, error: "Corporate accounts only" }, { status: 403 });
  }
  try {
    const code = await ensureActiveCode(me.authId);
    return NextResponse.json({ ok: true, code });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 });
  }
}

export async function POST() {
  const me = await requireUser();
  if (me.role !== "corporate") {
    return NextResponse.json({ ok: false, error: "Corporate accounts only" }, { status: 403 });
  }
  const admin = supabaseAdmin();
  // Deactivate any current active code first (frees the unique-active slot).
  await admin
    .from("referral_codes")
    .update({ active: false, rotated_at: new Date().toISOString() })
    .eq("corporate_id", me.authId)
    .eq("active", true);

  try {
    const code = await ensureActiveCode(me.authId);
    return NextResponse.json({ ok: true, code });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 });
  }
}
