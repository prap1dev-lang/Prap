import { buildMetadata } from "@/lib/seo";
import { Users, Building2, BookKey, FileCheck } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import Link from "next/link";

export const metadata = buildMetadata({ title: "Admin", path: "/admin", noIndex: true });
export const dynamic = "force-dynamic";

export default async function AdminHome() {
  await requireAdmin();
  const sb = supabaseAdmin();

  const [{ count: usersCount }, { count: projectsCount }, { count: bookingsCount }, { data: floatRow }] = await Promise.all([
    sb.from("users").select("*", { count: "exact", head: true }),
    sb.from("projects").select("*", { count: "exact", head: true }).eq("is_listed", true),
    sb.from("bookings").select("*", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 30 * 86400_000).toISOString()),
    sb.from("wallets").select("balance.sum()").single(),
  ]);

  const stats = [
    { icon: Users, label: "Users", value: (usersCount ?? 0).toLocaleString("en-IN"), delta: "All-time" },
    { icon: Building2, label: "Active projects", value: (projectsCount ?? 0).toLocaleString("en-IN"), delta: "Listed" },
    { icon: BookKey, label: "Bookings (30d)", value: (bookingsCount ?? 0).toLocaleString("en-IN"), delta: "Rolling" },
    {
      icon: FileCheck,
      label: "Coins in float",
      value: `₹${(((floatRow as any)?.sum ?? 0) as number).toLocaleString("en-IN")}`,
      delta: "Sum of all wallets",
    },
  ];

  // Pending approvals = brokers with kyc_status='pending' AND rera_number not null
  const { data: pending } = await sb
    .from("users")
    .select("id, name, role, rera_number, created_at")
    .eq("kyc_status", "pending")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="space-y-8 max-w-6xl">
      <h1 className="text-3xl font-extrabold tracking-tight">Admin overview</h1>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-ink-500">{s.label}</p>
              <s.icon className="h-5 w-5 text-brand-600" />
            </div>
            <p className="mt-2 text-2xl font-extrabold">{s.value}</p>
            <p className="text-xs text-ink-500">{s.delta}</p>
          </div>
        ))}
      </div>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-ink-100">
          <h2 className="font-bold">Pending KYC approvals</h2>
          <Link href="/admin/users?status=pending" className="text-sm text-brand-700 hover:underline">View all</Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-500 uppercase text-xs">
            <tr>
              <th className="px-5 py-3 text-left">User</th>
              <th className="px-5 py-3 text-left">Role</th>
              <th className="px-5 py-3 text-left">RERA #</th>
              <th className="px-5 py-3 text-left">Created</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {(pending ?? []).map((u) => (
              <tr key={u.id} className="border-t border-ink-100">
                <td className="px-5 py-3 font-semibold">{u.name}</td>
                <td className="px-5 py-3 capitalize">{u.role}</td>
                <td className="px-5 py-3 font-mono text-xs">{u.rera_number || "—"}</td>
                <td className="px-5 py-3 text-ink-500">{new Date(u.created_at).toLocaleDateString("en-IN")}</td>
                <td className="px-5 py-3 text-right">
                  <Link href={`/admin/users/${u.id}`} className="btn-outline !py-1.5 !px-3 text-xs">Review</Link>
                </td>
              </tr>
            ))}
            {(!pending || pending.length === 0) && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-ink-500">No pending approvals. Nice.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
