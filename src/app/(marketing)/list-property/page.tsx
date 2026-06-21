import ListPropertyForm from "@/components/property/ListPropertyForm";
import { BlueprintIsoBuilding, BlueprintDimension } from "@/components/site/Blueprint";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "List your property — sell or rent faster on PRAP",
  description:
    "List your residential or commercial property on PRAP. Tell us what you have and our team will help you sell or rent it faster, RERA-verified and zero brokerage.",
  path: "/list-property",
});

export default function ListPropertyPage() {
  return (
    <section className="section relative overflow-hidden blueprint-grid">
      <BlueprintIsoBuilding className="pointer-events-none absolute -right-8 top-10 hidden w-[300px] text-brand-900/[0.07] lg:block" />
      <div className="container relative max-w-3xl">
        <div className="mb-8">
          <BlueprintDimension label="List with PRAP" className="text-brand-700" />
          <h1 className="h2 mt-4">List your property</h1>
          <p className="mt-3 text-ink-600">
            Tell us about your property — it takes under a minute. Our team will verify the details
            and help you reach genuine, RERA-verified buyers.
          </p>
        </div>
        <ListPropertyForm />
      </div>
    </section>
  );
}
