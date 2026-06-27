import { NextResponse } from "next/server";
import { z } from "zod";
import { firebaseAdmin } from "@/lib/firebase-admin";
import { supabaseAdmin } from "@/lib/supabase-server";
import { COIN } from "@/lib/coins";
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
  // PAN / Aadhaar / RERA are NO LONGER collected at signup — users complete KYC
  // (with documents) from their dashboard afterwards. Kept optional for any
  // older client that still sends them.
  pan: z.string().optional().default(""),
  aadhaar: z.string().optional().default(""),
  rera: z.string().optional().default(""),
  company: z.string().optional().default(""),
  // Creator social profiles (optional).
  instagram: z.string().optional().default(""),
  facebook: z.string().optional().default(""),
  youtube: z.string().optional().default(""),
  referralCode: z.string().optional().default(""),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
});

const Body = z.object({
  idToken: z.string().min(1),
  mode: z.enum(["signup", "login"]).optional().default("login"),
  // 'referrer' kept for back-compat with existing accounts.
  role: z.enum(["broker", "corporate", "creator", "builder", "individual", "referrer"]).optional(),
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
async function mintSession(userId: string) {
  const admin = supabaseAdmin();
  // Resolve the account's CURRENT auth email (may be the real email if the user
  // set a password with one, or the synthetic phone email otherwise).
  const { data: got } = await admin.auth.admin.getUserById(userId);
  const email = got?.user?.email;
  if (!email) throw new Error("Account has no email to sign in with");

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
  // Did THIS request create the auth user? If so and signup later fails, we must
  // delete it again — otherwise the phone is stuck with an auth user but no
  // profile row, and can neither sign up (create returns "exists") nor log in.
  let authUserCreatedNow = false;
  const created = await admin.auth.admin.createUser({
    email: syntheticEmail,
    phone,
    email_confirm: true,
    phone_confirm: true,
    user_metadata: { source: "firebase_phone", phone },
  });
  if (created.data?.user) {
    authUserId = created.data.user.id;
    authUserCreatedNow = true;
  } else {
    // Already exists (or a transient create error). The account's auth email may
    // now be the user's REAL email (set when they chose a password), so we resolve
    // by phone first (via the profile table), then fall back to the synthetic
    // email scan for legacy rows.
    const { data: byPhone } = await admin
      .from("users")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();
    authUserId = byPhone?.id ?? (await findAuthUserIdByEmail(admin, syntheticEmail));
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

  // Roll back a just-created auth user when signup can't complete, so the phone
  // isn't left half-registered (auth user with no profile = locked out).
  async function rollbackOrphanAuthUser() {
    if (authUserCreatedNow && authUserId) {
      const { error } = await admin.auth.admin.deleteUser(authUserId);
      if (error) console.error("[exchange] orphan auth user cleanup failed:", error.message);
    }
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
      await rollbackOrphanAuthUser();
      return NextResponse.json(
        { ok: false, error: "No account found for this phone. Please sign up first." },
        { status: 404 },
      );
    }
    if (!role || !profile) {
      await rollbackOrphanAuthUser();
      return NextResponse.json(
        { ok: false, error: "Missing signup details." },
        { status: 400 },
      );
    }

    // ---- Email uniqueness: one email = one account ----
    // Block a second phone number from signing up with an email already in use
    // by a different account. The DB has a UNIQUE(email) constraint, but we check
    // here first to (a) give a clear message and (b) avoid leaving an orphaned
    // Supabase auth user behind when the later insert would fail.
    if (profile.email) {
      const { data: emailOwners } = await admin
        .from("users")
        .select("id")
        .ilike("email", profile.email)
        .limit(1);
      const emailOwner = emailOwners?.[0];
      if (emailOwner && emailOwner.id !== authUserId) {
        await rollbackOrphanAuthUser();
        return NextResponse.json(
          { ok: false, error: "An account already exists with this email. Please log in instead." },
          { status: 409 },
        );
      }
    }

    // KYC identity is now optional at signup (completed later from the dashboard).
    const aadhaarHash = profile.aadhaar ? await sha256Hex(profile.aadhaar) : null;
    const aadhaarLast4 = profile.aadhaar ? profile.aadhaar.slice(-4) : null;

    // ---- Referral resolution: ANY user's code can refer ANY new user ----
    let referrerId: string | null = null;
    let referrerIsCorporate = false;
    if (profile.referralCode) {
      const owner = await lookupReferralOwner(profile.referralCode);
      if (!owner) {
        await rollbackOrphanAuthUser();
        return NextResponse.json(
          { ok: false, error: "Invalid or inactive referral code." },
          { status: 400 },
        );
      }
      // Self-referral block: only the SAME account or the SAME Aadhaar identity
      // is treated as self. (PAN/phone alone are NOT used — a shared PAN across
      // test accounts or family phones must not block a legitimate referral.)
      const samePerson =
        owner.id === authUserId ||
        (owner.aadhaar_hash && owner.aadhaar_hash === aadhaarHash);
      if (samePerson) {
        await rollbackOrphanAuthUser();
        return NextResponse.json(
          { ok: false, error: "You cannot use your own referral code." },
          { status: 400 },
        );
      }
      referrerId = owner.id;
      referrerIsCorporate = owner.role === "corporate";
    }

    const hasPassword = !!profile.password;

    const { error: insertUserErr } = await admin.from("users").insert({
      id: authUserId,
      role,
      name: profile.name,
      phone: profile.phone,
      email: profile.email || null,
      pan: profile.pan || null,
      aadhaar_hash: aadhaarHash,
      aadhaar_last4: aadhaarLast4,
      rera_number: profile.rera || null,
      company: profile.company || null,
      // Creator social profiles (optional).
      instagram: profile.instagram || null,
      facebook: profile.facebook || null,
      youtube: profile.youtube || null,
      referred_by: referrerId,
      // Keep employer attribution only when the referrer is a corporate.
      referred_by_corporate: referrerIsCorporate ? referrerId : null,
      kyc_status: "pending",
      has_password: hasPassword,
      password_set_at: hasPassword ? new Date().toISOString() : null,
    });

    if (insertUserErr) {
      const e = insertUserErr as any;
      console.error("[exchange] users insert failed:", e);
      const isDup = e.code === "23505";
      await rollbackOrphanAuthUser();
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
      await rollbackOrphanAuthUser();
      return NextResponse.json({ ok: false, error: (ledgerErr as any).message }, { status: 500 });
    }

    // Set the chosen password on the Supabase auth user (bcrypt-hashed by
    // Supabase). Login resolves the account by phone, then signInWithPassword.
    // If a real email was given, also set it as the auth email so password-reset
    // links are deliverable — but a password is set regardless of email outcome.
    if (hasPassword) {
      // 1) Always set the password.
      const { error: pwErr } = await admin.auth.admin.updateUserById(authUserId, {
        password: profile.password!,
      });
      if (pwErr) {
        console.error("[exchange] set password failed:", pwErr.message);
        await admin
          .from("users")
          .update({ has_password: false, password_set_at: null })
          .eq("id", authUserId);
      } else if (profile.email) {
        // 2) Best-effort: promote the auth email to the real email (for resets).
        //    Skip silently if that email is already taken by another account.
        const { error: emailErr } = await admin.auth.admin.updateUserById(authUserId, {
          email: profile.email,
          email_confirm: true,
        });
        if (emailErr) {
          console.warn("[exchange] could not set real auth email:", emailErr.message);
          // Password still works; reset email just won't be deliverable until the
          // user sets a unique email in Settings.
        }
      }
    }

    // Every new user gets their own referral code so they can refer others.
    try {
      await ensureReferralCode(authUserId);
    } catch (e: any) {
      console.error("[exchange] ensureReferralCode failed:", e?.message);
      // non-fatal: user can still operate; code can be created on demand later
    }

    // ---- Referral reward: ONLY the sharer (referrer) earns coins, and only for
    //      their first REFERRAL_MAX_REWARDED (5) successful referrals. The new
    //      user does NOT get a separate referral bonus — just onboarding coins.
    if (referrerId) {
      try {
        // Count the referrer's already-rewarded signups (this new user is already
        // inserted with referred_by = referrerId, so subtract 1 for "before").
        const { count } = await admin
          .from("users")
          .select("id", { count: "exact", head: true })
          .eq("referred_by", referrerId);
        const priorReferrals = Math.max(0, (count ?? 1) - 1);

        if (priorReferrals < COIN.REFERRAL_MAX_REWARDED) {
          await creditCoins(admin, referrerId, COIN.REFERRAL_BONUS, "referral_bonus", {
            notes: `Referral reward — invited ${profile.name}`,
            refTable: "users",
            refId: authUserId,
          });
        } else {
          console.info(`[exchange] referrer ${referrerId} past ${COIN.REFERRAL_MAX_REWARDED}-referral cap — no bonus`);
        }
      } catch (e: any) {
        console.error("[exchange] referral bonus credit failed:", e?.message);
        // non-fatal: onboarding already succeeded
      }
    }

    // PAN is stored as a plain profile detail — no external verification.
    createdProfile = true;
  }

  // ---- 4. Mint a Supabase session and return tokens ----
  let session;
  try {
    session = await mintSession(authUserId);
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
