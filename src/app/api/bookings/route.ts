import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Create a new booking (a "site visit slot") with Aadhaar lock-in.
 *
 * Lock-in logic (enforced in DB via UNIQUE(project_id, client_aadhaar_hash)):
 *  - Once a broker locks a client (hashed Aadhaar) to a project, no other broker
 *    can create a booking for the same (project, client_aadhaar_hash).
 *  - Re-attempts return 409 CONFLICT with the locking broker's masked info.
 */

const FamilyMember = z.object({
  name: z.string().min(2),
  aadhaarLast4: z.string().regex(/^\d{4}$/),
});

const Body = z.object({
  projectId: z.string(),
  brokerId: z.string(),
  client: z.object({
    name: z.string().min(2),
    phone: z.string(),
    aadhaarFull: z.string().length(12),
  }),
  familyMembers: z.array(FamilyMember).min(2, "Minimum 2 family members required"),
  scheduledAt: z.string(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  // TODO:
  // 1. Hash client.aadhaarFull -> client_aadhaar_hash
  // 2. INSERT into bookings (id, project_id, broker_id, client_id, client_aadhaar_hash, scheduled_at)
  //    - DB UNIQUE constraint enforces lock-in.
  //    - On 23505 (UNIQUE violation) -> respond 409 with masked broker info from DB.
  // 3. INSERT family members into booking_family_members table.
  // 4. Set visit_no = (SELECT COUNT(*) FROM bookings WHERE project_id = ? AND client_id = ?) + 1
  // 5. Schedule reminder SMS to client & broker.

  return NextResponse.json({
    ok: true,
    booking: { id: "B-DEMO", visitNo: 1, status: "scheduled" },
  });
}

export async function GET(req: Request) {
  // TODO: list bookings for current user (broker | client) with pagination
  return NextResponse.json({ ok: true, bookings: [] });
}
