import { NextResponse } from "next/server";
import { z } from "zod";
import { firebaseAdmin } from "@/lib/firebase-admin";
import { supabaseAdmin } from "@/lib/supabase-server";
import { COIN } from "@/lib/coins";
import { verifyPan } from "@/lib/surepass";
import { ensureReferralCode, lookupReferralOwner, creditCoins } from "@/lib/referrals";

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

type Admin = ReturnType<typeof supabaseAdmin>;

/** Find a Supabase auth user id by email, paging through the directory. */
async function findAuthUserIdByEmail(admin: Admin, email: string): Promise<string | null> {
  const target = email.toLowerCase();
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      console.error("[exchange] listUsers failed:", error.message);
      return null;
    }
    const hit = data?.users?.find((u) => (u.email || "").toLowerCase() === target);
    if (hit) return hit.id;
    if (!data?.users || data.users.length < 200) break; // last page
  }
  return null;
}

/**
 * Mint a Supabase session (access + refresh token) for an existing auth user.
 *
 * We generate a magic-link token server-side (no email is sent) and exchange
 * its `email_otp` for a real session via GoTrue's /verify endpoint. Using
 * `type=magiclink` with the hashed_token can 401 depending on project email
 * settings, so we verify with the plain `email_otp` + email pair, which is
 * independent of SMTP/redirect configuration.
 */
async function mintSession(email: string) {
  const admin = supabaseAdmin();
  const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (linkErr || !link?.properties?.email_otp) {
    throw new Error(linkErr?.message || "Could not generate session token");
  }

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Primary: verify the email_otp (config-independent).
  let res = await fetch(`${base}/auth/v1/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: anon },
    body: JSON.stringify({ type: "email", email, token: link.properties.email_otp }),
  });
  let session = await res.json().catch(() => ({}));

  // Fallback: hashed-token magic-link verify (older GoTrue behaviour).
  if ((!res.ok || !session.access_token) && link.properties.hashed_token) {
    res = await fetch(`${base}/auth/v1/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: anon },
      body: JSON.stringify({ type: "magiclink", token_hash: link.properties.hashed_token }),
    });
    session = await res.json().catch(() => ({}));
  }

  if (!res.ok || !session.access_token || !session.refresh_token) {
    const detail = session?.msg || session?.error_description || session?.error || `HTTP ${res.status}`;
    throw new Error(`Could not establish session: ${detail}`);
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
    // Already exists (or a transient create error) — find the user by email,
    // paging through the directory so this keeps working past 1000 accounts.
    authUserId = await findAuthUserIdByEmail(admin, syntheticEmail);
  }
  if (!authUserId) {
    console.error("[exchange] could not resolve auth user", {
      syntheticEmail,
      createError: created.error?.message,
    });
    return NextResponse.json(
      { ok: false, error: created.error?.message || "Could not resolve account" },
      { status: 500 },
    );
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

    // ---- Referral resolution: ANY user's code can refer ANY new user ----
    let referrerId: string | null = null;
    let referrerIsCorporate = false;
    if (profile.referralCode) {
      const owner = await lookupReferralOwner(profile.referralCode);
      if (!owner) {
        return NextResponse.json(
          { ok: false, error: "Invalid or inactive referral code." },
          { status: 400 },
        );
      }
      // Self-referral block: same account, or shared PAN / phone (same human).
      const samePerson =
        owner.id === authUserId ||
        (owner.pan && owner.pan === profile.pan) ||
        (owner.phone && owner.phone === profile.phone);
      if (samePerson) {
        return NextResponse.json(
          { ok: false, error: "You cannot use your own referral code." },
          { status: 400 },
        );
      }
      referrerId = owner.id;
      referrerIsCorporate = owner.role === "corporate";
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
      referred_by: referrerId,
      // Keep employer attribution only when the referrer is a corporate.
      referred_by_corporate: referrerIsCorporate ? referrerId : null,
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

    // Every new user gets their own referral code so they can refer others.
    try {
      await ensureReferralCode(authUserId);
    } catch (e: any) {
      console.error("[exchange] ensureReferralCode failed:", e?.message);
      // non-fatal: user can still operate; code can be created on demand later
    }

    // ---- Dual referral reward: BOTH parties get a fixed bonus (best-effort) ----
    if (referrerId) {
      try {
        await creditCoins(admin, authUserId, COIN.REFERRAL_BONUS, "referral_bonus", {
          notes: "Referral signup bonus",
          refTable: "users",
          refId: referrerId,
        });
        await creditCoins(admin, referrerId, COIN.REFERRAL_BONUS, "referral_bonus", {
          notes: `Referral reward — invited ${profile.name}`,
          refTable: "users",
          refId: authUserId,
        });
      } catch (e: any) {
        console.error("[exchange] referral bonus credit failed:", e?.message);
        // non-fatal: onboarding already succeeded
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
