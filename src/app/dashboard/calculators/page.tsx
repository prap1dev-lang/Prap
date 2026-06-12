import { buildMetadata } from "@/lib/seo";
import EmiCalculator from "@/components/site/EmiCalculator";

export const metadata = buildMetadata({ title: "Calculators", path: "/dashboard/calculators", noIndex: true });

export default function CalculatorsPage() {
  return (
    <div className="max-w-5xl">
      <p className="eyebrow">Plan ahead</p>
      <h1 className="font-serif text-4xl md:text-5xl font-light tracking-tight mt-3">Calculators</h1>
      <p className="mt-4 text-ink-600 font-light">Estimate your EMI and loan eligibility with transparent, bank-standard math.</p>

      <div className="mt-8 -mx-5 md:-mx-8">
        <EmiCalculator />
      </div>
    </div>
  );
}
