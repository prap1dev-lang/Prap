import { getSessionUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const me = await getSessionUser();
  const { data } = me
    ? await supabaseAdmin().from("users").select("name, photo_url, role").eq("id", me.authId).maybeSingle()
    : { data: null as any };

  const name = data?.name ?? me?.name ?? "Your account";
  const role = (data?.role ?? me?.role ?? "referrer") as "broker" | "corporate" | "referrer" | "admin";
  const photoUrl = data?.photo_url ?? null;

  return (
    <DashboardShell name={name} role={role} photoUrl={photoUrl}>
      {children}
    </DashboardShell>
  );
}
