import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { UserRound, Wallet, Banknote, MapPinned, HandCoins, Sparkles } from "lucide-react";
import CTA from "@/components/site/CTA";

export const metadata = buildMetadata({
  title: "For Referrers — earn ₹25,000+ visiting properties",
  description:
    "Got a corporate referral code? Sign up on PRAP, visit RERA properties with your family, earn up to 1.3 lakh PRAP Coins, and redeem to bank.",
  path: "/for-referrers",
  keywords: ["earn money real estate referral", "visit property earn cash", "PRAP referrer signup"],
});

const benefits = [
  { icon: Sparkles, title: "25,000 coins on signup", body: "Instant credit to your wallet the moment you complete KYC." },
  { icon: MapPinned, title: "10,000 coins/visit", body: "Earn on visits 1 & 2 — minimum 2 family members must accompany." },
  { icon: HandCoins, title: "Up to 75,000 coins", body: "Investment-tiered bonus when you book your home on PRAP." },
  { icon: Banknote, title: "Bank/UPI redemption", body: "Withdraw up to ₹1,00,000 once 50% of property payment is paid." },
  { icon: Wallet, title: "Coin-as-discount", body: "Apply coins directly against your milestone — 1 coin = ₹1." },
  { icon: UserRound, title: "Family-friendly", body: "Add up to 2 family members for visit verification — securely." },
];

export default function Page() {
  return (
    <>
      <section className="container py-14">
        <h1 className="h1">For Referrers</h1>
        <p className="mt-4 text-ink-700 text-lg max-w-2xl">
          Got a corporate referral code? Sign up free, visit your favourite RERA-verified
          projects, and watch your PRAP wallet fill up. Redeem to bank when ready.
        </p>
        <div className="mt-7 flex gap-3">
          <Link href="/auth/signup?role=referrer" className="btn-primary">Start as a Referrer</Link>
          <Link href="/projects" className="btn-outline">See projects</Link>
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
