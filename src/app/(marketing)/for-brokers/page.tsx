import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { Briefcase, Lock, Calendar, TrendingUp, ShieldCheck, Sparkles } from "lucide-react";
import CTA from "@/components/site/CTA";

export const metadata = buildMetadata({
  title: "For Brokers & Channel Partners — Aadhaar-locked commissions",
  description:
    "PRAP gives brokers Aadhaar-based client lock-in, calendar-driven site visits, real-time commission tracking and zero leakage. Onboard your brokerage today.",
  path: "/for-brokers",
  keywords: ["broker portal noida", "channel partner real estate", "RERA broker noida"],
});

const benefits = [
  { icon: Lock, title: "Aadhaar Lock-in", body: "Your client, your project, your commission. Aadhaar last-4 + 2 family members locks the lead to you." },
  { icon: Calendar, title: "Site-visit Calendar", body: "Manage builder slots, edit visits and avoid double-booking with a built-in calendar." },
  { icon: TrendingUp, title: "Live Pipeline", body: "Real-time status from visit → booking → milestone → commission credit." },
  { icon: ShieldCheck, title: "RERA-only inventory", body: "Only RERA-verified projects — zero compliance risk." },
  { icon: Sparkles, title: "Coins on top of commission", body: "Your clients earn PRAP Coins; you keep your full builder commission." },
  { icon: Briefcase, title: "Bulk team accounts", body: "Run an entire brokerage on PRAP — sub-accounts, attribution & analytics." },
];

export default function Page() {
  return (
    <>
      <section className="container py-14">
        <h1 className="h1">For Brokers & Channel Partners</h1>
        <p className="mt-4 text-ink-700 text-lg max-w-2xl">
          Stop losing commissions to client poaching. PRAP locks every site visit
          to you with Aadhaar verification and gives you a single dashboard for visits,
          payments and payouts.
        </p>
        <div className="mt-7 flex gap-3">
          <Link href="/auth/signup?role=broker" className="btn-primary">Onboard as a Broker</Link>
          <Link href="/contact" className="btn-outline">Talk to sales</Link>
        </div>
      </section>
      <section className="container pb-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {benefits.map((b) => (
          <div key={b.title} className="card p-6">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <b.icon className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-lg font-bold">{b.title}</h2>
            <p className="mt-2 text-ink-700">{b.body}</p>
          </div>
        ))}
      </section>
      <CTA />
    </>
  );
}
