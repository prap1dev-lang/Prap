import Link from "next/link";
import { LayoutDashboard, Wallet, Calendar, HandCoins, Settings, Building2 } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import SignOutButton from "@/components/dashboard/SignOutButton";

export const dynamic = "force-dynamic";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/bookings", label: "Bookings", icon: Calendar },
  { href: "/dashboard/projects", label: "Projects", icon: Building2 },
  { href: "/dashboard/redeem", label: "Redeem", icon: HandCoins },
  { href: "/dashboard/settings", label: "Profile & settings", icon: Settings },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const me = await getSessionUser();
  const { data } = me
    ? await supabaseAdmin().from("users").select("name, photo_url, role").eq("id", me.authId).maybeSingle()
    : { data: null as any };

  const name = data?.name ?? me?.name ?? "Your account";
  const role = data?.role ?? me?.role ?? "referrer";
  const photoUrl = data?.photo_url ?? null;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr] bg-ivory">
      <aside className="hidden lg:flex flex-col bg-white p-5">
        <Link href="/" className="font-serif text-xl tracking-tight text-ink-900">
          PRAP<span className="text-brand-600">.</span>
        </Link>

        {/* Signed-in user */}
        <Link href="/dashboard/settings" className="mt-6 flex items-center gap-3 rounded-2xl p-3 hover:bg-ink-900/5 transition">
          <Avatar name={name} photoUrl={photoUrl} />
          <div className="min-w-0">
            <p className="font-medium text-ink-900 text-sm truncate">{name}</p>
            <p className="text-[0.7rem] uppercase tracking-wider text-ink-500 capitalize">{role}</p>
          </div>
        </Link>

        <nav className="mt-6 flex-1 space-y-1">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-900/5 transition">
              <n.icon className="h-4 w-4 text-ink-500" /> {n.label}
            </Link>
          ))}
        </nav>
        <SignOutButton className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition" />
      </aside>

      <div className="flex flex-col">
        <header className="lg:hidden bg-white border-b border-ink-900/5">
          <div className="container py-3 flex items-center justify-between">
            <Link href="/" className="font-serif text-lg tracking-tight">PRAP<span className="text-brand-600">.</span></Link>
            <Link href="/dashboard/settings" className="flex items-center gap-2">
              <Avatar name={name} photoUrl={photoUrl} sm />
            </Link>
          </div>
        </header>
        <main className="p-5 md:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}

function Avatar({ name, photoUrl, sm }: { name: string; photoUrl: string | null; sm?: boolean }) {
  const initial = (name?.trim()?.[0] || "U").toUpperCase();
  const size = sm ? "h-8 w-8" : "h-10 w-10";
  return (
    <span className={`relative inline-flex ${size} items-center justify-center rounded-full overflow-hidden bg-brand-600 text-ivory shrink-0`}>
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="text-sm font-medium">{initial}</span>
      )}
    </span>
  );
}
