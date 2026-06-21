import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buildMetadata } from "@/lib/seo";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import { DETAIL_SECTIONS } from "@/lib/project-fields";
import { amenitiesFromIds } from "@/lib/amenities";
import { listAllReviews } from "@/lib/reviews";
import { ArrowLeft, ExternalLink, FileText, Info, Home, Star, Sparkles, Image as ImageIcon } from "lucide-react";
import DeleteProjectButton from "./DeleteProjectButton";
import ReviewManager from "./ReviewManager";
import Accordion from "@/components/ui/Accordion";

export const metadata = buildMetadata({ title: "Project details · Admin", path: "/admin/projects", noIndex: true });
export const dynamic = "force-dynamic";

type Params = { params: { slug: string } };
type ActionResult = { ok: true } | { ok: false; error: string };

async function addReview(formData: FormData): Promise<ActionResult> {
  "use server";
  await requireAdmin();
  const slug = String(formData.get("slug") || "");
  const author_name = String(formData.get("author_name") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const rating = Math.min(5, Math.max(1, Number(formData.get("rating")) || 5));
  if (!slug || !author_name || !body) return { ok: false, error: "Name and review text are required." };

  const sb = supabaseAdmin();
  const { error } = await sb.from("project_reviews").insert({ project_slug: slug, author_name, body, rating });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/projects/${slug}`);
  revalidatePath(`/projects/${slug}`);
  return { ok: true };
}

async function deleteReview(formData: FormData): Promise<ActionResult> {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return { ok: false, error: "Missing id" };
  const sb = supabaseAdmin();
  const { data: row } = await sb.from("project_reviews").select("project_slug").eq("id", id).maybeSingle();
  const { error } = await sb.from("project_reviews").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  if (row?.project_slug) {
    revalidatePath(`/admin/projects/${row.project_slug}`);
    revalidatePath(`/projects/${row.project_slug}`);
  }
  return { ok: true };
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  const empty = value === "" || value === null || value === undefined;
  return (
    <div className="flex justify-between gap-4 border-b border-ink-50 py-2 text-sm">
      <dt className="text-ink-500">{label}</dt>
      <dd className={`text-right font-medium ${empty ? "text-ink-300" : "text-ink-900"}`}>
        {empty ? "—" : value}
      </dd>
    </div>
  );
}

export default async function AdminProjectDetail({ params }: Params) {
  await requireAdmin();
  const sb = supabaseAdmin();
  const { data: p } = await sb.from("projects").select("*").eq("slug", params.slug).maybeSingle();
  if (!p) return notFound();

  const m = (p.meta as Record<string, any>) || {};
  const unitTypes: any[] = Array.isArray(m.unitTypes) ? m.unitTypes : [];
  const gallery: string[] = Array.isArray(p.gallery) ? p.gallery : [];
  const floorPlans: string[] = Array.isArray(m.floorPlans) ? m.floorPlans : [];
  const amenityList = amenitiesFromIds(Array.isArray(m.amenityTags) ? m.amenityTags : []);
  const reviews = await listAllReviews(p.slug);

  // Meta detail sections with their rows (admin shows "—" for blanks).
  const metaSections = DETAIL_SECTIONS.map((section) => ({
    title: section.title,
    rows: section.fields.map((f) => ({ label: f.label, value: String(m[f.key] ?? "").trim() })),
    filled: section.fields.some((f) => String(m[f.key] ?? "").trim() !== ""),
  }));

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/admin/projects" className="text-sm text-ink-500 hover:text-brand-700 inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to projects
        </Link>
        <div className="inline-flex gap-2">
          <Link href={`/admin/projects/${p.slug}/edit`} className="btn-primary !py-1.5 !px-3 text-xs">
            Edit
          </Link>
          <Link href={`/projects/${p.slug}`} target="_blank" className="btn-outline !py-1.5 !px-3 text-xs">
            View public page <ExternalLink className="h-3 w-3" />
          </Link>
          <DeleteProjectButton slug={p.slug} name={p.name} />
        </div>
      </div>

      <header className="flex items-start gap-4">
        {p.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.cover_url} alt="" className="h-20 w-28 rounded-xl object-cover flex-none" />
        )}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{p.name}</h1>
          <p className="text-ink-500">{p.builder} · {p.sector ? `${p.sector}, ` : ""}{p.city}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="badge">{p.status}</span>
            <span className={`badge ${p.is_listed ? "!bg-emerald-50 !text-emerald-700" : "!bg-ink-100 !text-ink-700"}`}>
              {p.is_listed ? "Listed" : "Hidden / draft"}
            </span>
            <span className="badge font-mono">RERA: {p.rera_number}</span>
          </div>
        </div>
      </header>

      <Accordion renderUnfilled sections={[
        {
          id: "core", title: "Core details", icon: <Info className="h-5 w-5" />, filled: true, content: (
            <dl className="grid sm:grid-cols-2 gap-x-8">
              <Row label="Slug" value={p.slug} />
              <Row label="Project name" value={p.name} />
              <Row label="Builder" value={p.builder} />
              <Row label="City" value={p.city} />
              <Row label="Sector / locality" value={p.sector} />
              <Row label="RERA number" value={p.rera_number} />
              <Row label="Configurations" value={(p.configurations || []).join(", ")} />
              <Row label="Starting price" value={`₹${Number(p.starting_price_inr || 0).toLocaleString("en-IN")}`} />
              <Row label="Max price" value={`₹${Number(p.max_price_inr || 0).toLocaleString("en-IN")}`} />
              <Row label="Possession" value={p.possession} />
              <Row label="Status" value={p.status} />
              <Row label="Listed" value={p.is_listed ? "Yes" : "No"} />
            </dl>
          ),
        },
        {
          id: "units", title: `Unit types${unitTypes.length ? ` (${unitTypes.length})` : ""}`, icon: <Home className="h-5 w-5" />, filled: unitTypes.length > 0, content: (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead className="text-left text-ink-500 border-b border-ink-100">
                  <tr>
                    <th className="py-2 pr-4">Config</th><th className="py-2 pr-4">Super area</th>
                    <th className="py-2 pr-4">Carpet area</th><th className="py-2 pr-4">Bath</th>
                    <th className="py-2 pr-4">Balcony</th><th className="py-2 pr-4">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {unitTypes.map((u, i) => (
                    <tr key={i} className="border-b border-ink-50 last:border-0">
                      <td className="py-2 pr-4 font-semibold">{u.config || "—"}</td>
                      <td className="py-2 pr-4">{u.superArea || "—"}</td>
                      <td className="py-2 pr-4">{u.carpetArea || "—"}</td>
                      <td className="py-2 pr-4">{u.bathrooms || "—"}</td>
                      <td className="py-2 pr-4">{u.balconyArea || "—"}</td>
                      <td className="py-2 pr-4">{u.price ? `₹${Number(u.price).toLocaleString("en-IN")}` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ),
        },
        {
          id: "highlights", title: "Highlights", icon: <Sparkles className="h-5 w-5" />, filled: (p.highlights || []).length > 0, content: (
            <div className="flex flex-wrap gap-2">
              {(p.highlights as string[] || []).map((h) => (
                <span key={h} className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-700">{h}</span>
              ))}
            </div>
          ),
        },
        {
          id: "amenities", title: `Amenities${amenityList.length ? ` (${amenityList.length})` : ""}`, icon: <Star className="h-5 w-5" />, filled: amenityList.length > 0 || (p.amenities || []).length > 0, content: (
            <div className="space-y-4">
              {amenityList.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {amenityList.map((a) => {
                    const Icon = a.icon;
                    return (
                      <span key={a.id} className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-700">
                        <Icon className="h-3.5 w-3.5" /> {a.label}
                      </span>
                    );
                  })}
                </div>
              )}
              {(p.amenities || []).length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-ink-400 mb-2">Amenity notes</p>
                  <div className="flex flex-wrap gap-2">
                    {(p.amenities as string[]).map((a) => (
                      <span key={a} className="rounded-full bg-ink-100 px-3 py-1 text-sm text-ink-700">{a}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ),
        },
        ...metaSections.map((section) => ({
          id: section.title, title: section.title, icon: <FileText className="h-5 w-5" />, filled: section.filled, content: (
            <dl className="grid sm:grid-cols-2 gap-x-8">
              {section.rows.map((r) => (
                <Row key={r.label} label={r.label} value={r.value} />
              ))}
            </dl>
          ),
        })),
        {
          id: "neighbourhood", title: "Neighbourhood & connectivity", icon: <FileText className="h-5 w-5" />,
          filled: Array.isArray(m.localityInsights) && m.localityInsights.length > 0, content: (
            <div className="flex flex-wrap gap-2">
              {(m.localityInsights ?? []).map((i: any) => (
                <span key={i.key} className="inline-flex items-center gap-1.5 rounded-full bg-ink-50 border border-ink-200 px-3 py-1 text-sm text-ink-700">
                  <span className="font-semibold text-ink-900">{i.label}</span>
                  <span className="text-ink-400">·</span>{i.text}
                </span>
              ))}
            </div>
          ),
        },
        {
          id: "description", title: "Description", icon: <Info className="h-5 w-5" />, filled: !!p.description, content: (
            <p className="text-sm text-ink-700 whitespace-pre-line leading-relaxed">{p.description}</p>
          ),
        },
        {
          id: "media", title: "Media", icon: <ImageIcon className="h-5 w-5" />, filled: gallery.length > 0 || floorPlans.length > 0 || !!m.brochureUrl, content: (
            <div className="space-y-5">
              {gallery.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-ink-600 mb-2">Gallery ({gallery.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {gallery.map((g, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={g} alt="" className="h-20 w-28 rounded-lg object-cover border border-ink-200" />
                    ))}
                  </div>
                </div>
              )}
              {floorPlans.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-ink-600 mb-2">Floor plans ({floorPlans.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {floorPlans.map((g, i) => (
                      <a key={i} href={g} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-brand-700 hover:underline">
                        <FileText className="h-4 w-4" /> Plan {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <Row label="Brochure (PDF)" value={
                m.brochureUrl
                  ? <a href={m.brochureUrl} target="_blank" rel="noreferrer" className="text-brand-700 hover:underline">Download</a>
                  : ""
              } />
            </div>
          ),
        },
      ]} />

      <ReviewManager slug={p.slug} reviews={reviews} addAction={addReview} deleteAction={deleteReview} />
    </div>
  );
}
