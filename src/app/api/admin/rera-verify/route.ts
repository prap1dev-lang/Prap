import { NextResponse } from "next/server";
import { z } from "zod";

const Body = z.object({
  userId: z.string(),
  decision: z.enum(["approve", "reject"]),
  notes: z.string().optional(),
});

/**
 * POST /api/admin/rera-verify
 * Admin endpoint to mark a broker's RERA registration as verified/rejected.
 * MVP phase: admin manually cross-checks UP-RERA portal first.
 * Phase 2: replace with a third-party RERA verification API.
 */
export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }
  const { userId, decision } = parsed.data;

  // TODO:
  // - Verify admin session
  // - UPDATE users SET kyc_status = (approve? 'verified':'rejected'), rera_verified_at = now()
  // - INSERT audit_log row
  // - Send notification email/SMS to broker.

  return NextResponse.json({ ok: true, userId, decision });
}
