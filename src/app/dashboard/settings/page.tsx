import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Settings", path: "/dashboard/settings", noIndex: true });

export default function SettingsPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-extrabold tracking-tight">Profile & Settings</h1>
      <p className="mt-2 text-ink-500">Manage your KYC documents, payout methods and notifications.</p>

      <div className="mt-8 grid gap-6">
        <section className="card p-6">
          <h2 className="font-bold">Personal details</h2>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div><label className="label">Full name</label><input className="input" defaultValue="Investor" /></div>
            <div><label className="label">Phone</label><input className="input" defaultValue="+91-98XXXXXXXX" disabled /></div>
            <div><label className="label">Email</label><input className="input" defaultValue="you@example.com" /></div>
            <div><label className="label">PAN</label><input className="input uppercase" defaultValue="ABCDE1234F" /></div>
          </div>
          <button className="btn-primary mt-5">Save changes</button>
        </section>

        <section className="card p-6">
          <h2 className="font-bold">KYC documents</h2>
          <div className="mt-4 grid sm:grid-cols-3 gap-4">
            <DocBox label="Aadhaar card" />
            <DocBox label="PAN card" />
            <DocBox label="Profile photo" />
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-bold">Payout methods</h2>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div><label className="label">UPI ID</label><input className="input" placeholder="name@upi" /></div>
            <div><label className="label">Bank account</label><input className="input" placeholder="XXXXXXXX1234" /></div>
          </div>
          <button className="btn-primary mt-5">Save</button>
        </section>
      </div>
    </div>
  );
}

function DocBox({ label }: { label: string }) {
  return (
    <label className="block aspect-[4/3] rounded-xl border-2 border-dashed border-ink-200 grid place-items-center text-center p-3 cursor-pointer hover:border-brand-300">
      <input type="file" className="hidden" accept="image/*,.pdf" />
      <span>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-ink-500 mt-1">PNG, JPG or PDF · max 5MB</p>
      </span>
    </label>
  );
}
