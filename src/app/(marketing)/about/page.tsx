import { buildMetadata } from "@/lib/seo";
import CTA from "@/components/site/CTA";

export const metadata = buildMetadata({
  title: "About PRAP — Property Referral Award Platform",
  description:
    "PRAP is rebuilding India's real-estate experience around transparency, RERA-compliance and real cash rewards for buyers, brokers and corporate referrers.",
  path: "/about",
});

export default function Page() {
  return (
    <>
      <section className="container py-14">
        <h1 className="h1">About PRAP</h1>
        <p className="mt-4 text-ink-700 text-lg max-w-3xl">
          PRAP — short for Property Referral Award Platform — is India's first
          reward-driven real-estate ecosystem. Where 99acres, Magicbricks and Housing.com
          stop at listings, we go further: every site visit, milestone payment and
          corporate referral earns you real money in your PRAP wallet.
        </p>
        <div className="mt-10 grid lg:grid-cols-3 gap-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold">Our mission</h2>
            <p className="mt-2 text-ink-700">
              Make buying a home in India transparent, rewarding and stress-free —
              starting in Noida, scaling to every Tier-1 & Tier-2 city.
            </p>
          </div>
          <div className="card p-6">
            <h2 className="text-lg font-bold">Why RERA-only</h2>
            <p className="mt-2 text-ink-700">
              Every project on PRAP is manually checked against the official RERA portal.
              No grey-channel inventory. Ever.
            </p>
          </div>
          <div className="card p-6">
            <h2 className="text-lg font-bold">Why rewards</h2>
            <p className="mt-2 text-ink-700">
              Buyers spend hours researching. Brokers risk commission leakage. PRAP turns
              that effort into measurable value — 1 Coin = ₹1, redeemable to your bank.
            </p>
          </div>
        </div>
      </section>
      <CTA />
    </>
  );
}
