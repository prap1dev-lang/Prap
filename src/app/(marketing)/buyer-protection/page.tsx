import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import {
  ShieldCheck, Scale, Building2, Wallet, FileCheck2, MapPin, TrendingUp,
  CheckCircle2, Sparkles, ArrowRight, Gavel,
} from "lucide-react";
import CTA from "@/components/site/CTA";

export const metadata = buildMetadata({
  title: "PRAP Buyer Protection Ecosystem™ — Buy Property With Proof",
  description:
    "India's first AI-powered & legally verified homebuyer protection platform. Every property is evaluated through a 50-point Property Health Score (PHS-100) and legally reviewed by Legalist.",
  path: "/buyer-protection",
  keywords: [
    "buyer protection real estate", "RERA verification noida", "property due diligence",
    "legalist property verification", "property health score",
  ],
});

/* ---------------- 50-Point Due Diligence Framework ---------------- */
const framework: { letter: string; title: string; icon: any; points: string[] }[] = [
  {
    letter: "A", title: "Legal Verification", icon: Scale,
    points: [
      "UP-RERA Registration Verified", "RERA Project Details Match Builder Claims",
      "Land Ownership Verified", "Title Search Conducted", "Encumbrance Check Completed",
      "Litigation Status Verified", "Approved Layout Plan Available", "Building Plan Approval Verified",
      "Environmental Clearance Verified", "Occupancy/Completion Certificate Status Checked",
    ],
  },
  {
    letter: "B", title: "Builder Credibility Assessment", icon: Building2,
    points: [
      "Builder Track Record Reviewed", "Previous Project Delivery Timeline Checked",
      "Customer Complaint History Analyzed", "Financial Stability Assessment", "Market Reputation Score",
    ],
  },
  {
    letter: "C", title: "Project Approval Verification", icon: FileCheck2,
    points: [
      "Fire Department Approval", "Airport Authority NOC (If Applicable)",
      "Pollution Control Clearance", "Water Supply Approval", "Electricity Infrastructure Approval",
    ],
  },
  {
    letter: "D", title: "Documentation & Transaction Readiness", icon: FileCheck2,
    points: [
      "Allotment Letter Verification", "Builder-Buyer Agreement Review", "Sale Deed Draft Verification",
      "Possession Letter Readiness", "Registration Documentation Check",
    ],
  },
  {
    letter: "E", title: "Financial Transparency Check", icon: Wallet,
    points: [
      "Base Price Verification", "Hidden Charges Audit", "GST Applicability Review",
      "Payment Plan Analysis", "Cost Escalation Risk Assessment",
    ],
  },
  {
    letter: "F", title: "Home Loan Readiness", icon: Wallet,
    points: [
      "Bank Approval Status", "Loan Eligibility Assessment", "Interest Rate Comparison",
      "EMI Affordability Check", "Loan Documentation Support",
    ],
  },
  {
    letter: "G", title: "Possession & Registry Risk Check", icon: FileCheck2,
    points: [
      "Construction Progress Verification", "Possession Timeline Validation",
      "Registry Eligibility Verification", "Maintenance Handover Readiness", "Common Area Completion Status",
    ],
  },
  {
    letter: "H", title: "Location & Connectivity Analysis", icon: MapPin,
    points: [
      "Metro Connectivity Score", "Highway & Expressway Access", "School Accessibility",
      "Hospital Accessibility", "Commercial Hub Proximity",
    ],
  },
  {
    letter: "I", title: "Investment Potential Assessment", icon: TrendingUp,
    points: [
      "Capital Appreciation Score", "Rental Yield Analysis", "Future Infrastructure Impact",
      "Supply vs Demand Assessment", "Exit & Resale Potential Score",
    ],
  },
];

/* ---------------- PHS-100 bands ---------------- */
const bands = [
  { range: "90–100", label: "PRAP Platinum Verified", note: "Lowest Risk · Highly Recommended", dot: "bg-emerald-500", text: "text-emerald-700" },
  { range: "80–89", label: "PRAP Gold Verified", note: "Strong Buy Opportunity", dot: "bg-emerald-400", text: "text-emerald-700" },
  { range: "70–79", label: "PRAP Recommended", note: "Recommended With Minor Risks", dot: "bg-amber-400", text: "text-amber-700" },
  { range: "60–69", label: "PRAP Caution", note: "Requires Detailed Review", dot: "bg-orange-500", text: "text-orange-700" },
  { range: "Below 60", label: "PRAP Risk Alert", note: "Buyer Attention Required", dot: "bg-rose-500", text: "text-rose-700" },
];

/* ---------------- Buyer Protection Shield inclusions ---------------- */
const shield = [
  "Legalist Legal Verification", "RERA Compliance Verification", "Builder Risk Assessment",
  "Property Health Score", "Fair Price Analysis", "Loan Assistance",
  "Registry Support", "Possession Inspection", "Defect Reporting", "Post-Possession Support",
];

const differentiators = [
  { who: "Real Estate Portals", does: "List Properties" },
  { who: "Builders", does: "Sell Properties" },
  { who: "Brokers", does: "Close Deals" },
  { who: "PRAP", does: "Protects Buyers", highlight: true },
];

export default function BuyerProtectionPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-fade" />
        <div className="container relative py-16 md:py-20">
          <span className="eyebrow"><ShieldCheck className="h-3.5 w-3.5" /> Buyer Protection Ecosystem™</span>
          <h1 className="h1 mt-5 max-w-4xl">
            Buy Property With Proof.<br />
            <span className="text-brand-600">Verified Before You Invest.</span>
          </h1>
          <p className="mt-5 text-ink-700 text-lg max-w-2xl">
            India's first AI-powered &amp; legally verified homebuyer protection platform.
            Most portals sell properties — <strong>PRAP protects buyers</strong> through AI property
            intelligence, legal verification by Legalist, financial analysis and buyer advocacy.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/buyer-protection/health-score" className="btn-primary">
              Try the PHS-100 calculator <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/projects" className="btn-outline">Browse verified projects</Link>
          </div>
          <p className="mt-6 inline-flex items-center gap-2 text-sm text-ink-500">
            <Gavel className="h-4 w-4 text-brand-600" /> Legally Managed by{" "}
            <a href="https://legalist.in/" target="_blank" rel="noreferrer" className="font-semibold text-brand-700 underline">Legalist</a>
            <span className="text-ink-300">·</span> Property · Legal · Finance · Compliance · Registry · RERA
          </p>
        </div>
      </section>

      {/* PHS-100 bands */}
      <section className="section bg-ink-50">
        <div className="container">
          <div className="max-w-2xl">
            <span className="eyebrow"><Sparkles className="h-3.5 w-3.5" /> PHS-100</span>
            <h2 className="h2 mt-4">PRAP Property Health Score</h2>
            <p className="mt-4 text-ink-700 text-lg">
              Every property is scored 0–100 across legal, builder, financial, registry,
              location and investment dimensions — then assigned a verification tier.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {bands.map((b) => (
              <div key={b.label} className="card p-5">
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-500">
                  <span className={`h-2.5 w-2.5 rounded-full ${b.dot}`} /> {b.range}
                </span>
                <p className={`mt-3 font-bold ${b.text}`}>{b.label}</p>
                <p className="mt-1 text-sm text-ink-600">{b.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 50-point framework */}
      <section className="section">
        <div className="container">
          <div className="max-w-2xl">
            <span className="eyebrow"><FileCheck2 className="h-3.5 w-3.5" /> 50-Point Framework</span>
            <h2 className="h2 mt-4">50-Point Buyer Due Diligence</h2>
            <p className="mt-4 text-ink-700 text-lg">
              A structured, legally reviewed checklist across nine categories — every point
              independently verified before a property earns its PRAP score.
            </p>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {framework.map((g) => (
              <div key={g.letter} className="card p-6">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white font-extrabold">{g.letter}</span>
                  <div>
                    <h3 className="font-bold leading-tight">{g.title}</h3>
                    <p className="text-xs text-ink-500">{g.points.length} checkpoints</p>
                  </div>
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  {g.points.map((p, i) => (
                    <li key={p} className="flex items-start gap-2 text-ink-700">
                      <CheckCircle2 className="h-4 w-4 text-brand-500 mt-0.5 flex-none" />
                      <span>{i + offsetFor(g.letter)}. {p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Buyer Protection Shield */}
      <section className="section bg-ink-50">
        <div className="container grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="eyebrow"><ShieldCheck className="h-3.5 w-3.5" /> Buyer Protection Shield™</span>
            <h2 className="h2 mt-4">Premium buyer advocacy — before, during &amp; after purchase.</h2>
            <p className="mt-4 text-ink-700 text-lg">
              A concierge layer that combines legal verification, risk assessment and
              post-possession support so you never face a builder alone.
            </p>
            <Link href="/contact" className="btn-primary mt-6">Activate Buyer Shield <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="card p-7 grid sm:grid-cols-2 gap-3">
            {shield.map((s) => (
              <div key={s} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-none" /> <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why PRAP is different */}
      <section className="section">
        <div className="container">
          <div className="max-w-2xl">
            <h2 className="h2">Why PRAP is different</h2>
            <p className="mt-4 text-ink-700 text-lg">
              PRAP works exclusively in the buyer's interest — AI, legal intelligence,
              financial analysis and advocacy in one integrated platform.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {differentiators.map((d) => (
              <div key={d.who} className={`card p-6 ${d.highlight ? "ring-2 ring-brand-500 border-brand-300" : ""}`}>
                <p className="text-sm text-ink-500">{d.who}</p>
                <p className={`mt-2 text-xl font-extrabold ${d.highlight ? "text-brand-700" : "text-ink-900"}`}>{d.does}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 rounded-2xl bg-brand-600 text-white p-7 md:p-10 text-center">
            <p className="text-lg md:text-xl font-semibold max-w-3xl mx-auto">
              "Every property listed on PRAP is evaluated through a 50-Point Property Health Score
              (PHS-100) framework and legally reviewed by Legalist to enhance transparency,
              compliance, and buyer confidence."
            </p>
            <p className="mt-4 text-brand-100 text-sm">Buy Property With Proof™ · Verified Before You Invest™</p>
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}

/** Continuous 1–50 numbering across the nine A–I categories. */
function offsetFor(letter: string) {
  const sizes: Record<string, number> = { A: 0, B: 10, C: 15, D: 20, E: 25, F: 30, G: 35, H: 40, I: 45 };
  return (sizes[letter] ?? 0) + 1;
}
