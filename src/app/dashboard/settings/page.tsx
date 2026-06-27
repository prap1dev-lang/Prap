import { buildMetadata } from "@/lib/seo";
import { getSessionUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import ProfileForm, { type Profile } from "@/components/dashboard/ProfileForm";
import DocUpload from "@/components/dashboard/DocUpload";
import PasswordCard from "@/components/dashboard/PasswordCard";

export const metadata = buildMetadata({ title: "Settings", path: "/dashboard/settings", noIndex: true });
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const me = await getSessionUser();
  const admin = supabaseAdmin();

  const { data } = me
    ? await admin
        .from("users")
        .select(
          "name, email, phone, pan, role, rera_number, upi_id, bank_account, bank_ifsc, photo_url, instagram, facebook, youtube, has_password, pan_verified, aadhaar_verified, rera_verified",
        )
        .eq("id", me.authId)
        .maybeSingle()
    : { data: null as any };

  // Load any documents already uploaded to Cloudinary (kind -> url).
  const { data: docRows } = me
    ? await admin.from("kyc_docs").select("kind, storage_key").eq("user_id", me.authId)
    : { data: [] as any[] };
  const docUrls: Record<string, string> = {};
  for (const d of docRows ?? []) docUrls[d.kind] = d.storage_key;

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
    photo_url: data?.photo_url ?? docUrls.photo ?? null,
    instagram: data?.instagram ?? "",
    facebook: data?.facebook ?? "",
    youtube: data?.youtube ?? "",
    pan_verified: !!data?.pan_verified,
    aadhaar_verified: !!data?.aadhaar_verified,
    rera_verified: !!data?.rera_verified,
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Profile &amp; Settings</h1>
      <p className="mt-2 text-ink-500">Manage your KYC documents, payout methods and notifications.</p>

      <div className="mt-8 grid gap-6">
        <ProfileForm initial={profile} />

        <PasswordCard hasPassword={!!data?.has_password} />

        <section className="card p-6">
          <h2 className="font-bold">KYC documents</h2>
          <p className="mt-1 text-sm text-ink-500">
            Upload clear photos or PDFs. Files are stored securely and reviewed by our team.
            Each file must be under 10&nbsp;MB.
          </p>

          <h3 className="mt-5 text-sm font-semibold text-ink-700">Aadhaar card</h3>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <DocUpload kind="aadhaar_front" label="Aadhaar — Front" initialUrl={docUrls.aadhaar_front ?? docUrls.aadhaar} />
            <DocUpload kind="aadhaar_back" label="Aadhaar — Back" initialUrl={docUrls.aadhaar_back} />
          </div>

          <h3 className="mt-6 text-sm font-semibold text-ink-700">PAN card</h3>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <DocUpload kind="pan_front" label="PAN — Front" initialUrl={docUrls.pan_front ?? docUrls.pan} />
            <DocUpload kind="pan_back" label="PAN — Back" initialUrl={docUrls.pan_back} />
          </div>

          <h3 className="mt-6 text-sm font-semibold text-ink-700">Other</h3>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <DocUpload kind="photo" label="Profile photo" initialUrl={docUrls.photo} />
            {profile.role === "broker" && (
              <DocUpload kind="rera_cert" label="RERA certificate" initialUrl={docUrls.rera_cert} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
