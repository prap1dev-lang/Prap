import Link from "next/link";
import { revalidatePath } from "next/cache";
import { buildMetadata } from "@/lib/seo";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import { Plus, ExternalLink } from "lucide-react";
import DeleteProjectButton from "./[slug]/DeleteProjectButton";

export const metadata = buildMetadata({ title: "Projects · Admin", path: "/admin/projects", noIndex: true });
export const dynamic = "force-dynamic";

async function toggleListed(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id"));
  const next = formData.get("listed") === "1";
  const sb = supabaseAdmin();
  await sb.from("projects").update({ is_listed: next }).eq("id", id);
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
}

export default async function AdminProjects() {
  await requireAdmin();
  const sb = supabaseAdmin();
  const { data: projects } = await sb
    .from("projects")
    .select("id, slug, name, builder, city, rera_number, starting_price_inr, status, is_listed, cover_url, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8 max-w-6xl">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Projects</h1>
          <p className="mt-1 text-ink-500">Properties published here appear on the home page and /projects.</p>
        </div>
        <Link href="/admin/projects/new" className="btn-primary">
          <Plus className="h-4 w-4" /> Add new property
        </Link>
      </header>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[680px]">
          <thead className="bg-ink-50 text-ink-500 uppercase text-xs">
            <tr>
              <th className="px-5 py-3 text-left">Project</th>
              <th className="px-5 py-3 text-left">Builder · City</th>
              <th className="px-5 py-3 text-left">RERA</th>
              <th className="px-5 py-3 text-right">Starting</th>
              <th className="px-5 py-3 text-left">Listed</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(projects ?? []).map((p) => (
              <tr key={p.id} className="border-t border-ink-100">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-16 rounded-lg bg-ink-100 overflow-hidden flex-none">
                      {p.cover_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.cover_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-xs text-ink-500">{p.status}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <p>{p.builder}</p>
                  <p className="text-xs text-ink-500">{p.city}</p>
                </td>
                <td className="px-5 py-3 font-mono text-xs">{p.rera_number}</td>
                <td className="px-5 py-3 text-right">
                  ₹{Number(p.starting_price_inr || 0).toLocaleString("en-IN")}
                </td>
                <td className="px-5 py-3">
                  <form action={toggleListed} className="inline">
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="listed" value={p.is_listed ? "0" : "1"} />
                    <button className={`badge ${p.is_listed ? "!bg-emerald-50 !text-emerald-700" : "!bg-ink-100 !text-ink-700"}`}>
                      {p.is_listed ? "Listed — click to hide" : "Hidden — click to publish"}
                    </button>
                  </form>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="inline-flex gap-2">
                    <Link href={`/admin/projects/${p.slug}/edit`} className="btn-primary !py-1.5 !px-3 text-xs">
                      Edit
                    </Link>
                    <Link href={`/admin/projects/${p.slug}`} className="btn-outline !py-1.5 !px-3 text-xs">
                      Details
                    </Link>
                    <Link href={`/projects/${p.slug}`} target="_blank" className="btn-outline !py-1.5 !px-3 text-xs">
                      View <ExternalLink className="h-3 w-3" />
                    </Link>
                    <DeleteProjectButton slug={p.slug} name={p.name} />
                  </div>
                </td>
              </tr>
            ))}
            {(!projects || projects.length === 0) && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center">
                  <p className="text-ink-500">No projects yet.</p>
                  <Link href="/admin/projects/new" className="btn-primary mt-4 inline-flex">
                    <Plus className="h-4 w-4" /> Add your first property
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
