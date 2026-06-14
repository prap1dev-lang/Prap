// Project review queries. Server-only.
import "server-only";
import { supabaseAdmin } from "@/lib/supabase-server";

export interface ProjectReview {
  id: string;
  project_slug: string;
  author_name: string;
  rating: number;
  body: string;
  is_published: boolean;
  created_at: string;
}

/** Published reviews for a project (newest first). Returns [] on any error. */
export async function listPublishedReviews(slug: string): Promise<ProjectReview[]> {
  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from("project_reviews")
      .select("*")
      .eq("project_slug", slug)
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as ProjectReview[]) ?? [];
  } catch {
    return [];
  }
}

/** All reviews for a project incl. unpublished (admin). Returns [] on error. */
export async function listAllReviews(slug: string): Promise<ProjectReview[]> {
  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from("project_reviews")
      .select("*")
      .eq("project_slug", slug)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as ProjectReview[]) ?? [];
  } catch {
    return [];
  }
}

export function averageRating(reviews: ProjectReview[]): number {
  if (reviews.length === 0) return 0;
  return Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;
}
