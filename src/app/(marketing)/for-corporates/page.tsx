import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { Building2, Code, Gift, Users, BarChart3, ShieldCheck } from "lucide-react";
import CTA from "@/components/site/CTA";

export const metadata = buildMetadata({
  title: "For Corporates — referral rewards for your employees",
  description:
    "Generate a unique PRAP referral code for your company. Earn 5,000 coins on every employee site visit and offer them a real-estate buying benefit.",
  path: "/for-corporates",
  keywords: ["corporate referral real estate", "employee benefits property", "company referral code"],
});

const benefits = [
  { icon: Code, title: "Unique referral code", body: "One code, all your employees. Branded landing for your team." },
  { icon: Users, title: "Bulk onboarding", body: "CSV-upload your team or share an invite link — zero IT overhead." },
  { icon: Gift, title: "5,000 coins/visit", body: "You earn 5,000 PRAP Coins each time a referred employee completes site visits 1 & 2." },
  { icon: BarChart3, title: "Live dashboard", body: "Track referred users, visits, bookings, milestones and total earned coins." },
  { icon: ShieldCheck, title: "Compliant payouts", body: "TDS-compliant payouts to your company current account or wallet." },
  { icon: Building2, title: "HR Integration", body: "Embed PRAP as an HR perk — boost retention with a real-estate benefit." },
];

export default function Page() {
  return (
    <>
      <section className="container py-14">
        <h1 className="h1">For Corporates & HR Teams</h1>
        <p className="mt-4 text-ink-700 text-lg max-w-2xl">
          Turn property buying into a real, measurable employee benefit. Generate your
          unique PRAP referral code, share it with your team, and earn on every site visit.
        </p>
        <div className="mt-7 flex gap-3">
          <Link href="/auth/signup?role=corporate" className="btn-primary">Generate your code</Link>
          <Link href="/contact" className="btn-outline">Book HR demo</Link>
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
