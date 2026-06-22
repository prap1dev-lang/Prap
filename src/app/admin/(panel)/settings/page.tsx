import { buildMetadata } from "@/lib/seo";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import PasswordCard from "@/components/dashboard/PasswordCard";

export const metadata = buildMetadata({ title: "Password · Admin", path: "/admin/settings", noIndex: true });
export const dynamic = "force-dynamic";

export default async function Page() {
  const me = await requireAdmin();
  const sb = supabaseAdmin();
  const { data } = await sb.from("users").select("has_password").eq("id", me.authId).maybeSingle();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Account</h1>
      <p className="mt-2 text-ink-500">Change the password you use to sign in to the admin panel.</p>
      <div className="mt-6">
        <PasswordCard hasPassword={!!data?.has_password} />
      </div>
    </div>
  );
}
