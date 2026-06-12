import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyPan, SurepassError } from "@/lib/surepass";

/**
 * Pre-signup PAN check — runs BEFORE the phone OTP is sent, while the user is
 * still unauthenticated. Validates that the PAN exists with NSDL (via Surepass)
 * and returns the name on record so the signup form can gate "Send OTP".
 *
 * Stateless: writes nothing to the DB (no user row exists yet). The
 * authenticated /api/kyc/pan route persists the verified flag later.
 *
 * If SUREPASS_TOKEN is not configured, we fail OPEN (allow signup) so the
 * platform still works in environments without a KYC provider — the real
 * verification then runs best-effort inside the exchange route at signup.
 */

const Body = z.object({
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Invalid PAN format"),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, valid: false, error: "Invalid PAN format" }, { status: 400 });
  }

  if (!process.env.SUREPASS_TOKEN) {
    // No KYC provider configured — don't block onboarding.
    return NextResponse.json({ ok: true, valid: true, skipped: true });
  }

  try {
    const r = await verifyPan(parsed.data.pan);
    return NextResponse.json({
      ok: true,
      valid: r.valid,
      fullName: r.fullName,
      aadhaarSeeded: r.aadhaarSeeded,
      error: r.valid ? undefined : "PAN could not be verified. Please re-check the number.",
    });
  } catch (e: any) {
    const isSP = e instanceof SurepassError;
    // Surepass outage / not-found: surface a clear message but allow retry.
    const msg = isSP ? e.message : "PAN verification is temporarily unavailable.";
    return NextResponse.json({ ok: false, valid: false, error: msg }, { status: 502 });
  }
}
