import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";

/**
 * Flag that the signed-in user now has a password. Called after a successful
 * password reset / set-password. The password itself lives in Supabase Auth.
 */
export async function POST() {
  const me = await requireUser();
  const admin = supabaseAdmin();
  const { error } = await admin
    .from("users")
    .update({ has_password: true, password_set_at: new Date().toISOString() })
    .eq("id", me.authId);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
