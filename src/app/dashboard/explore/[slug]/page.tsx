import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { findExplore } from "@/lib/dashboard-nav";
import { Sparkles, ArrowRight, Building2, Calculator, ShieldCheck, Bell } from "lucide-react";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { slug: string } }) {
  const found = findExplore(params.slug);
  return buildMetadata({ title: found?.label ?? "Explore", path: `/dashboard/explore/${params.slug}`, noIndex: true });
}

// Where each group points its primary CTA.
const GROUP_CTA: Record<string, { href: string; label: string; icon: any }> = {
  Properties: { href: "/dashboard/projects", label: "Browse projects", icon: Building2 },
  "AI Property Tools": { href: "/buyer-protection/health-score", label: "Try Property Health Score™", icon: Sparkles },
  Calculators: { href: "/dashboard/calculators", label: "Open calculators", icon: Calculator },
  "Legalist Services": { href: "/buyer-protection", label: "Buyer Protection", icon: ShieldCheck },
  Notifications: { href: "/dashboard", label: "Back to dashboard", icon: Bell },
};

export default function ExplorePage({ params }: { params: { slug: string } }) {
  const found = findExplore(params.slug);
  if (!found) notFound();

  const cta = GROUP_CTA[found.group] ?? { href: "/dashboard/projects", label: "Browse projects", icon: Building2 };
  const Icon = cta.icon;

  return (
    <div className="max-w-3xl">
      <p className="eyebrow">{found.group}</p>
      <h1 className="font-serif text-4xl md:text-5xl font-light tracking-tight mt-3">{found.label}</h1>
      <p className="mt-5 text-lg text-ink-600 font-light leading-relaxed">
        {copyFor(found.group, found.label)}
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link href={cta.href} className="btn-primary">
          {cta.label} <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/contact" className="btn-link text-ink-700">Talk to our team</Link>
      </div>

      {/* On-brand "what's inside" preview so the page never feels empty */}
      <div className="mt-12 grid sm:grid-cols-3 gap-px rounded-3xl overflow-hidden bg-ink-900/5">
        {HIGHLIGHTS.map((h) => (
          <div key={h.t} className="bg-white p-6">
            <Icon className="h-5 w-5 text-brand-600" strokeWidth={1.5} />
            <p className="mt-3 font-serif text-lg text-ink-900">{h.t}</p>
            <p className="mt-1 text-sm text-ink-500 leading-relaxed">{h.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 glass !bg-white/70 p-6">
        <p className="text-sm text-ink-600">
          <span className="font-medium text-ink-900">Rolling out soon.</span> This experience is being
          tailored for your account. Meanwhile, explore verified projects and your wallet from the menu.
        </p>
      </div>
    </div>
  );
}

const HIGHLIGHTS = [
  { t: "Verified first", d: "Every property is legally reviewed before it reaches you." },
  { t: "Earn as you go", d: "PRAP Coins on visits, milestones and referrals." },
  { t: "Always transparent", d: "No hidden charges, no surprises, full clarity." },
];

function copyFor(group: string, label: string) {
  switch (group) {
    case "Properties":
      return `Discover ${label.toLowerCase()} across Noida, Greater Noida and the Yamuna Expressway — all RERA-verified and builder-direct.`;
    case "AI Property Tools":
      return `${label} uses PRAP's intelligence engine to score and de-risk every property decision you make.`;
    case "Calculators":
      return `Plan your purchase with the ${label.toLowerCase()} — transparent, bank-standard math.`;
    case "Loan Assistance":
      return `Our loan desk helps you with ${label.toLowerCase()} across partner banks, end to end.`;
    case "Customer Services":
      return `Concierge ${label.toLowerCase()} to make every visit and decision effortless.`;
    case "Legalist Services":
      return `${label}, managed by Legalist — property, legal, registry and RERA compliance in one place.`;
    case "Investor Zone":
      return `${label} — curated opportunities and insights for serious property investors.`;
    case "Broker / Agent Zone":
      return `${label} for channel partners — manage clients, leads and commissions in one dashboard.`;
    case "Notifications":
      return `Stay on top of ${label.toLowerCase()} the moment something matters to you.`;
    case "Resources":
      return `${label} — guidance to help you buy smarter and invest with confidence.`;
    default:
      return `${label} — part of the PRAP Buyer Protection ecosystem.`;
  }
}
