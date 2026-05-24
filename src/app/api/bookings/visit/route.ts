import { NextResponse } from "next/server";
import { z } from "zod";
import { visitBonus } from "@/lib/coins";

/**
 * Mark a site visit as completed.
 * Triggers coin credits per PRAP rules:
 *   Visit 1 & 2: referrer +10,000 ; corporate +5,000
 *   Visit 3+   : NO bonus
 */

const Body = z.object({
  bookingId: z.string(),
  visitNo: z.number().int().min(1).max(10),
  attendees: z.array(z.string()).min(2, "Minimum 2 family members must attend"),
  attestedByBrokerId: z.string(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }
  const { bookingId, visitNo } = parsed.data;

  const b = visitBonus(visitNo);

  // TODO (in a single DB transaction):
  // 1. SELECT booking & verify broker is the locked broker
  // 2. UPDATE bookings SET visits_completed = visits_completed + 1, last_visit_at = now()
  // 3. If b.referrer > 0: INSERT coin_ledger(user=referrer, source=`visit_${visitNo}`, delta=+b.referrer)
  // 4. If b.corporate > 0: INSERT coin_ledger(user=corporate_who_referred, source=`visit_${visitNo}_corporate`, delta=+b.corporate)
  //    - corporate is looked up from the referral_code used at referrer signup.
  // 5. Notify both via SMS + Email.

  return NextResponse.json({
    ok: true,
    bookingId,
    visitNo,
    credited: b,
    note: visitNo > 2 ? "Visit 3+ does NOT trigger coin bonus" : "Bonuses credited",
  });
}
