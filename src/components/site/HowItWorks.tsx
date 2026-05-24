import { UserPlus, MapPinned, Wallet, CircleDollarSign } from "lucide-react";

const steps = [
  {
    n: "01",
    icon: UserPlus,
    title: "Sign up & get 25,000 Coins",
    body: "Choose your role — Broker, Corporate or Referrer. Complete KYC with Aadhaar & PAN and instantly receive 25,000 PRAP Coins.",
  },
  {
    n: "02",
    icon: MapPinned,
    title: "Visit verified projects",
    body: "Schedule site visits with builders directly. Earn 10,000 coins each on visits 1 & 2; corporates earn 5,000 per visit on referred users.",
  },
  {
    n: "03",
    icon: CircleDollarSign,
    title: "Book on platform",
    body: "Book your home with token money on visit 3 or 4. Pay in 50/25/25 milestones via Razorpay with full audit trail.",
  },
  {
    n: "04",
    icon: Wallet,
    title: "Redeem to bank",
    body: "Once 50% property payment is paid, redeem up to 50% of your coin balance — to your bank or UPI, capped at ₹1,00,000 per cycle.",
  },
];

export default function HowItWorks() {
  return (
    <section className="section bg-ink-50/50">
      <div className="container">
        <div className="max-w-2xl">
          <span className="eyebrow">How PRAP works</span>
          <h2 className="h2 mt-4">From signup to keys — earn at every step.</h2>
        </div>
        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <li key={s.n} className="card p-6 relative">
              <span className="absolute -top-3 left-6 inline-flex items-center justify-center h-7 px-3 rounded-full bg-brand-600 text-white text-xs font-bold">
                STEP {s.n}
              </span>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-ink-900 text-white">
                <s.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-ink-900">{s.title}</h3>
              <p className="mt-2 text-ink-700 text-sm leading-relaxed">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
