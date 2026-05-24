import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: "How PRAP collects, uses and protects your personal data, including Aadhaar & PAN.",
  path: "/privacy",
});

export default function Page() {
  return (
    <section className="container py-14 max-w-3xl">
      <h1 className="h1">Privacy Policy</h1>
      <p className="mt-4 text-ink-700">Last updated: {new Date().toLocaleDateString("en-IN")}</p>
      <div className="mt-8 space-y-6 text-ink-700 leading-relaxed">
        <p>
          We respect your privacy. This policy explains what we collect, how we use it,
          and the controls you have over your data.
        </p>
        <h2 className="text-xl font-bold text-ink-900">What we collect</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Identity: name, phone, email, Aadhaar number (masked), PAN, profile photo.</li>
          <li>Transactional: bookings, milestone payments, coin ledger entries.</li>
          <li>Device: IP, browser, OS — for fraud prevention.</li>
        </ul>
        <h2 className="text-xl font-bold text-ink-900">How we use it</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>KYC verification with RERA, banking & payment partners.</li>
          <li>Aadhaar last-4 lock-in to prevent broker commission disputes.</li>
          <li>Service operation, support and statutory compliance.</li>
        </ul>
        <h2 className="text-xl font-bold text-ink-900">Storage & security</h2>
        <p>
          KYC documents are stored encrypted in object storage with restricted IAM,
          and Aadhaar numbers are stored only in masked form (last 4 digits visible to
          the broker, full Aadhaar hashed on our side).
        </p>
        <h2 className="text-xl font-bold text-ink-900">Your rights</h2>
        <p>
          You can request export or deletion of your data anytime by emailing
          privacy@prap.in. We will respond within 30 days.
        </p>
      </div>
    </section>
  );
}
