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

  try {
    const parsed = Body.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      console.error("[test-login] Parse error:", parsed.error.flatten());
      return NextResponse.json(
        { ok: false, error: "Invalid phone format. Use +919876543210 format." },
        { status: 400 }
      );
    }

    const { phone, redirectTo, mode } = parsed.data;

    const digits = phone.replace(/^\+/, "");
    const syntheticEmail = `phone-${digits}@users.prap.in`;
    const admin = supabaseAdmin();

    // For test login in development: auto-create user if doesn't exist
    const createResult = await admin.auth.admin.createUser({
      email: syntheticEmail,
      phone,
      email_confirm: true,
      phone_confirm: true,
      user_metadata: { source: "test_login", phone },
    }).catch((err) => {
      // Already exists is fine, but log other errors
      if (!err?.message?.includes("already exists")) {
        console.error("[test-login] Create user error:", err);
      }
      return { data: null, error: null };
    });

    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: syntheticEmail,
      options: redirectTo ? { redirectTo } : undefined,
    });

    if (linkErr) {
      console.error("[test-login] Generate link error:", linkErr);
      return NextResponse.json(
        { ok: false, error: linkErr?.message || "Could not create session" },
        { status: 500 }
      );
    }

    if (!linkData?.properties?.action_link) {
      console.error("[test-login] No action link in response:", linkData);
      return NextResponse.json(
        { ok: false, error: "Could not generate login link" },
        { status: 500 }
      );
    }

    console.log("[test-login] Success for", phone);
    return NextResponse.json({ ok: true, actionLink: linkData.properties.action_link, phone });
  } catch (e: any) {
    console.error("[test-login] Unexpected error:", e);
    return NextResponse.json(
      { ok: false, error: e?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
