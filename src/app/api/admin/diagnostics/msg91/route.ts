import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { sendOtp, verifyOtp, normalizeMobile, Msg91Error } from "@/lib/msg91";

const SendBody = z.object({ phone: z.string().min(8) });
const VerifyBody = z.object({ phone: z.string().min(8), otp: z.string().min(4) });

/**
 * POST /api/admin/diagnostics/msg91
 *   { action: "send", phone }       -> trigger an SMS, returns MSG91 raw body
 *   { action: "verify", phone, otp } -> verify OTP, returns MSG91 raw body
 *
 * Returns the raw provider response so we can see exactly what went wrong.
 */
export async function POST(req: Request) {
  await requireAdmin();
  const body = await req.json().catch(() => ({}));
  const action = String(body.action || "send");

  // Echo env config (no secrets) so the diagnostics page can show what's loaded.
  const env = {
    bypass: process.env.MSG91_DEV_BYPASS === "true",
    sender: process.env.MSG91_SENDER_ID || "(not set)",
    templateId: process.env.MSG91_TEMPLATE_ID || "(not set)",
    otpLength: process.env.MSG91_OTP_LENGTH || "6",
    otpExpiryMin: process.env.MSG91_OTP_EXPIRY_MIN || "5",
    hasAuthKey: !!process.env.MSG91_AUTH_KEY,
    authKeyPrefix: (process.env.MSG91_AUTH_KEY || "").slice(0, 6) + "…",
  };

  try {
    if (action === "send") {
      const parsed = SendBody.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ ok: false, error: parsed.error.flatten(), env }, { status: 400 });
      }
      const r = await sendOtp(parsed.data.phone);
      return NextResponse.json({
        ok: true,
        action: "send",
        env,
        normalized: normalizeMobile(parsed.data.phone),
        provider: { name: "msg91", body: r.raw, requestId: r.requestId },
      });
    }

    if (action === "verify") {
      const parsed = VerifyBody.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ ok: false, error: parsed.error.flatten(), env }, { status: 400 });
      }
      const r = await verifyOtp(parsed.data.phone, parsed.data.otp);
      return NextResponse.json({
        ok: r.ok,
        action: "verify",
        env,
        normalized: normalizeMobile(parsed.data.phone),
        provider: { name: "msg91", body: r.raw, message: r.message },
      });
    }

    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    const isMsg91 = e instanceof Msg91Error;
    return NextResponse.json(
      {
        ok: false,
        action,
        env,
        error: e?.message || String(e),
        provider: isMsg91 ? { name: "msg91", status: e.status, detail: e.detail } : undefined,
      },
      { status: isMsg91 ? 502 : 500 },
    );
  }
}
