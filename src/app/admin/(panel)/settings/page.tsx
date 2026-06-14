import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Settings · Admin", path: "/admin/settings", noIndex: true });

export default function Page() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Platform settings</h1>
      <p className="mt-2 text-ink-500">Tunable parameters and integrations.</p>
      <div className="card mt-6 p-6 grid gap-4">
        <Row k="SMS gateway" v="Firebase (active)" />
        <Row k="Email provider" v="Resend (active)" />
        <Row k="Payment gateway" v="Razorpay (test mode)" />
        <Row k="RERA verification" v="Manual (queue)" />
        <Row k="Onboarding bonus" v="25,000 coins" />
        <Row k="Visit bonus" v="10,000 / 5,000 (referrer / corporate) — visits 1 & 2" />
        <Row k="Redemption cap" v="50% of balance, ₹1,00,000 max" />
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-ink-100 pb-3 last:border-0 last:pb-0">
      <span className="text-ink-500">{k}</span>
      <span className="font-semibold">{v}</span>
    </div>
  );
}
