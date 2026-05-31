import Link from "next/link";
import { Coins, LayoutDashboard, Users, Building2, BookKey, FileCheck, Receipt, Settings, Banknote, Stethoscope } from "lucide-react";
import { requireAdmin } from "@/lib/auth";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/projects", label: "Projects", icon: Building2 },
  { href: "/admin/bookings", label: "Bookings", icon: BookKey },
  { href: "/admin/ledger", label: "Coin Ledger", icon: FileCheck },
  { href: "/admin/redemptions", label: "Redemptions", icon: Banknote },
  { href: "/admin/payments", label: "Payments", icon: Receipt },
  { href: "/admin/diagnostics", label: "Diagnostics", icon: Stethoscope },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await requireAdmin();
  return (
    <div className="min-h-screen grid lg:grid-cols-[260px_1fr] bg-ink-50">
      <aside className="hidden lg:flex flex-col border-r border-ink-100 bg-ink-950 text-ink-100 p-5">
        <Link href="/admin" className="flex items-center gap-2 font-extrabold text-white">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600">
            <Coins className="h-5 w-5" />
          </span>
          PRAP <span className="text-brand-400">·</span> Admin
        </Link>
        <nav className="mt-8 flex-1 space-y-1">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-ink-900">
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="text-xs text-ink-200 border-t border-ink-900 pt-3">
          <p className="font-semibold text-white truncate">{me.email}</p>
          <p>Admin · v0.1</p>
        </div>
      </aside>
      <main className="p-5 md:p-8">{children}</main>
    </div>
  );
}
