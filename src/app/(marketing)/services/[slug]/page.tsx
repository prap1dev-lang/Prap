import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { findService } from "@/lib/services-nav";
import { Building2, Sparkles, Calculator, ShieldCheck, ArrowUpRight } from "lucide-react";
import CTA from "@/components/site/CTA";

export function generateMetadata({ params }: { params: { slug: string } }) {
  const found = findService(params.slug);
  return buildMetadata({
    title: found ? `${found.label} — PRAP` : "Service",
    description: found
      ? `${found.label} on PRAP — India's first AI-powered, legally-verified homebuyer protection platform.`
      : undefined,
    path: `/services/${params.slug}`,
  });
}

const GROUP_CTA: Record<string, { href: string; label: string; icon: any }> = {
  Properties: { href: "/projects", label: "Browse verified projects", icon: Building2 },
  "AI Property Tools": { href: "/buyer-protection/health-score", label: "Try Property Health Score™", icon: Sparkles },
  Calculators: { href: "/buyer-protection", label: "Explore Buyer Protection", icon: Calculator },
  "Legalist Services": { href: "/buyer-protection", label: "Buyer Protection", icon: ShieldCheck },
};

export default function ServicePage({ params }: { params: { slug: string } }) {
  const found = findService(params.slug);
  if (!found) notFound();

  const cta = GROUP_CTA[found.group] ?? { href: "/projects", label: "Browse projects", icon: Building2 };
  const Icon = cta.icon;

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-grid-fade opacity-70" />
        <div className="container py-20 md:py-28 max-w-3xl">
          <p className="eyebrow">{found.group}</p>
          <h1 className="h1 mt-4">{found.label}</h1>
          <p className="mt-6 text-lg md:text-xl text-ink-600 font-light leading-relaxed">
            {copyFor(found.group, found.label)}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href={cta.href} className="btn-primary">
              {cta.label} <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="/auth/signup" className="btn-link text-ink-700">Create your free account</Link>
          </div>

          <div className="mt-16 grid sm:grid-cols-3 gap-px rounded-3xl overflow-hidden bg-ink-900/5">
            {HIGHLIGHTS.map((h) => (
              <div key={h.t} className="bg-white p-6">
                <Icon className="h-5 w-5 text-brand-600" strokeWidth={1.5} />
                <p className="mt-3 font-serif text-lg text-ink-900">{h.t}</p>
                <p className="mt-1 text-sm text-ink-500 leading-relaxed">{h.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CTA />
    </>
  );
}

const HIGHLIGHTS = [
  { t: "Verified first", d: "Every property is legally reviewed by Legalist before it reaches you." },
  { t: "Earn as you go", d: "PRAP Coins on visits, milestones and referrals — redeemable to bank." },
  { t: "Always transparent", d: "Hidden charges, delays and risk surfaced before you commit." },
];

function copyFor(group: string, label: string) {
  switch (group) {
    case "Properties":
      return `Explore ${label.toLowerCase()} across Noida, Greater Noida and the Yamuna Expressway — all RERA-verified and builder-direct, with zero brokerage.`;
    case "AI Property Tools":
      return `${label} applies PRAP's intelligence engine to score and de-risk every property decision you make.`;
    case "Calculators":
      return `Plan your purchase with the ${label.toLowerCase()} — transparent, bank-standard math you can trust.`;
    case "Legalist Services":
      return `${label}, managed by Legalist — property, legal, registry and RERA compliance in one place.`;
    case "Loan Assistance":
      return `Our loan desk handles ${label.toLowerCase()} across partner banks, end to end.`;
    case "Customer Services":
      return `Concierge ${label.toLowerCase()} that makes every visit and decision effortless.`;
    case "Investor Zone":
      return `${label} — curated opportunities and insights for serious property investors.`;
    case "For Brokers":
      return `${label} for channel partners — manage clients, leads and commissions in one place.`;
    default:
      return `${label} — part of the PRAP Buyer Protection ecosystem.`;
  }
}
