import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/**
 * Lightweight "who am I" endpoint for client UI (e.g. the navbar avatar).
 * Returns null when signed out so marketing pages can stay static and just
 * hydrate the auth state on the client.
 */
export async function GET() {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ user: null });

  const admin = supabaseAdmin();
  const { data } = await admin
    .from("users")
    .select("name, photo_url, role")
    .eq("id", me.authId)
    .maybeSingle();

  return NextResponse.json({
    user: {
      name: data?.name ?? me.name ?? null,
      role: (data?.role ?? me.role) as string,
      photoUrl: data?.photo_url ?? null,
    },
  });
}
