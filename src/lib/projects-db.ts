// DB-backed Project queries. Server-only.
// Returns shapes compatible with the existing `Project` type in lib/projects.ts.
// Falls back to the static demo PROJECTS array when the table is empty so
// fresh installs still look populated.

import "server-only";
import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-server";
import { PROJECTS as DEMO, type Project } from "@/lib/projects";

function rowToProject(r: any): Project {
  const cityRaw: string = r.city || "Noida";
  const city =
    cityRaw === "Greater Noida" || cityRaw === "Yamuna Expressway" || cityRaw === "Noida"
      ? cityRaw
      : "Noida";
  const statusMap: Record<string, Project["status"]> = {
    new_launch: "New Launch",
    under_construction: "Under Construction",
    ready_to_move: "Ready to Move",
  };
  return {
    slug: r.slug,
    name: r.name,
    builder: r.builder,
    city: city as Project["city"],
    sector: r.sector || "",
    rera: r.rera_number,
    configuration: r.configurations || [],
    startingPrice: Number(r.starting_price_inr) || 0,
    maxPrice: Number(r.max_price_inr) || 0,
    possession: r.possession || "",
    amenities: r.amenities || [],
    highlights: r.highlights || [],
    cover: r.cover_url || "",
    gallery: r.gallery || [],
    description: r.description || "",
    status: statusMap[r.status as string] || "Under Construction",
    unitTypes: Array.isArray(r.meta?.unitTypes) ? r.meta.unitTypes : [],
    amenityTags: Array.isArray(r.meta?.amenityTags) ? r.meta.amenityTags : [],
    meta: r.meta || {},
  };
}

/**
 * Fetch ALL listed projects once and cache for 5 minutes. Filtering by
 * q/city/limit happens in-memory, so the homepage, projects page and every
 * filter share a single cached DB read instead of hitting Supabase per request.
 */
const getAllListedProjects = unstable_cache(
  async (): Promise<Project[]> => {
    try {
      const sb = supabaseAdmin();
      const { data, error } = await sb
        .from("projects")
        .select("*")
        .eq("is_listed", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (data && data.length) return data.map(rowToProject);
    } catch {
      /* fall back to demo below */
    }
    return DEMO;
  },
  ["listed-projects"],
  { revalidate: 300, tags: ["projects"] },
);

export async function listProjects(
  opts: { city?: string; q?: string; status?: string; amenities?: string[]; limit?: number } = {},
): Promise<Project[]> {
  let list = await getAllListedProjects();
  if (opts.city) list = list.filter((p) => p.city === opts.city);
  if (opts.status) list = list.filter((p) => p.status === opts.status);
  if (opts.amenities && opts.amenities.length) {
    // Project must have ALL selected amenities.
    list = list.filter((p) => {
      const tags = new Set(p.amenityTags ?? []);
      return opts.amenities!.every((a) => tags.has(a));
    });
  }
  if (opts.q) {
    const s = opts.q.toLowerCase();
    list = list.filter((p) => [p.name, p.builder, p.sector, p.city].join(" ").toLowerCase().includes(s));
  }
  if (opts.limit) list = list.slice(0, opts.limit);
  return list;
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const sb = supabaseAdmin();
    const { data } = await sb.from("projects").select("*").eq("slug", slug).maybeSingle();
    if (data) return rowToProject(data);
  } catch {
    /* fall back */
  }
  return DEMO.find((p) => p.slug === slug) || null;
}

export async function listProjectSlugs(): Promise<string[]> {
  const list = await getAllListedProjects();
  return list.map((p) => p.slug);
}
