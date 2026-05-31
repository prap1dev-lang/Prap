import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyWidgetAccessToken, WidgetVerifyError } from "@/lib/msg91-widget";
import { normalizeMobile } from "@/lib/msg91";
import { supabaseAdmin } from "@/lib/supabase-server";

const Body = z.object({
  phone: z.string().min(8),
  accessToken: z.string().min(10),
  redirectTo: z.string().url().optional(),
  mode: z.enum(["signup", "login"]).optional().default("signup"),
});

/**
 * 1. Verify the MSG91 widget access-token (proves the phone was OTP-verified).
 * 2. Find-or-create a Supabase auth user keyed by phone (synthetic email).
 * 3. Generate a magic-link the browser follows to set session cookies, then
 *    redirect to `redirectTo` (typically /auth/complete for signup or /dashboard
 *    for login).
 */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }
  const { phone, accessToken, redirectTo, mode } = parsed.data;

  // Step 1: validate the access-token with MSG91 (security-critical).
  // Dev bypass: accept the placeholder token from the client-side bypass.
  const devBypass = process.env.MSG91_DEV_BYPASS === "true";
  if (devBypass && accessToken === "dev-bypass-token") {
    console.warn(`[MSG91 DEV BYPASS] /api/auth/widget/verify accepting bypass token for ${phone}`);
  } else {
    try {
      await verifyWidgetAccessToken(accessToken);
    } catch (e: any) {
      const isW = e instanceof WidgetVerifyError;
      return NextResponse.json(
        {
          ok: false,
          error: e?.message || "Phone verification failed",
          provider: isW ? { name: "msg91-widget", status: e.status, detail: e.detail } : undefined,
        },
        { status: isW ? 502 : 500 },
      );
    }
  }

  // Step 2: ensure the Supabase auth user exists for this phone.
  const mobile = normalizeMobile(phone);
  const syntheticEmail = `phone-${mobile}@users.prap.in`;
  const admin = supabaseAdmin();

  if (mode === "signup") {
    await admin.auth.admin
      .createUser({
        email: syntheticEmail,
        phone: `+${mobile}`,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: { source: "msg91_widget", phone: `+${mobile}` },
      })
      .catch(() => { /* already exists — fine */ });
  } else {
    // Login mode — require an existing account.
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

  // Step 3: issue a magic link.
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
