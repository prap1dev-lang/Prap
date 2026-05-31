import { redirect } from "next/navigation";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase-server";

export type AppRole = "broker" | "corporate" | "referrer" | "admin";

export type SessionUser = {
  authId: string;
  email: string | null;
  role: AppRole;
  name: string | null;
  kycStatus: "pending" | "verified" | "rejected";
};

/**
 * Read the current Supabase session, look up the matching row in public.users,
 * and return a normalized SessionUser. Bootstraps the first admin if the
 * authenticated email is listed in ADMIN_BOOTSTRAP_EMAILS.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const sb = supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;

  const admin = supabaseAdmin();
  const { data: row } = await admin
    .from("users")
    .select("id, role, name, email, kyc_status")
    .eq("id", user.id)
    .maybeSingle();

  // First-admin bootstrap: if email is whitelisted and the user has no row yet,
  // create one as 'admin' so the dashboard becomes accessible immediately.
  if (!row) {
    const allowList = (process.env.ADMIN_BOOTSTRAP_EMAILS || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (user.email && allowList.includes(user.email.toLowerCase())) {
      await admin.from("users").insert({
        id: user.id,
        role: "admin",
        name: user.email.split("@")[0],
        phone: `admin-${user.id.slice(0, 8)}`,
        email: user.email,
        pan: "AAAAA0000A",
        aadhaar_hash: "bootstrap",
        aadhaar_last4: "0000",
        kyc_status: "verified",
      });
      return {
        authId: user.id,
        email: user.email,
        role: "admin",
        name: user.email.split("@")[0],
        kycStatus: "verified",
      };
    }
    return null;
  }

  // If existing user matches the bootstrap list but isn't admin yet, promote.
  const allowList = (process.env.ADMIN_BOOTSTRAP_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (
    row.role !== "admin" &&
    user.email &&
    allowList.includes(user.email.toLowerCase())
  ) {
    await admin.from("users").update({ role: "admin" }).eq("id", user.id);
    row.role = "admin";
  }

  return {
    authId: user.id,
    email: row.email,
    role: row.role as AppRole,
    name: row.name,
    kycStatus: row.kyc_status as SessionUser["kycStatus"],
  };
}

export async function requireAdmin(): Promise<SessionUser> {
  const me = await getSessionUser();
  if (!me) redirect("/admin/login?next=/admin");
  if (me.role !== "admin") redirect("/admin/login?error=not-admin");
  return me;
}

export async function requireUser(): Promise<SessionUser> {
  const me = await getSessionUser();
  if (!me) redirect("/auth/login");
  return me;
}
