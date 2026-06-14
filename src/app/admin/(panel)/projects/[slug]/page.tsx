import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import { DETAIL_SECTIONS } from "@/lib/project-fields";
import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import DeleteProjectButton from "./DeleteProjectButton";

export const metadata = buildMetadata({ title: "Project details · Admin", path: "/admin/projects", noIndex: true });
export const dynamic = "force-dynamic";

type Params = { params: { slug: string } };

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

      {/* Core columns stored on the row itself */}
      <section className="card p-6">
        <h2 className="text-lg font-bold">Core details</h2>
        <dl className="mt-4 grid sm:grid-cols-2 gap-x-8">
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
      </section>

      {/* BHK-wise unit types */}
      {unitTypes.length > 0 && (
        <section className="card p-6">
          <h2 className="text-lg font-bold">Unit types ({unitTypes.length})</h2>
          <div className="mt-4 overflow-x-auto">
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
        </section>
      )}

      {/* Amenities & highlights */}
      {((p.amenities || []).length > 0 || (p.highlights || []).length > 0) && (
        <section className="card p-6 space-y-4">
          {(p.highlights || []).length > 0 && (
            <div>
              <h2 className="text-lg font-bold">Highlights</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {(p.highlights as string[]).map((h) => (
                  <span key={h} className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-700">{h}</span>
                ))}
              </div>
            </div>
          )}
          {(p.amenities || []).length > 0 && (
            <div>
              <h2 className="text-lg font-bold">Amenities</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {(p.amenities as string[]).map((a) => (
                  <span key={a} className="rounded-full bg-ink-100 px-3 py-1 text-sm text-ink-700">{a}</span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* All extended meta fields */}
      {DETAIL_SECTIONS.map((section) => (
        <section key={section.title} className="card p-6">
          <h2 className="text-lg font-bold">{section.title}</h2>
          <dl className="mt-4 grid sm:grid-cols-2 gap-x-8">
            {section.fields.map((f) => (
              <Row key={f.key} label={f.label} value={String(m[f.key] ?? "")} />
            ))}
          </dl>
        </section>
      ))}

      {/* Description */}
      {p.description && (
        <section className="card p-6">
          <h2 className="text-lg font-bold">Description</h2>
          <p className="mt-3 text-sm text-ink-700 whitespace-pre-line leading-relaxed">{p.description}</p>
        </section>
      )}

      {/* Media */}
      <section className="card p-6 space-y-5">
        <h2 className="text-lg font-bold">Media</h2>
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
        {gallery.length === 0 && floorPlans.length === 0 && !m.brochureUrl && (
          <p className="text-sm text-ink-400">No media uploaded.</p>
        )}
      </section>
    </div>
  );
}
