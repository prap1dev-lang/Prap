import Link from "next/link";
import { Coins, ArrowUpRight, Calendar, TrendingUp, Sparkles, Copy } from "lucide-react";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Dashboard", path: "/dashboard", noIndex: true });

export default function Dashboard({ searchParams }: { searchParams?: { role?: string; welcome?: string } }) {
  const role = (searchParams?.role || "referrer") as "broker" | "corporate" | "referrer";
  const welcome = searchParams?.welcome === "1";
  const refCode = "PRAP-AB12CD"; // placeholder

  return (
    <div className="space-y-8 max-w-6xl">
      {welcome && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-emerald-600 flex-none mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-900">Welcome to PRAP!</p>
            <p className="text-sm text-emerald-800">25,000 PRAP Coins (₹25,000) have been credited to your wallet.</p>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm text-ink-500 capitalize">{role} dashboard</p>
          <h1 className="text-3xl font-extrabold tracking-tight">Hello, Investor 👋</h1>
        </div>
        <Link href="/projects" className="btn-primary">Book a site visit</Link>
      </header>

      <section className="grid gap-5 md:grid-cols-3">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-500">PRAP Coin balance</p>
            <Coins className="h-5 w-5 text-brand-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold">25,000</p>
          <p className="text-xs text-ink-500">≈ ₹25,000 · Redeemable after 50% milestone</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-500">Site visits</p>
            <Calendar className="h-5 w-5 text-brand-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold">0 / 2</p>
          <p className="text-xs text-ink-500">10,000 coins per visit (max 2 visits)</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-500">Lifetime earnings</p>
            <TrendingUp className="h-5 w-5 text-brand-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold">₹0</p>
          <p className="text-xs text-ink-500">Across all redemptions to bank</p>
        </div>
      </section>

      {role === "corporate" && (
        <section className="card p-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm text-ink-500">Your corporate referral code</p>
              <p className="mt-1 font-mono text-2xl font-extrabold tracking-tight">{refCode}</p>
              <p className="mt-2 text-sm text-ink-700">Share this code with employees & partners. You earn 5,000 coins per visit.</p>
            </div>
            <button className="btn-outline">
              <Copy className="h-4 w-4" /> Copy code
            </button>
          </div>
        </section>
      )}

      {role === "broker" && (
        <section className="card p-6">
          <p className="text-sm text-ink-500">RERA verification status</p>
          <p className="mt-1 text-lg font-bold text-amber-700">Pending admin review</p>
          <p className="mt-2 text-sm text-ink-700">
            Your UP-RERA registration is queued for verification. You'll be able to book client visits within 1 business day.
          </p>
        </section>
      )}

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-bold">Next steps</h2>
          <ol className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-3"><span className="badge !bg-brand-600 !text-white">1</span> Complete profile & upload KYC docs.</li>
            <li className="flex items-start gap-3"><span className="badge">2</span> Book a site visit from any RERA-verified project.</li>
            <li className="flex items-start gap-3"><span className="badge">3</span> Earn 10,000 coins per visit (max 2).</li>
            <li className="flex items-start gap-3"><span className="badge">4</span> Book your property — pay 50% to unlock redemption.</li>
          </ol>
          <Link href="/dashboard/settings" className="btn-outline mt-5">
            Complete profile <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold">Recent activity</h2>
          <ul className="mt-4 divide-y divide-ink-100 text-sm">
            <li className="py-3 flex items-center justify-between">
              <span>Onboarding bonus credited</span>
              <span className="font-semibold text-emerald-700">+25,000</span>
            </li>
            <li className="py-3 text-ink-500">No site visits yet.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
