import { Coins, ShieldCheck, Users, BadgeCheck, Lock, Banknote } from "lucide-react";

const features = [
  {
    icon: Coins,
    title: "PRAP Coin Rewards",
    body: "Earn 25,000 coins on signup, plus visit bonuses up to 30,000 coins and investment tiers up to 75,000 coins.",
  },
  {
    icon: ShieldCheck,
    title: "RERA-only listings",
    body: "Every project on PRAP carries a valid RERA registration number — verified by our compliance team.",
  },
  {
    icon: Lock,
    title: "Aadhaar Booking Lock-in",
    body: "Brokers lock client visits with Aadhaar's last 4 digits — no more double-claims or commission disputes.",
  },
  {
    icon: Users,
    title: "Three roles, one platform",
    body: "Brokers, Corporates and Referrers — each with role-specific tools, dashboards and reward logic.",
  },
  {
    icon: Banknote,
    title: "Milestone Payments",
    body: "50% → 25% → 25% structured payments, with receipts and audit trail on every step.",
  },
  {
    icon: BadgeCheck,
    title: "Bank-grade Redemption",
    body: "Withdraw up to 50% of your balance, capped at ₹1,00,000, directly to your bank or UPI.",
  },
];

export default function Features() {
  return (
    <section className="section bg-white">
      <div className="container">
        <div className="max-w-2xl">
          <span className="eyebrow">Why PRAP</span>
          <h2 className="h2 mt-4">A real-estate platform built for trust & rewards.</h2>
          <p className="mt-4 text-ink-700 text-lg">
            Unlike legacy portals where you only get listings, PRAP turns every step of your
            property journey into measurable rewards — backed by RERA compliance.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card p-6 hover:-translate-y-0.5 hover:shadow-lg transition">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <f.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-ink-900">{f.title}</h3>
              <p className="mt-2 text-ink-700">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
