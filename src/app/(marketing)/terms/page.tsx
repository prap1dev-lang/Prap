import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Terms of Use",
  description: "Terms of Use governing access to and use of the PRAP platform.",
  path: "/terms",
});

export default function Page() {
  return (
    <section className="container py-14 max-w-3xl">
      <h1 className="h1">Terms of Use</h1>
      <p className="mt-4 text-ink-700">Last updated: {new Date().toLocaleDateString("en-IN")}</p>
      <div className="mt-8 space-y-6 text-ink-700 leading-relaxed">
        <p>
          These Terms govern your use of PRAP (Property Referral Award Platform) operated
          by PRAP Technologies Pvt. Ltd. ("PRAP", "we", "us"). By creating an account or
          using the platform, you agree to be bound by these Terms.
        </p>
        <h2 className="text-xl font-bold text-ink-900">1. Eligibility</h2>
        <p>You must be 18+ and a resident of India to use PRAP. Brokers must hold a valid RERA registration.</p>
        <h2 className="text-xl font-bold text-ink-900">2. PRAP Coins</h2>
        <p>
          1 PRAP Coin = ₹1. Coins are credited per the published earn rules and redeemable
          subject to limits stated in the Coin Policy. Coins are not transferable.
        </p>
        <h2 className="text-xl font-bold text-ink-900">3. Property transactions</h2>
        <p>
          All property transactions on PRAP are governed by the respective builder's
          allotment letter and applicable RERA filings. PRAP acts as a facilitator and
          does not own the listed inventory.
        </p>
        <h2 className="text-xl font-bold text-ink-900">4. Cancellation & refunds</h2>
        <p>Refunds for token money follow the builder's policy. Coin reversals follow our Coin Policy.</p>
        <h2 className="text-xl font-bold text-ink-900">5. Liability</h2>
        <p>
          PRAP's liability is limited to the platform fees paid by you in the prior 6 months.
        </p>
      </div>
    </section>
  );
}
