"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Coins, LayoutDashboard, Users, Building2, BookKey, FileCheck, Receipt,
  Settings, Banknote, Stethoscope, Menu, X, ExternalLink, LogOut,
} from "lucide-react";

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

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AdminShell({
  email,
  children,
}: { email: string | null; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Auto-close drawer when navigating
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock body scroll when drawer is open on mobile
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close drawer on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const currentLabel =
    nav.find((n) => isActive(pathname || "", n.href))?.label ?? "Admin";

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr] bg-ink-50">
      {/* ===== Mobile topbar ===== */}
      <header className="lg:hidden sticky top-0 z-30 bg-ink-950 text-white border-b border-ink-900">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center justify-center h-10 w-10 rounded-lg hover:bg-ink-900"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/admin" className="flex items-center gap-2 font-extrabold">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600">
              <Coins className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm">PRAP <span className="text-brand-400">·</span> {currentLabel}</span>
          </Link>
          <span className="w-10" /> {/* spacer */}
        </div>
      </header>

      {/* ===== Sidebar (desktop static, mobile drawer) ===== */}
      <Sidebar open={open} onClose={() => setOpen(false)} email={email} pathname={pathname || ""} />

      {/* ===== Main content ===== */}
      <main className="px-4 py-5 md:p-8 max-w-full overflow-x-auto">
        {children}
      </main>
    </div>
  );
}

function Sidebar({
  open,
  onClose,
  email,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  email: string | null;
  pathname: string;
}) {
  return (
    <>
      {/* Backdrop — mobile only */}
      {open && (
        <button
          aria-label="Close menu"
          onClick={onClose}
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        />
      )}

      <aside
        className={[
          // Mobile: fixed slide-in drawer
          "fixed lg:static inset-y-0 left-0 z-50 w-[260px] bg-ink-950 text-ink-100 border-r border-ink-900",
          "flex flex-col p-5",
          "transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0", // always visible on desktop
        ].join(" ")}
      >
        {/* Header row */}
        <div className="flex items-center justify-between gap-2">
          <Link href="/admin" className="flex items-center gap-2 font-extrabold text-white">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600">
              <Coins className="h-5 w-5" />
            </span>
            <span>PRAP <span className="text-brand-400">·</span> Admin</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg hover:bg-ink-900"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="mt-8 flex-1 overflow-y-auto -mx-1 px-1 space-y-1">
          {nav.map((n) => {
            const active = isActive(pathname, n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={[
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-brand-600 text-white"
                    : "text-ink-200 hover:bg-ink-900 hover:text-white",
                ].join(" ")}
              >
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="text-xs text-ink-200 border-t border-ink-900 pt-3 space-y-2">
          {email && (
            <div>
              <p className="font-semibold text-white truncate">{email}</p>
              <p className="text-ink-400">Admin · v0.1</p>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <Link href="/" className="flex items-center gap-2 hover:text-white">
              <ExternalLink className="h-3.5 w-3.5" /> Open public site
            </Link>
            <Link href="/admin/login" className="flex items-center gap-2 hover:text-white">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
