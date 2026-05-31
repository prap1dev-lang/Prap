import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase-server";
import { verifyPan, SurepassError } from "@/lib/surepass";

const Body = z.object({
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Invalid PAN"),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid PAN" }, { status: 400 });
  }

  const { data: { user } } = await supabaseServer().auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

  const admin = supabaseAdmin();
  try {
    const r = await verifyPan(parsed.data.pan);

    await admin.from("kyc_verifications").insert({
      user_id: user.id,
      kind: "pan",
      input: { pan: parsed.data.pan },
      ok: r.valid,
      response: r.raw,
    });

    if (r.valid) {
      await admin
        .from("users")
        .update({
          pan_verified: true,
          pan_verified_at: new Date().toISOString(),
          pan_full_name: r.fullName,
        })
        .eq("id", user.id);
    }

    return NextResponse.json({
      ok: true,
      valid: r.valid,
      fullName: r.fullName,
      aadhaarSeeded: r.aadhaarSeeded,
    });
  } catch (e: any) {
    const isSP = e instanceof SurepassError;
    await admin.from("kyc_verifications").insert({
      user_id: user.id,
      kind: "pan",
      input: { pan: parsed.data.pan },
      ok: false,
      response: isSP ? (e.detail as any) : null,
      error: e?.message || String(e),
    });
    return NextResponse.json({ ok: false, error: e?.message || "PAN verification failed" }, { status: 502 });
  }
}
