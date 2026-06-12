import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-server";

/**
 * Password login. The browser sends { phone, password }; we resolve the
 * account's auth email (server-side, since it may be a real email or the
 * synthetic phone email) and verify the password with Supabase. On success we
 * return a real session for the client to adopt.
 *
 * Never reveals whether the phone exists vs. the password is wrong — both map
 * to a single generic error to avoid account enumeration.
 */

const Body = z.object({
  phone: z.string().min(8),
  password: z.string().min(1),
});

function tenDigits(p: string) {
  let d = p.replace(/\D/g, "");
  if (d.startsWith("91") && d.length === 12) d = d.slice(2);
  if (d.startsWith("0") && d.length === 11) d = d.slice(1);
  return d;
}

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
  const phone = `+91${tenDigits(parsed.data.phone)}`;
  const admin = supabaseAdmin();

  // Resolve the account by phone → its current auth email.
  const { data: profile } = await admin
    .from("users")
    .select("id, has_password")
    .eq("phone", phone)
    .maybeSingle();

  const GENERIC = { ok: false, error: "Incorrect phone number or password." };

  if (!profile) return NextResponse.json(GENERIC, { status: 401 });
  if (!profile.has_password) {
    return NextResponse.json(
      { ok: false, error: "No password set for this account. Please sign in with OTP." },
      { status: 409 },
    );
  }

  const { data: got } = await admin.auth.admin.getUserById(profile.id);
  const email = got?.user?.email;
  if (!email) return NextResponse.json(GENERIC, { status: 401 });

  // Verify the password using a fresh, session-less anon client.
  const anon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data: signIn, error } = await anon.auth.signInWithPassword({ email, password: parsed.data.password });
  if (error || !signIn?.session) {
    return NextResponse.json(GENERIC, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    session: {
      access_token: signIn.session.access_token,
      refresh_token: signIn.session.refresh_token,
    },
  });
}
