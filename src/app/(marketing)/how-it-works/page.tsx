import HowItWorks from "@/components/site/HowItWorks";
import RewardCalculator from "@/components/site/RewardCalculator";
import FAQ from "@/components/site/FAQ";
import CTA from "@/components/site/CTA";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "How PRAP works — earn rewards on every site visit",
  description:
    "Step-by-step guide: sign up, choose a role, visit RERA-verified properties, earn PRAP Coins, and redeem to bank — all with milestone-based payments and Aadhaar lock-in.",
  path: "/how-it-works",
});

export default function Page() {
  return (
    <>
      <section className="container pt-14 pb-4">
        <h1 className="h1">How PRAP works</h1>
        <p className="mt-4 text-ink-700 text-lg max-w-2xl">
          PRAP turns the property buying journey into a measurable reward stream — for buyers,
          brokers and corporate referrers alike.
        </p>
      </section>
      <HowItWorks />
      <RewardCalculator />
      <FAQ />
      <CTA />
    </>
  );
}
