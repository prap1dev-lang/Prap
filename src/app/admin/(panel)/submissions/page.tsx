import { buildMetadata } from "@/lib/seo";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";

export const metadata = buildMetadata({ title: "Property submissions · Admin", path: "/admin/submissions", noIndex: true });
export const dynamic = "force-dynamic";

export default async function SubmissionsAdmin() {
  await requireAdmin();
  const sb = supabaseAdmin();
  const { data: rows } = await sb
    .from("property_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Property submissions</h1>
      <p className="mt-2 text-ink-500">Owner-submitted properties from the public “List your property” form.</p>
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead className="bg-ink-50 text-ink-500 uppercase text-xs">
            <tr>
              <th className="px-5 py-3 text-left">Date</th>
              <th className="px-5 py-3 text-left">Owner</th>
              <th className="px-5 py-3 text-left">Phone</th>
              <th className="px-5 py-3 text-left">Type</th>
              <th className="px-5 py-3 text-left">Location</th>
              <th className="px-5 py-3 text-left">Config</th>
              <th className="px-5 py-3 text-left">Price</th>
              <th className="px-5 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r: any) => (
              <tr key={r.id} className="border-t border-ink-100">
                <td className="px-5 py-3 whitespace-nowrap text-ink-500">{new Date(r.created_at).toLocaleDateString("en-IN")}</td>
                <td className="px-5 py-3 font-medium">{r.owner_name}</td>
                <td className="px-5 py-3 font-mono text-xs">{r.phone}</td>
                <td className="px-5 py-3">{r.property_type}{r.sub_type ? ` · ${r.sub_type}` : ""}</td>
                <td className="px-5 py-3">{[r.locality, r.city].filter(Boolean).join(", ") || "—"}</td>
                <td className="px-5 py-3">{r.config || "—"}</td>
                <td className="px-5 py-3">{r.price || "—"}</td>
                <td className="px-5 py-3 capitalize">{r.status}</td>
              </tr>
            ))}
            {(!rows || rows.length === 0) && (
              <tr><td colSpan={8} className="px-5 py-10 text-center text-ink-400">No submissions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
