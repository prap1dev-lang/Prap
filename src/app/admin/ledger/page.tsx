import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Coin Ledger · Admin", path: "/admin/ledger", noIndex: true });

const rows = [
  { id: "L-1001", user: "U-0003", source: "onboarding", delta: 25000, balanceAfter: 25000, at: "2026-05-12 09:42" },
  { id: "L-1002", user: "U-0003", source: "visit_1",    delta: 10000, balanceAfter: 35000, at: "2026-05-13 16:10" },
  { id: "L-1003", user: "U-0001", source: "redemption", delta: -50000, balanceAfter: 75000, at: "2026-05-14 11:01" },
];

export default function LedgerPage() {
  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Coin Ledger</h1>
      <p className="mt-2 text-ink-500">Immutable, append-only record of every coin credit & debit.</p>
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
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-ink-100">
                <td className="px-5 py-3 font-mono">{r.id}</td>
                <td className="px-5 py-3 font-mono">{r.user}</td>
                <td className="px-5 py-3">{r.source}</td>
                <td className={`px-5 py-3 text-right font-semibold ${r.delta > 0 ? "text-emerald-700" : "text-rose-700"}`}>
                  {r.delta > 0 ? "+" : ""}{r.delta.toLocaleString("en-IN")}
                </td>
                <td className="px-5 py-3 text-right">{r.balanceAfter.toLocaleString("en-IN")}</td>
                <td className="px-5 py-3 text-ink-500">{r.at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
