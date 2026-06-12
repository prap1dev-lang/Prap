import { buildMetadata } from "@/lib/seo";
import { getSessionUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import ProfileForm, { type Profile } from "@/components/dashboard/ProfileForm";

export const metadata = buildMetadata({ title: "Settings", path: "/dashboard/settings", noIndex: true });
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const me = await getSessionUser();
  const admin = supabaseAdmin();

  const { data } = me
    ? await admin
        .from("users")
        .select(
          "name, email, phone, pan, role, rera_number, upi_id, bank_account, bank_ifsc, pan_verified, aadhaar_verified, rera_verified",
        )
        .eq("id", me.authId)
        .maybeSingle()
    : { data: null as any };

  const profile: Profile = {
    name: data?.name ?? me?.name ?? "",
    email: data?.email ?? me?.email ?? "",
    phone: data?.phone ?? "",
    pan: data?.pan ?? "",
    role: (data?.role ?? me?.role ?? "referrer") as Profile["role"],
    rera_number: data?.rera_number ?? "",
    upi_id: data?.upi_id ?? "",
    bank_account: data?.bank_account ?? "",
    bank_ifsc: data?.bank_ifsc ?? "",
    pan_verified: !!data?.pan_verified,
    aadhaar_verified: !!data?.aadhaar_verified,
    rera_verified: !!data?.rera_verified,
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-extrabold tracking-tight">Profile &amp; Settings</h1>
      <p className="mt-2 text-ink-500">Manage your KYC documents, payout methods and notifications.</p>

      <div className="mt-8 grid gap-6">
        <ProfileForm initial={profile} />

        <section className="card p-6">
          <h2 className="font-bold">KYC documents</h2>
          <div className="mt-4 grid sm:grid-cols-3 gap-4">
            <DocBox label="Aadhaar card" />
            <DocBox label="PAN card" />
            <DocBox label="Profile photo" />
          </div>
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
