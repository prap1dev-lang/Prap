import FAQ from "@/components/site/FAQ";
import CTA from "@/components/site/CTA";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "FAQs — PRAP coins, redemption, lock-in & more",
  description:
    "Answers to common questions about PRAP Coins, RERA compliance, site-visit bonuses, broker lock-in, redemption rules and corporate referral codes.",
  path: "/faq",
});

export default function Page() {
  return (
    <>
      <section className="container pt-14 pb-2">
        <h1 className="h1">Frequently asked questions</h1>
        <p className="mt-3 text-ink-700 text-lg max-w-2xl">
          Quick answers to the questions buyers, brokers and corporate referrers ask us most.
        </p>
      </section>
      <FAQ />
      <CTA />
    </>
  );
}
