import { NextResponse } from "next/server";
import { z } from "zod";

const Body = z.object({
  phone: z.string().regex(/^(\+91)?[6-9]\d{9}$/),
  role: z.enum(["broker", "corporate", "referrer"]).optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid phone" }, { status: 400 });
  }

  // TODO: integrate Firebase Auth phone OTP / Twilio
  // - Throttle: max 3 OTPs/min/phone, 10/day
  // - Store OTP hash (bcrypt) + expiry (5 min) in supabase: otp_requests
  // - Send via provider, return masked phone

  return NextResponse.json({
    ok: true,
    message: "OTP sent",
    phone: parsed.data.phone.replace(/(\d{2})\d{6}(\d{2})/, "$1******$2"),
  });
}
