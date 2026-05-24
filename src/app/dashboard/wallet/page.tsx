import Link from "next/link";
import { Coins, ArrowDownToLine } from "lucide-react";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Wallet", path: "/dashboard/wallet", noIndex: true });

const ledger = [
  { id: "L-0001", date: "2026-05-12", desc: "Onboarding bonus", delta: 25000, type: "credit" },
];

export default function WalletPage() {
  return (
    <div className="space-y-8 max-w-5xl">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Wallet</h1>
          <p className="mt-1 text-ink-500">Track every coin earned, redeemed and spent.</p>
        </div>
        <Link href="/dashboard/redeem" className="btn-primary">
          <ArrowDownToLine className="h-4 w-4" /> Redeem
        </Link>
      </header>

      <section className="grid gap-5 md:grid-cols-3">
        <div className="card p-6">
          <p className="text-sm text-ink-500">Balance</p>
          <p className="mt-2 text-3xl font-extrabold">25,000 <span className="text-brand-600">Coins</span></p>
          <p className="text-xs text-ink-500">≈ ₹25,000</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-ink-500">Redeemable now</p>
          <p className="mt-2 text-3xl font-extrabold">₹0</p>
          <p className="text-xs text-ink-500">Unlocks after 50% property payment</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-ink-500">Lifetime earnings</p>
          <p className="mt-2 text-3xl font-extrabold">25,000</p>
          <p className="text-xs text-ink-500">Across all sources</p>
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-ink-100">
          <h2 className="font-bold">Coin ledger</h2>
          <button className="text-sm text-brand-700 hover:underline">Export CSV</button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-500 uppercase text-xs">
            <tr>
              <th className="px-5 py-3 text-left">Ref</th>
              <th className="px-5 py-3 text-left">Date</th>
              <th className="px-5 py-3 text-left">Description</th>
              <th className="px-5 py-3 text-right">Coins</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map((l) => (
              <tr key={l.id} className="border-t border-ink-100">
                <td className="px-5 py-3 font-mono text-ink-700">{l.id}</td>
                <td className="px-5 py-3">{l.date}</td>
                <td className="px-5 py-3">{l.desc}</td>
                <td className={`px-5 py-3 text-right font-semibold ${l.type === "credit" ? "text-emerald-700" : "text-rose-700"}`}>
                  {l.type === "credit" ? "+" : "-"}{l.delta.toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
