import { NextResponse } from "next/server";
import { z } from "zod";
import { COIN } from "@/lib/coins";

const Body = z.object({
  phone: z.string(),
  otp: z.string().length(6),
  role: z.enum(["broker", "corporate", "referrer"]),
  profile: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/),
    aadhaar: z.string().length(12),
    rera: z.string().optional(),
    referralCode: z.string().optional(),
  }),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }
  const { phone, otp, role, profile } = parsed.data;

  // TODO:
  // 1. Verify OTP from otp_requests table (hash compare, not expired, not used)
  // 2. Validate referralCode (if referrer): must exist & belong to a corporate
  // 3. Validate RERA (if broker): mark profile.rera_status = 'pending' for admin verification
  // 4. Insert into users (id, role, profile, kyc_status='pending')
  // 5. INSERT into coin_ledger (user_id, source='onboarding', delta=25000, balance_after=25000)
  //    — all inside one transaction; the trigger on coin_ledger updates wallets.balance
  // 6. Issue session JWT (Supabase or NextAuth) + return user

  return NextResponse.json({
    ok: true,
    user: {
      id: "U-DEMO",
      role,
      phone,
      name: profile.name,
      kyc_status: "pending",
    },
    bonus: {
      type: "onboarding",
      coins: COIN.ONBOARDING_BONUS,
    },
  });
}
