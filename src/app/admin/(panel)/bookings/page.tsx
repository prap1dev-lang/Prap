import { buildMetadata } from "@/lib/seo";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import ConfirmVisitButton from "@/components/admin/ConfirmVisitButton";

export const metadata = buildMetadata({ title: "Bookings · Admin", path: "/admin/bookings", noIndex: true });
export const dynamic = "force-dynamic";

export default async function BookingsAdmin() {
  await requireAdmin();
  const sb = supabaseAdmin();
  const { data: rows } = await sb
    .from("bookings")
    .select(`
      id, status, visits_completed, scheduled_at, created_at,
      project:projects ( name, city ),
      broker:users!bookings_broker_id_fkey ( name ),
      client:users!bookings_client_id_fkey ( name, aadhaar_last4 )
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Bookings</h1>
      <p className="mt-2 text-ink-500">Every site visit with Aadhaar-lock attribution.</p>
      <div className="card mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-500 uppercase text-xs">
            <tr>
              <th className="px-5 py-3 text-left">Ref</th>
              <th className="px-5 py-3 text-left">Project</th>
              <th className="px-5 py-3 text-left">Broker</th>
              <th className="px-5 py-3 text-left">Client</th>
              <th className="px-5 py-3 text-left">Aadhaar last 4</th>
              <th className="px-5 py-3 text-left">Visits</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r: any) => (
              <tr key={r.id} className="border-t border-ink-100">
                <td className="px-5 py-3 font-mono text-xs">{r.id.slice(0, 8)}…</td>
                <td className="px-5 py-3">{r.project?.name} <span className="text-ink-500">· {r.project?.city}</span></td>
                <td className="px-5 py-3">{r.broker?.name || "—"}</td>
                <td className="px-5 py-3">{r.client?.name}</td>
                <td className="px-5 py-3 font-mono text-xs">XXXX-XXXX-{r.client?.aadhaar_last4}</td>
                <td className="px-5 py-3">{r.visits_completed}</td>
                <td className="px-5 py-3"><span className="badge">{r.status}</span></td>
                <td className="px-5 py-3">
                  <ConfirmVisitButton
                    bookingId={r.id}
                    nextVisitNo={(r.visits_completed ?? 0) + 1}
                    clientName={r.client?.name ?? "client"}
                  />
                </td>
              </tr>
            ))}
            {(!rows || rows.length === 0) && (
              <tr><td colSpan={8} className="px-5 py-10 text-center text-ink-500">No bookings yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
