import { NextResponse } from "next/server";
import { z } from "zod";
import { firebaseAdmin } from "@/lib/firebase-admin";
import { supabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/**
 * Phone-OTP password reset (no email link).
 *
 *   1. The browser verifies the phone via Firebase OTP and sends the idToken.
 *   2. We verify that token (proves phone ownership), resolve the account by
 *      phone, and set the new password on the Supabase auth user.
 *
 * The user can then sign in with their phone + the new password.
 */

const Body = z.object({
  idToken: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }
  const { idToken, password } = parsed.data;

  // 1. Verify the Firebase OTP token → trusted phone number.
  let phone: string;
  try {
    const decoded = await firebaseAdmin().verifyIdToken(idToken);
    if (!decoded.phone_number) {
      return NextResponse.json({ ok: false, error: "Token has no phone number" }, { status: 422 });
    }
    phone = decoded.phone_number;
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Invalid OTP token" }, { status: 401 });
  }

  // 2. Resolve the account by phone.
  const admin = supabaseAdmin();
  const { data: user } = await admin
    .from("users")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "No account found for this phone. Please sign up first." },
      { status: 404 },
    );
  }

  // 3. Set the new password + mark the account as password-enabled.
  const { error: pwErr } = await admin.auth.admin.updateUserById(user.id, { password });
  if (pwErr) {
    return NextResponse.json({ ok: false, error: pwErr.message }, { status: 500 });
  }
  await admin
    .from("users")
    .update({ has_password: true, password_set_at: new Date().toISOString() })
    .eq("id", user.id);

  return NextResponse.json({ ok: true });
}
