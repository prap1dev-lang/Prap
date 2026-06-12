import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";

/**
 * Read & update the signed-in user's editable profile fields.
 * Phone, PAN and Aadhaar identity hashes are immutable (KYC anchors);
 * the user may edit name, email, RERA, and payout details.
 */

const Update = z.object({
  name: z.string().min(2, "Name is too short").optional(),
  email: z.string().email("Invalid email").or(z.literal("")).optional(),
  rera_number: z.string().max(40).optional(),
  upi_id: z.string().max(80).optional(),
  bank_account: z.string().max(40).optional(),
  bank_ifsc: z.string().max(20).optional(),
});

export async function GET() {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });

  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("users")
    .select(
      "name, email, phone, pan, role, rera_number, upi_id, bank_account, bank_ifsc, pan_verified, aadhaar_verified, rera_verified",
    )
    .eq("id", me.authId)
    .maybeSingle();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, profile: data });
}

export async function PATCH(req: Request) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });

  const parsed = Update.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  // Drop undefined keys so we only update what was sent.
  const patch: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(parsed.data)) {
    if (v !== undefined) patch[k] = v === "" ? null : v;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "Nothing to update" }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("users")
    .update(patch)
    .eq("id", me.authId)
    .select("name, email, rera_number, upi_id, bank_account, bank_ifsc")
    .maybeSingle();

  if (error) {
    const e = error as any;
    const isDup = e.code === "23505";
    return NextResponse.json(
      { ok: false, error: isDup ? "That email is already in use." : e.message },
      { status: isDup ? 409 : 500 },
    );
  }

  return NextResponse.json({ ok: true, profile: data });
}
