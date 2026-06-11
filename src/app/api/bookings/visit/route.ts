import { NextResponse } from "next/server";

/**
 * DEPRECATED. Visit confirmation is admin-only and now lives at
 * POST /api/admin/bookings/visit (requireAdmin + atomic credit_visit()).
 * This unauthenticated endpoint must never credit coins.
 */
export async function POST() {
  return NextResponse.json(
    { ok: false, error: "Moved to /api/admin/bookings/visit (admin only)." },
    { status: 410 },
  );
}
