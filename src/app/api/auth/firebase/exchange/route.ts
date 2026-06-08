import { NextResponse } from "next/server";
import { z } from "zod";
import { firebaseAdmin } from "@/lib/firebase-admin";
import { supabaseAdmin } from "@/lib/supabase-server";

const Body = z.object({
  idToken: z.string().min(1),
  redirectTo: z.string().url().optional(),
  mode: z.enum(["signup", "login"]).optional().default("signup"),
});

/**
 * Exchange a Firebase Phone Auth ID token for a Supabase session.
 * 1. Verify the Firebase ID token (proves phone ownership).
 * 2. Extract the phone number from the decoded token.
 * 3. Create or look up the Supabase auth user (same synthetic-email pattern).
 * 4. Return a Supabase magic-link action_link for the browser to follow.
 */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const { idToken, redirectTo, mode } = parsed.data;

  let phone: string;
  try {
    const decoded = await firebaseAdmin().verifyIdToken(idToken);
    if (!decoded.phone_number) {
      return NextResponse.json({ ok: false, error: "Token has no phone number" }, { status: 422 });
    }
    phone = decoded.phone_number; // e.g. "+919876543210"
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Invalid Firebase token" },
      { status: 401 },
    );
  }

  // Strip leading + and country code for the 10-digit mobile
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
        user_metadata: { source: "firebase_phone", phone },
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

  return NextResponse.json({ ok: true, actionLink: linkData.properties.action_link, phone });
}
