import Link from "next/link";
import { ArrowUpRight, Briefcase, Building2, UserRound } from "lucide-react";

const roles = [
  {
    icon: Briefcase,
    title: "Brokers",
    body: "Lock client visits with Aadhaar last-4. Manage your calendar, client pipeline & commissions in one dashboard.",
    href: "/for-brokers",
    cta: "Start as a Broker",
  },
  {
    icon: Building2,
    title: "Corporates",
    body: "Generate unique referral codes for your employees & network. Earn 5,000 coins on every referred visit.",
    href: "/for-corporates",
    cta: "Start as a Corporate",
  },
  {
    icon: UserRound,
    title: "Referrers",
    body: "Sign up with your corporate's code and earn 10,000 coins per visit, plus tiered investment bonuses.",
    href: "/for-referrers",
    cta: "Start as a Referrer",
  },
];

export default function RolesSplit() {
  return (
    <section className="section bg-white">
      <div className="container">
        <div className="max-w-2xl">
          <span className="eyebrow">Built for three audiences</span>
          <h2 className="h2 mt-4">One platform, three role-tuned experiences.</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {roles.map((r) => (
            <div key={r.title} className="card p-7 flex flex-col">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <r.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-xl font-bold">{r.title}</h3>
              <p className="mt-2 text-ink-700">{r.body}</p>
              <Link href={r.href} className="mt-6 inline-flex items-center gap-1 text-brand-700 font-semibold hover:gap-2 transition-all">
                {r.cta} <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
