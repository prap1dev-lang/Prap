import { buildMetadata } from "@/lib/seo";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import { Mail, Phone } from "lucide-react";

export const metadata = buildMetadata({ title: "Queries · Admin", path: "/admin/queries", noIndex: true });
export const dynamic = "force-dynamic";

export default async function QueriesAdmin() {
  await requireAdmin();
  const sb = supabaseAdmin();
  const { data: rows } = await sb
    .from("queries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Queries</h1>
      <p className="mt-2 text-ink-500">Every callback request &amp; enquiry from the contact form, with user details.</p>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-sm min-w-[820px]">
          <thead className="bg-ink-50 text-ink-500 uppercase text-xs">
            <tr>
              <th className="px-5 py-3 text-left">Date</th>
              <th className="px-5 py-3 text-left">Name</th>
              <th className="px-5 py-3 text-left">Contact</th>
              <th className="px-5 py-3 text-left">Type</th>
              <th className="px-5 py-3 text-left">Project</th>
              <th className="px-5 py-3 text-left">Message</th>
              <th className="px-5 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r: any) => (
              <tr key={r.id} className="border-t border-ink-100 align-top">
                <td className="px-5 py-3 whitespace-nowrap text-ink-500">{new Date(r.created_at).toLocaleDateString("en-IN")}</td>
                <td className="px-5 py-3 font-medium">{r.name}</td>
                <td className="px-5 py-3">
                  <div className="flex flex-col gap-1">
                    {r.phone && (
                      <a href={`tel:${r.phone}`} className="inline-flex items-center gap-1.5 text-ink-700 hover:text-brand-700">
                        <Phone className="h-3.5 w-3.5" /> {r.phone}
                      </a>
                    )}
                    {r.email && (
                      <a href={`mailto:${r.email}`} className="inline-flex items-center gap-1.5 text-ink-700 hover:text-brand-700">
                        <Mail className="h-3.5 w-3.5" /> {r.email}
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3">{r.intent || "—"}</td>
                <td className="px-5 py-3">{r.project_slug || "—"}</td>
                <td className="px-5 py-3 max-w-[22rem] text-ink-600">{r.message || "—"}</td>
                <td className="px-5 py-3 capitalize">{r.status}</td>
              </tr>
            ))}
            {(!rows || rows.length === 0) && (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-ink-400">No queries yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
