import Link from "next/link";
import { Coins, LayoutDashboard, Wallet, Calendar, HandCoins, Settings, LogOut, Building2 } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/bookings", label: "Bookings", icon: Calendar },
  { href: "/dashboard/projects", label: "Projects", icon: Building2 },
  { href: "/dashboard/redeem", label: "Redeem", icon: HandCoins },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[260px_1fr] bg-ink-50">
      <aside className="hidden lg:flex flex-col border-r border-ink-100 bg-white p-5">
        <Link href="/" className="flex items-center gap-2 font-extrabold">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Coins className="h-5 w-5" />
          </span>
          <span>PRAP<span className="text-brand-600">.</span></span>
        </Link>
        <nav className="mt-8 flex-1 space-y-1">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50">
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
        </nav>
        <Link href="/auth/login" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50">
          <LogOut className="h-4 w-4" /> Sign out
        </Link>
      </aside>

      <div className="flex flex-col">
        <header className="lg:hidden border-b border-ink-100 bg-white">
          <div className="container py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-extrabold">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Coins className="h-4 w-4" />
              </span>
              PRAP
            </Link>
            <Link href="/auth/login" className="text-sm text-ink-700">Sign out</Link>
          </div>
        </header>
        <main className="p-5 md:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
