import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { Sparkles, ArrowLeft } from "lucide-react";
import HealthScoreCalculator from "@/components/site/HealthScoreCalculator";
import CTA from "@/components/site/CTA";

export const metadata = buildMetadata({
  title: "PRAP Property Health Score™ (PHS-100) Calculator",
  description:
    "Estimate any property's PRAP Property Health Score across legal, builder, financial, registry, location and investment dimensions using the Legalist Property Intelligence model.",
  path: "/buyer-protection/health-score",
  keywords: ["property health score", "phs-100 calculator", "property risk score india"],
});

export default function HealthScorePage() {
  return (
    <>
      <section className="container py-12 md:py-16">
        <Link href="/buyer-protection" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
          <ArrowLeft className="h-4 w-4" /> Buyer Protection
        </Link>
        <span className="eyebrow mt-5"><Sparkles className="h-3.5 w-3.5" /> Live tool</span>
        <h1 className="h1 mt-4 max-w-3xl">Property Health Score™ Calculator</h1>
        <p className="mt-4 text-ink-700 text-lg max-w-2xl">
          Drag the six dimension sliders to see a property's PHS-100 score, verification tier,
          delay risk and price verdict — powered by the Master Legalist Property Intelligence model.
        </p>

        <div className="mt-10">
          <HealthScoreCalculator />
        </div>
      </section>
      <CTA />
    </>
  );
}
