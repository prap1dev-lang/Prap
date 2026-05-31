import { buildMetadata } from "@/lib/seo";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";

export const metadata = buildMetadata({ title: "Coin Ledger · Admin", path: "/admin/ledger", noIndex: true });
export const dynamic = "force-dynamic";

export default async function LedgerPage() {
  await requireAdmin();
  const sb = supabaseAdmin();
  const { data: rows } = await sb
    .from("coin_ledger")
    .select("id, user_id, source, delta, balance_after, at, notes")
    .order("at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Coin Ledger</h1>
      <p className="mt-2 text-ink-500">Immutable, append-only record of every coin credit & debit (last 200).</p>
      <div className="card mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-500 uppercase text-xs">
            <tr>
              <th className="px-5 py-3 text-left">Ref</th>
              <th className="px-5 py-3 text-left">User</th>
              <th className="px-5 py-3 text-left">Source</th>
              <th className="px-5 py-3 text-right">Delta</th>
              <th className="px-5 py-3 text-right">Balance after</th>
              <th className="px-5 py-3 text-left">When</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r) => (
              <tr key={r.id} className="border-t border-ink-100">
                <td className="px-5 py-3 font-mono text-xs">{r.id.slice(0, 8)}…</td>
                <td className="px-5 py-3 font-mono text-xs">{r.user_id.slice(0, 8)}…</td>
                <td className="px-5 py-3">{r.source}</td>
                <td className={`px-5 py-3 text-right font-semibold ${r.delta > 0 ? "text-emerald-700" : "text-rose-700"}`}>
                  {r.delta > 0 ? "+" : ""}{Number(r.delta).toLocaleString("en-IN")}
                </td>
                <td className="px-5 py-3 text-right">{Number(r.balance_after).toLocaleString("en-IN")}</td>
                <td className="px-5 py-3 text-ink-500">{new Date(r.at).toLocaleString("en-IN")}</td>
              </tr>
            ))}
            {(!rows || rows.length === 0) && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-ink-500">No ledger entries yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
