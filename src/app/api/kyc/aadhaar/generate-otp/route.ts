import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase-server";
import { aadhaarGenerateOtp, SurepassError } from "@/lib/surepass";

const Body = z.object({
  aadhaar: z.string().regex(/^\d{12}$/, "Aadhaar must be 12 digits"),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: { user } } = await supabaseServer().auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

  const admin = supabaseAdmin();
  try {
    const r = await aadhaarGenerateOtp(parsed.data.aadhaar);
    if (!r.clientId) throw new SurepassError(502, "Surepass returned no client_id");

    await admin.from("aadhaar_otp_sessions").insert({
      user_id: user.id,
      client_id: r.clientId,
    });

    await admin.from("kyc_verifications").insert({
      user_id: user.id,
      kind: "aadhaar_otp_generate",
      input: { last4: parsed.data.aadhaar.slice(-4) },   // never store full Aadhaar here
      ok: true,
      response: { client_id: r.clientId, otp_sent: r.otpSent },
    });

    return NextResponse.json({ ok: true, clientId: r.clientId, message: r.message });
  } catch (e: any) {
    await admin.from("kyc_verifications").insert({
      user_id: user.id,
      kind: "aadhaar_otp_generate",
      input: { last4: parsed.data.aadhaar.slice(-4) },
      ok: false,
      error: e?.message,
    });
    return NextResponse.json({ ok: false, error: e?.message || "Could not send OTP" }, { status: 502 });
  }
}
