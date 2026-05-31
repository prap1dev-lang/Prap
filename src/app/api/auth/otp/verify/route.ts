import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyOtp, Msg91Error, normalizeMobile } from "@/lib/msg91";
import { supabaseAdmin } from "@/lib/supabase-server";

const Body = z.object({
  phone: z.string().min(8),
  otp: z.string().regex(/^\d{4,8}$/),
  redirectTo: z.string().url().optional(),
  mode: z.enum(["signup", "login"]).optional().default("signup"),
});

/**
 * Verify MSG91 OTP. On success we sign the user into Supabase using a
 * magic-link generated server-side. The browser navigates to `actionLink`
 * which sets Supabase session cookies, then redirects to `redirectTo`.
 *
 * Login mode: 404 if the phone has never signed up.
 * Signup mode: auto-creates the auth user (idempotent).
 */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }
  const { phone, otp, redirectTo, mode } = parsed.data;

  try {
    const r = await verifyOtp(phone, otp);
    if (!r.ok) {
      return NextResponse.json({ ok: false, error: r.message || "Invalid OTP" }, { status: 422 });
    }
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "OTP verification failed" },
      { status: e instanceof Msg91Error ? 502 : 500 },
    );
  }

  const mobile = normalizeMobile(phone);
  const syntheticEmail = `phone-${mobile}@users.prap.in`;
  const admin = supabaseAdmin();

  // For login mode: require an existing auth user. For signup: auto-create.
  // (createUser is idempotent enough for our needs — duplicates throw, we ignore.)
  if (mode === "signup") {
    await admin.auth.admin
      .createUser({
        email: syntheticEmail,
        phone: `+${mobile}`,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: { source: "msg91_otp", phone: `+${mobile}` },
      })
      .catch(() => { /* already exists — fine */ });
  } else {
    // login mode — make sure the user actually exists first.
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
    const exists = list?.users?.some((u) => u.email === syntheticEmail);
    if (!exists) {
      // Fallback: try a direct lookup via the public.users table by phone.
      const { data: pub } = await admin
        .from("users")
        .select("id")
        .eq("phone", `+${mobile}`)
        .maybeSingle();
      if (!pub) {
        return NextResponse.json(
          { ok: false, error: "No account found for this phone. Please sign up first." },
          { status: 404 },
        );
      }
    }
  }

  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: syntheticEmail,
    options: redirectTo ? { redirectTo } : undefined,
  });

  if (linkErr || !linkData?.properties?.action_link) {
    return NextResponse.json(
      { ok: false, error: linkErr?.message || "Could not create session" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    actionLink: linkData.properties.action_link,
    phone: `+${mobile}`,
  });
}
