import { NextResponse } from "next/server";
import { z } from "zod";
import { firebaseAdmin } from "@/lib/firebase-admin";
import { supabaseAdmin } from "@/lib/supabase-server";
import { COIN } from "@/lib/coins";
import { verifyPan } from "@/lib/surepass";
import { genReferralCode } from "@/lib/utils";

/**
 * Firebase-OTP-only auth. No Supabase magic link, no redirect dance.
 *
 *   1. Verify the Firebase ID token (proves phone ownership).
 *   2. Create or look up the Supabase auth user.
 *   3. On signup: create the public.users row + onboarding coins +
 *      referral code (best-effort PAN verify).
 *   4. Mint a real Supabase session server-side and return the tokens.
 *
 * The browser just calls supabase.auth.setSession(tokens) and navigates.
 */

const Profile = z.object({
  name: z.string().min(2),
  email: z.string().email().or(z.literal("")).optional().default(""),
  phone: z.string().min(8),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "PAN format invalid"),
  aadhaar: z.string().length(12).regex(/^\d{12}$/, "Aadhaar must be 12 digits"),
  rera: z.string().optional().default(""),
  referralCode: z.string().optional().default(""),
});

const Body = z.object({
  idToken: z.string().min(1),
  mode: z.enum(["signup", "login"]).optional().default("login"),
  role: z.enum(["broker", "corporate", "referrer"]).optional(),
  profile: Profile.optional(),
});

async function sha256Hex(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Mint a Supabase session (access + refresh token) for an existing auth user. */
async function mintSession(email: string) {
  const admin = supabaseAdmin();
  const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (linkErr || !link?.properties?.hashed_token) {
    throw new Error(linkErr?.message || "Could not generate session token");
  }

  // Exchange the hashed token for a real session via the GoTrue verify endpoint.
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const res = await fetch(`${base}/auth/v1/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: anon },
    body: JSON.stringify({ type: "magiclink", token_hash: link.properties.hashed_token }),
  });
  const session = await res.json();
  if (!res.ok || !session.access_token || !session.refresh_token) {
    throw new Error(session?.msg || session?.error_description || "Could not establish session");
  }
  return {
    access_token: session.access_token as string,
    refresh_token: session.refresh_token as string,
  };
}

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }
  const { idToken, mode, role, profile } = parsed.data;

  // ---- 1. Verify Firebase token ----
  let phone: string;
  try {
    const decoded = await firebaseAdmin().verifyIdToken(idToken);
    if (!decoded.phone_number) {
      return NextResponse.json({ ok: false, error: "Token has no phone number" }, { status: 422 });
    }
    phone = decoded.phone_number; // e.g. "+918448945837"
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Invalid Firebase token" },
      { status: 401 },
    );
  }

  const digits = phone.replace(/^\+/, "");
  const syntheticEmail = `phone-${digits}@users.prap.in`;
  const admin = supabaseAdmin();

  // ---- 2. Create or look up the Supabase auth user ----
  let authUserId: string | null = null;
  const created = await admin.auth.admin.createUser({
    email: syntheticEmail,
    phone,
    email_confirm: true,
    phone_confirm: true,
    user_metadata: { source: "firebase_phone", phone },
  });
  if (created.data?.user) {
    authUserId = created.data.user.id;
  } else {
    // Already exists — find it.
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    authUserId = list?.users?.find((u) => u.email === syntheticEmail)?.id ?? null;
  }
  if (!authUserId) {
    return NextResponse.json({ ok: false, error: "Could not resolve account" }, { status: 500 });
  }

  // ---- 3. Profile row (signup) / existence check (login) ----
  const { data: existing } = await admin
    .from("users")
    .select("id, role")
    .eq("id", authUserId)
    .maybeSingle();

  let createdProfile = false;

  if (!existing) {
    if (mode === "login") {
      return NextResponse.json(
        { ok: false, error: "No account found for this phone. Please sign up first." },
        { status: 404 },
      );
    }
    if (!role || !profile) {
      return NextResponse.json(
        { ok: false, error: "Missing signup details." },
        { status: 400 },
      );
    }

    const aadhaarHash = await sha256Hex(profile.aadhaar);
    const aadhaarLast4 = profile.aadhaar.slice(-4);

    let referredByCorporate: string | null = null;
    if (role === "referrer" && profile.referralCode) {
      const code = profile.referralCode.trim().toUpperCase();
      const { data: refRow } = await admin
        .from("referral_codes")
        .select("corporate_id, corporate:users!referral_codes_corporate_id_fkey ( id, role, pan, phone )")
        .eq("code", code)
        .eq("active", true)
        .maybeSingle();

      const corp = (refRow as any)?.corporate;
      if (!refRow || !corp || corp.role !== "corporate") {
        return NextResponse.json(
          { ok: false, error: "Invalid or inactive referral code." },
          { status: 400 },
        );
      }
      // Self-referral block: can't refer your own (would-be) account, and the
      // corporate can't share the referrer's PAN or phone (same human).
      const samePerson =
        corp.id === authUserId ||
        (corp.pan && corp.pan === profile.pan) ||
        (corp.phone && corp.phone === profile.phone);
      if (samePerson) {
        return NextResponse.json(
          { ok: false, error: "You cannot use your own referral code." },
          { status: 400 },
        );
      }
      referredByCorporate = corp.id;
    }

    const { error: insertUserErr } = await admin.from("users").insert({
      id: authUserId,
      role,
      name: profile.name,
      phone: profile.phone,
      email: profile.email || null,
      pan: profile.pan,
      aadhaar_hash: aadhaarHash,
      aadhaar_last4: aadhaarLast4,
      rera_number: profile.rera || null,
      referred_by_corporate: referredByCorporate,
      kyc_status: "pending",
    });

    if (insertUserErr) {
      const e = insertUserErr as any;
      console.error("[exchange] users insert failed:", e);
      const isDup = e.code === "23505";
      return NextResponse.json(
        {
          ok: false,
          error: isDup
            ? "An account already exists for this phone or email."
            : `${e.message}${e.details ? ` — ${e.details}` : ""}${e.hint ? ` (${e.hint})` : ""}`,
        },
        { status: isDup ? 409 : 400 },
      );
    }

    const { error: ledgerErr } = await admin.from("coin_ledger").insert({
      user_id: authUserId,
      source: "onboarding",
      delta: COIN.ONBOARDING_BONUS,
      balance_after: COIN.ONBOARDING_BONUS,
      notes: "Welcome to PRAP",
    });
    if (ledgerErr) {
      console.error("[exchange] coin_ledger insert failed:", ledgerErr);
      await admin.from("users").delete().eq("id", authUserId);
      return NextResponse.json({ ok: false, error: (ledgerErr as any).message }, { status: 500 });
    }

    if (role === "corporate") {
      // Retry once on the unlikely code collision (unique on code).
      for (let attempt = 0; attempt < 2; attempt++) {
        const { error: codeErr } = await admin
          .from("referral_codes")
          .insert({ corporate_id: authUserId, code: genReferralCode(), active: true });
        if (!codeErr) break;
        if ((codeErr as any).code !== "23505") {
          console.error("[exchange] referral_code insert failed:", codeErr);
          break; // non-fatal: corporate can rotate a code later
        }
      }
    }

    // best-effort PAN verification (non-blocking)
    try {
      const r = await verifyPan(profile.pan);
      await admin.from("kyc_verifications").insert({
        user_id: authUserId,
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
          .eq("id", authUserId);
      }
    } catch (e: any) {
      await admin.from("kyc_verifications").insert({
        user_id: authUserId,
        kind: "pan",
        input: { pan: profile.pan },
        ok: false,
        error: e?.message,
      });
    }

    createdProfile = true;
  }

  // ---- 4. Mint a Supabase session and return tokens ----
  let session;
  try {
    session = await mintSession(syntheticEmail);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Could not sign in" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    phone,
    createdProfile,
    role: existing?.role ?? role ?? null,
    session,
  });
}
