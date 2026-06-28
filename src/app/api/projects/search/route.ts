import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/**
 * Typeahead search over existing projects by name or builder. Used by the
 * admin listing wizard's Project Name field so typing "DLF" lists matching
 * DLF projects already in the database.
 *
 * GET /api/projects/search?q=dlf
 */
export async function GET(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const q = (new URL(req.url).searchParams.get("q") || "").trim();
  if (q.length < 2) return NextResponse.json({ ok: true, results: [] });

  const admin = supabaseAdmin();
  // Match on name OR builder, case-insensitive.
  const { data, error } = await admin
    .from("projects")
    .select("slug, name, builder, sector, city")
    .or(`name.ilike.%${q}%,builder.ilike.%${q}%`)
    .limit(8);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const results = (data ?? []).map((r) => ({
    slug: r.slug,
    name: r.name,
    builder: r.builder,
    location: [r.sector, r.city].filter(Boolean).join(", "),
  }));
  return NextResponse.json({ ok: true, results });
}
