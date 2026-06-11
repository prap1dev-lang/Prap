import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase-server";
import { COIN } from "@/lib/coins";
import { verifyPan } from "@/lib/surepass";

const Body = z.object({
  role: z.enum(["broker", "corporate", "referrer"]),
  profile: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(8),
    pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "PAN format invalid"),
    aadhaar: z.string().length(12).regex(/^\d{12}$/, "Aadhaar must be 12 digits"),
    rera: z.string().optional().default(""),
    referralCode: z.string().optional().default(""),
  }),
});

async function sha256Hex(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }
  const { role, profile } = parsed.data;

  const sb = supabaseServer();
  const { data: { user }, error: authErr } = await sb.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  const aadhaarHash  = await sha256Hex(profile.aadhaar);
  const aadhaarLast4 = profile.aadhaar.slice(-4);

  const admin = supabaseAdmin();

  let referredByCorporate: string | null = null;
  if (role === "referrer" && profile.referralCode) {
    const { data: refRow } = await admin
      .from("referral_codes")
      .select("corporate_id")
      .eq("code", profile.referralCode)
      .eq("active", true)
      .maybeSingle();
    referredByCorporate = (refRow as any)?.corporate_id ?? null;
  }

  const { error: insertUserErr } = await admin.from("users").insert({
    id: user.id,
    role,
    name: profile.name,
    phone: profile.phone,
    email: profile.email,
    pan: profile.pan,
    aadhaar_hash: aadhaarHash,
    aadhaar_last4: aadhaarLast4,
    rera_number: profile.rera || null,
    referred_by_corporate: referredByCorporate,
    kyc_status: "pending",
  });

  if (insertUserErr) {
    console.error("[verify] users insert failed:", insertUserErr);
    // 23505 = unique violation (phone/email already used)
    const isDup = (insertUserErr as any).code === "23505";
    const e = insertUserErr as any;
    return NextResponse.json(
      {
        ok: false,
        error: isDup
          ? "An account already exists for this phone or email."
          : `${e.message}${e.details ? ` — ${e.details}` : ""}${e.hint ? ` (${e.hint})` : ""}`,
        code: e.code,
      },
      { status: isDup ? 409 : 400 },
    );
  }

  const { error: ledgerErr } = await admin.from("coin_ledger").insert({
    user_id: user.id,
    source: "onboarding",
    delta: COIN.ONBOARDING_BONUS,
    balance_after: COIN.ONBOARDING_BONUS,
    notes: "Welcome to PRAP",
  });

  if (ledgerErr) {
    console.error("[verify] coin_ledger insert failed:", ledgerErr);
    // best-effort cleanup so user isn't left half-created
    await admin.from("users").delete().eq("id", user.id);
    const e = ledgerErr as any;
    return NextResponse.json(
      { ok: false, error: `${e.message}${e.details ? ` — ${e.details}` : ""}`, code: e.code },
      { status: 500 },
    );
  }

  if (role === "corporate") {
    const code = "PRAP-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    await admin.from("referral_codes").insert({ corporate_id: user.id, code, active: true });
  }

  // ---- Surepass: best-effort PAN verification (non-blocking) ----
  // If this fails (provider down, bad token, plan mismatch) the signup still
  // succeeds; PAN flag stays false and the admin can retry from the user page.
  let panResult: { valid: boolean; fullName: string | null } | null = null;
  try {
    const r = await verifyPan(profile.pan);
    panResult = { valid: r.valid, fullName: r.fullName };
    await admin.from("kyc_verifications").insert({
      user_id: user.id,
      kind: "pan",
      input: { pan: profile.pan },
      ok: r.valid,
      response: r.raw,
    });
    if (r.valid) {
      await admin
        .from("users")
        .update({
          pan_verified: true,
          pan_verified_at: new Date().toISOString(),
          pan_full_name: r.fullName,
        })
        .eq("id", user.id);
    }
  } catch (e: any) {
    await admin.from("kyc_verifications").insert({
      user_id: user.id,
      kind: "pan",
      input: { pan: profile.pan },
      ok: false,
      error: e?.message,
    });
  }

  return NextResponse.json({
    ok: true,
    user: { id: user.id, role, kyc_status: "pending" },
    bonus: { type: "onboarding", coins: COIN.ONBOARDING_BONUS },
    pan: panResult,
  });
}
