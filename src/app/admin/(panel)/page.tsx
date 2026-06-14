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

  const [
    { count: usersCount },
    { count: projectsCount },
    { count: bookingsCount },
    { data: floatRow },
    { data: pending },
  ] = await Promise.all([
    sb.from("users").select("*", { count: "exact", head: true }),
    sb.from("projects").select("*", { count: "exact", head: true }).eq("is_listed", true),
    sb.from("bookings").select("*", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 30 * 86400_000).toISOString()),
    sb.from("wallets").select("balance.sum()").single(),
    sb
      .from("users")
      .select("id, name, role, rera_number, created_at")
      .eq("kyc_status", "pending")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const stats = [
    { icon: Users, label: "Users", value: (usersCount ?? 0).toLocaleString("en-IN"), delta: "All-time", href: "/admin/users" },
    { icon: Building2, label: "Active projects", value: (projectsCount ?? 0).toLocaleString("en-IN"), delta: "Listed", href: "/admin/projects" },
    { icon: BookKey, label: "Bookings (30d)", value: (bookingsCount ?? 0).toLocaleString("en-IN"), delta: "Rolling", href: "/admin/bookings" },
    {
      icon: FileCheck,
      label: "Coins in float",
      value: `₹${(((floatRow as any)?.sum ?? 0) as number).toLocaleString("en-IN")}`,
      delta: "Sum of all wallets",
      href: "/admin/ledger",
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Admin overview</h1>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            prefetch
            className="card p-5 transition hover:border-brand-300 hover:shadow-card hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-ink-500">{s.label}</p>
              <s.icon className="h-5 w-5 text-brand-600" />
            </div>
            <p className="mt-2 text-2xl font-extrabold">{s.value}</p>
            <p className="text-xs text-ink-500">{s.delta}</p>
          </Link>
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
              <tr key={u.id} className="border-t border-ink-100 hover:bg-ink-50 transition cursor-pointer">
                <td className="px-5 py-3 font-semibold">
                  <Link href={`/admin/users/${u.id}`} className="block">{u.name}</Link>
                </td>
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
