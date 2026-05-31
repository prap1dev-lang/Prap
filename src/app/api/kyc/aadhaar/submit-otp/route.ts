import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase-server";
import { aadhaarSubmitOtp } from "@/lib/surepass";

const Body = z.object({
  otp: z.string().regex(/^\d{4,8}$/, "Invalid OTP"),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: { user } } = await supabaseServer().auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

  const admin = supabaseAdmin();

  // Find the most recent un-consumed, un-expired session for this user.
  const { data: session } = await admin
    .from("aadhaar_otp_sessions")
    .select("id, client_id, expires_at, consumed")
    .eq("user_id", user.id)
    .eq("consumed", false)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!session) {
    return NextResponse.json(
      { ok: false, error: "No active OTP session. Generate a fresh OTP first." },
      { status: 410 },
    );
  }

  try {
    const r = await aadhaarSubmitOtp(session.client_id, parsed.data.otp);

    await admin.from("kyc_verifications").insert({
      user_id: user.id,
      kind: "aadhaar_otp_submit",
      input: { client_id: session.client_id },
      ok: r.valid,
      response: r.raw,
    });

    await admin.from("aadhaar_otp_sessions").update({ consumed: true }).eq("id", session.id);

    if (r.valid) {
      // Cross-check name on Aadhaar against name on PAN if available.
      const { data: u } = await admin
        .from("users")
        .select("pan_full_name, name")
        .eq("id", user.id)
        .single();
      const nameMatches = (a?: string | null, b?: string | null) => {
        if (!a || !b) return null;
        const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
        return norm(a) === norm(b);
      };
      const panMatch = nameMatches(r.fullName, u?.pan_full_name);
      const declMatch = nameMatches(r.fullName, u?.name);

      await admin
        .from("users")
        .update({
          aadhaar_verified: true,
          aadhaar_verified_at: new Date().toISOString(),
          aadhaar_full_name: r.fullName,
          // Auto-promote KYC if both checks succeed.
          kyc_status: (panMatch === false || declMatch === false) ? "pending" : "verified",
        })
        .eq("id", user.id);

      return NextResponse.json({
        ok: true,
        valid: true,
        fullName: r.fullName,
        nameMatchesPan: panMatch,
        nameMatchesDeclared: declMatch,
      });
    }
    return NextResponse.json({ ok: false, error: "Invalid OTP or Aadhaar" }, { status: 422 });
  } catch (e: any) {
    await admin.from("kyc_verifications").insert({
      user_id: user.id,
      kind: "aadhaar_otp_submit",
      input: { client_id: session.client_id },
      ok: false,
      error: e?.message,
    });
    return NextResponse.json({ ok: false, error: e?.message || "Aadhaar verification failed" }, { status: 502 });
  }
}
