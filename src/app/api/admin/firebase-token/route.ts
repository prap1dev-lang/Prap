import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { firebaseAdmin } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

// Mints a short-lived Firebase custom token with an `admin` claim for the
// currently-authenticated Supabase admin. The browser exchanges this for a
// Firebase session (signInWithCustomToken) so it can upload directly to
// Firebase Storage under rules that require request.auth.token.admin == true.
export async function POST() {
  let me;
  try {
    me = await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = await firebaseAdmin().createCustomToken(`admin:${me.authId}`, {
      admin: true,
    });
    return NextResponse.json({ ok: true, token });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to mint token" },
      { status: 500 },
    );
  }
}
