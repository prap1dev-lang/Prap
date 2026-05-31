import { buildMetadata } from "@/lib/seo";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";

export const metadata = buildMetadata({ title: "Payments · Admin", path: "/admin/payments", noIndex: true });
export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  await requireAdmin();
  const sb = supabaseAdmin();
  const { data: rows } = await sb
    .from("payments")
    .select("id, booking_id, milestone_index, gross_amount_inr, coin_discount_inr, net_amount_inr, status, captured_at, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const milestoneLabel = (i: number) => `${[50, 25, 25][i]}%`;

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Payments</h1>
      <p className="mt-2 text-ink-500">Milestone payment ledger across all bookings.</p>
      <div className="card mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-500 uppercase text-xs">
            <tr>
              <th className="px-5 py-3 text-left">Ref</th>
              <th className="px-5 py-3 text-left">Booking</th>
              <th className="px-5 py-3 text-right">Gross</th>
              <th className="px-5 py-3 text-right">Coin discount</th>
              <th className="px-5 py-3 text-right">Net</th>
              <th className="px-5 py-3 text-left">Milestone</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Captured</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r) => (
              <tr key={r.id} className="border-t border-ink-100">
                <td className="px-5 py-3 font-mono text-xs">{r.id.slice(0, 8)}…</td>
                <td className="px-5 py-3 font-mono text-xs">{r.booking_id.slice(0, 8)}…</td>
                <td className="px-5 py-3 text-right">₹{Number(r.gross_amount_inr).toLocaleString("en-IN")}</td>
                <td className="px-5 py-3 text-right">−₹{Number(r.coin_discount_inr).toLocaleString("en-IN")}</td>
                <td className="px-5 py-3 text-right font-semibold">₹{Number(r.net_amount_inr).toLocaleString("en-IN")}</td>
                <td className="px-5 py-3">{milestoneLabel(r.milestone_index)}</td>
                <td className="px-5 py-3"><span className={`badge ${r.status === "captured" ? "!bg-emerald-50 !text-emerald-700" : r.status === "failed" ? "!bg-rose-50 !text-rose-700" : "!bg-amber-50 !text-amber-700"}`}>{r.status}</span></td>
                <td className="px-5 py-3 text-ink-500">{r.captured_at ? new Date(r.captured_at).toLocaleString("en-IN") : "—"}</td>
              </tr>
            ))}
            {(!rows || rows.length === 0) && (
              <tr><td colSpan={8} className="px-5 py-10 text-center text-ink-500">No payments yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
