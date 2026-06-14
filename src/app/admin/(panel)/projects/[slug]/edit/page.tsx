import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import ProjectWizard, { type ProjectInitial } from "../../new/ProjectWizard";

export const metadata = buildMetadata({ title: "Edit project · Admin", path: "/admin/projects", noIndex: true });
export const dynamic = "force-dynamic";

type Params = { params: { slug: string } };

const statusToForm: Record<string, string> = {
  new_launch: "new_launch",
  under_construction: "under_construction",
  ready_to_move: "ready_to_move",
};

export default async function EditProject({ params }: Params) {
  await requireAdmin();
  const sb = supabaseAdmin();
  const { data: p } = await sb.from("projects").select("*").eq("slug", params.slug).maybeSingle();
  if (!p) return notFound();

  const rawMeta = (p.meta as Record<string, any>) || {};
  const gallery: string[] = Array.isArray(p.gallery) ? p.gallery : [];
  const floorPlans: string[] = Array.isArray(rawMeta.floorPlans) ? rawMeta.floorPlans : [];

  // Strip non-form meta keys (arrays/urls handled separately) so only scalar
  // text fields are spread into FormState.
  const { floorPlans: _fp, brochureUrl: _bu, unitTypes: _ut, ...m } = rawMeta;

  const toFile = (url: string, i = 0) => ({ name: url.split("/").pop() || `file-${i}`, url, publicId: url });

  // DB row -> wizard FormState. meta.* keys already match FormState keys.
  const initial: ProjectInitial = {
    slug: p.slug,
    form: {
      name: p.name || "",
      builder: p.builder || "",
      city: p.city || "Noida",
      sector: p.sector || "",
      reraNumber: p.rera_number || "",
      startingPrice: String(p.starting_price_inr ?? ""),
      maxPrice: String(p.max_price_inr ?? ""),
      possessionDate: p.possession || "",
      configurations: (p.configurations || []).join(", "),
      highlights: (p.highlights || []).join(", "),
      description: p.description || "",
      status: statusToForm[p.status as string] || "under_construction",
      isListed: !!p.is_listed,
      // Everything stored in meta maps 1:1 onto FormState keys.
      ...m,
    },
    cover: p.cover_url ? toFile(p.cover_url) : null,
    gallery: gallery.map((u, i) => toFile(u, i)),
    floorPlans: floorPlans.map((u, i) => toFile(u, i)),
    brochure: rawMeta.brochureUrl ? toFile(rawMeta.brochureUrl) : null,
    unitTypes: Array.isArray(rawMeta.unitTypes) ? rawMeta.unitTypes : undefined,
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Edit project</h1>
        <p className="mt-1 text-ink-500">Update <span className="font-semibold">{p.name}</span> — changes go live on save.</p>
      </header>
      <ProjectWizard initial={initial} />
    </div>
  );
}
