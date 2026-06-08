import Link from "next/link";
import {
  Search, ShieldCheck, CreditCard, Calculator, Scale, BarChart2,
  Video, FileSignature, Banknote, Palette, Brain, TrendingUp,
  FileSearch, Map, GitCompare, Star, DollarSign, UserCheck,
  Home, FileText, Settings, Key, RefreshCw, Truck, Coffee,
  Landmark, Activity, BadgeCheck, ArrowUpCircle, PiggyBank, ArrowRight,
} from "lucide-react";

const SERVICES = [
  { icon: Search, title: "Property Discovery", tag: "Browse" },
  { icon: ShieldCheck, title: "RERA Verification", tag: "Legal" },
  { icon: CreditCard, title: "Loan Eligibility Check", tag: "Finance" },
  { icon: Calculator, title: "EMI Calculator", tag: "Tools" },
  { icon: Scale, title: "Legal Due Diligence", tag: "Legal" },
  { icon: BarChart2, title: "Builder & Project Comparison", tag: "Tools" },
  { icon: Video, title: "Virtual Site Visit", tag: "Discovery" },
  { icon: FileSignature, title: "Booking Assistance", tag: "Booking" },
  { icon: Banknote, title: "Payment Plan Support", tag: "Finance" },
  { icon: Palette, title: "Interior & Design Support", tag: "Post-Buy" },
  { icon: Brain, title: "AI Property Matchmaking", tag: "AI" },
  { icon: TrendingUp, title: "Investment Advisory Score", tag: "AI" },
  { icon: FileSearch, title: "Property Due Diligence Report", tag: "Legal" },
  { icon: Map, title: "Neighborhood Intelligence Report", tag: "Tools" },
  { icon: GitCompare, title: "Mortgage Comparison Engine", tag: "Finance" },
  { icon: Star, title: "Credit Score Assistance", tag: "Finance" },
  { icon: DollarSign, title: "Investment ROI Calculator", tag: "Tools" },
  { icon: UserCheck, title: "Dedicated Relationship Manager", tag: "Support" },
  { icon: Home, title: "Home Inspection Service", tag: "Post-Buy" },
  { icon: FileText, title: "Registry & Documentation", tag: "Legal" },
  { icon: Settings, title: "Property Management", tag: "Post-Buy" },
  { icon: Key, title: "Rental Assistance", tag: "Post-Buy" },
  { icon: RefreshCw, title: "Resale Assistance", tag: "Post-Buy" },
  { icon: Truck, title: "Relocation Assistance", tag: "Post-Buy" },
  { icon: Coffee, title: "Concierge Services", tag: "Support" },
  { icon: Landmark, title: "Wealth & Estate Planning", tag: "Finance" },
  { icon: Activity, title: "Property Health Dashboard", tag: "Tools" },
  { icon: BadgeCheck, title: "Legal Verified by Legalist", tag: "Legal" },
  { icon: ArrowUpCircle, title: "Buy Back / Exit Assistance", tag: "Post-Buy" },
  { icon: PiggyBank, title: "Future Financial Security", tag: "Finance" },
];

const TAG_COLOR: Record<string, string> = {
  Browse: "bg-sky-50 text-sky-700",
  Legal: "bg-violet-50 text-violet-700",
  Finance: "bg-emerald-50 text-emerald-700",
  Tools: "bg-amber-50 text-amber-700",
  Booking: "bg-brand-50 text-brand-700",
  "Post-Buy": "bg-rose-50 text-rose-700",
  AI: "bg-indigo-50 text-indigo-700",
  Support: "bg-orange-50 text-orange-700",
  Discovery: "bg-teal-50 text-teal-700",
};

export default function BuyerServices() {
  return (
    <section className="section bg-ink-50/50">
      <div className="container">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <span className="eyebrow">End-to-end buyer support</span>
            <h2 className="h2 mt-3">30 services, one platform.</h2>
            <p className="mt-2 text-ink-600 max-w-lg">
              From property discovery to post-possession — PRAP guides every step of your home-buying journey.
            </p>
          </div>
          <Link href="/auth/signup" className="btn-primary self-start sm:self-auto shrink-0">
            Get started free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {SERVICES.map(({ icon: Icon, title, tag }) => (
            <div
              key={title}
              className="card p-4 flex items-start gap-3 hover:-translate-y-0.5 hover:shadow-md transition group"
            >
              <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 group-hover:bg-brand-100 transition">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink-900 leading-snug">{title}</p>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${TAG_COLOR[tag] ?? "bg-ink-100 text-ink-600"}`}>
                  {tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
