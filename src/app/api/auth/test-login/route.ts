import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-server";

const Body = z.object({
  phone: z.string().regex(/^\+91\d{10}$/),
  redirectTo: z.string().url().optional(),
  mode: z.enum(["signup", "login"]).optional().default("login"),
});

/**
 * Test login endpoint for development — accepts test OTP 123456
 * Bypasses Firebase verification and directly creates/finds user and session
 */
export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { ok: false, error: "Test endpoint not available in production" },
      { status: 403 }
    );
  }

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const { phone, redirectTo, mode } = parsed.data;

  const digits = phone.replace(/^\+/, "");
  const syntheticEmail = `phone-${digits}@users.prap.in`;
  const admin = supabaseAdmin();

  if (mode === "signup") {
    await admin.auth.admin
      .createUser({
        email: syntheticEmail,
        phone,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: { source: "test_login", phone },
      })
      .catch(() => { /* already exists — fine */ });
  } else {
    // login: ensure user exists
    const { data: pub } = await admin
      .from("users")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    if (!pub) {
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
      const exists = list?.users?.some((u) => u.email === syntheticEmail);
      if (!exists) {
        return NextResponse.json(
          { ok: false, error: "No account found for this phone. Please sign up first." },
          { status: 404 }
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
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, actionLink: linkData.properties.action_link, phone });
}
