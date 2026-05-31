import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";

export const metadata = buildMetadata({ title: "Users · Admin", path: "/admin/users", noIndex: true });
export const dynamic = "force-dynamic";

type SP = { q?: string; role?: string; status?: string };

export default async function UsersPage({ searchParams }: { searchParams?: SP }) {
  await requireAdmin();
  const sb = supabaseAdmin();

  let query = sb
    .from("users")
    .select("id, name, role, phone, email, rera_number, kyc_status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (searchParams?.role) query = query.eq("role", searchParams.role);
  if (searchParams?.status) query = query.eq("kyc_status", searchParams.status);
  if (searchParams?.q) {
    const q = searchParams.q;
    query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%,rera_number.ilike.%${q}%`);
  }

  const { data: users } = await query;

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Users</h1>
      <p className="mt-2 text-ink-500">Search, verify and manage every user on the platform.</p>

      <form className="card mt-8 overflow-hidden">
        <div className="p-5 border-b border-ink-100 flex flex-wrap gap-3 items-center">
          <input name="q" defaultValue={searchParams?.q || ""} className="input max-w-md" placeholder="Search by name, phone, email, RERA…" />
          <select name="role" defaultValue={searchParams?.role || ""} className="input max-w-xs">
            <option value="">All roles</option>
            <option value="broker">Broker</option>
            <option value="corporate">Corporate</option>
            <option value="referrer">Referrer</option>
            <option value="admin">Admin</option>
          </select>
          <select name="status" defaultValue={searchParams?.status || ""} className="input max-w-xs">
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="btn-primary">Filter</button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-500 uppercase text-xs">
            <tr>
              <th className="px-5 py-3 text-left">Name</th>
              <th className="px-5 py-3 text-left">Role</th>
              <th className="px-5 py-3 text-left">Phone</th>
              <th className="px-5 py-3 text-left">RERA</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u) => (
              <tr key={u.id} className="border-t border-ink-100">
                <td className="px-5 py-3">
                  <p className="font-semibold">{u.name}</p>
                  <p className="text-xs text-ink-500">{u.email}</p>
                </td>
                <td className="px-5 py-3 capitalize">{u.role}</td>
                <td className="px-5 py-3 font-mono text-xs">{u.phone}</td>
                <td className="px-5 py-3 font-mono text-xs">{u.rera_number || "—"}</td>
                <td className="px-5 py-3">
                  <span className={`badge ${u.kyc_status === "verified" ? "!bg-emerald-50 !text-emerald-700" : u.kyc_status === "rejected" ? "!bg-rose-50 !text-rose-700" : "!bg-amber-50 !text-amber-700"}`}>{u.kyc_status}</span>
                </td>
                <td className="px-5 py-3 text-right">
                  <Link href={`/admin/users/${u.id}`} className="btn-outline !py-1.5 !px-3 text-xs">View</Link>
                </td>
              </tr>
            ))}
            {(!users || users.length === 0) && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-ink-500">No users match those filters.</td></tr>
            )}
          </tbody>
        </table>
      </form>
    </div>
  );
}
