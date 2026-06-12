import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";

/**
 * Set or change the signed-in user's account password.
 *
 * The password is stored (bcrypt) in Supabase Auth via the admin API; we only
 * flip the has_password flag in our profile table. Plaintext is never stored.
 *
 * If the user already has a password, the current one must be supplied and
 * verified before it can be changed.
 */

const Body = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  currentPassword: z.string().optional(),
});

export async function POST(req: Request) {
  const me = await requireUser();
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten().fieldErrors.newPassword?.[0] || "Invalid request" },
      { status: 400 },
    );
  }
  const { newPassword, currentPassword } = parsed.data;
  const admin = supabaseAdmin();

  // Does the user already have a password?
  const { data: profile } = await admin
    .from("users")
    .select("has_password")
    .eq("id", me.authId)
    .maybeSingle();

  const { data: got } = await admin.auth.admin.getUserById(me.authId);
  const email = got?.user?.email;
  if (!email) {
    return NextResponse.json({ ok: false, error: "Account has no login email." }, { status: 500 });
  }

  // Changing an existing password requires verifying the current one.
  if (profile?.has_password) {
    if (!currentPassword) {
      return NextResponse.json({ ok: false, error: "Enter your current password." }, { status: 400 });
    }
    const { createClient } = await import("@supabase/supabase-js");
    const anon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { error: verifyErr } = await anon.auth.signInWithPassword({ email, password: currentPassword });
    if (verifyErr) {
      return NextResponse.json({ ok: false, error: "Current password is incorrect." }, { status: 401 });
    }
  }

  const { error: pwErr } = await admin.auth.admin.updateUserById(me.authId, { password: newPassword });
  if (pwErr) {
    return NextResponse.json({ ok: false, error: pwErr.message }, { status: 500 });
  }

  await admin
    .from("users")
    .update({ has_password: true, password_set_at: new Date().toISOString() })
    .eq("id", me.authId);

  return NextResponse.json({ ok: true });
}
