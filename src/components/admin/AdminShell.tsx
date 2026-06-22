"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Coins, LayoutDashboard, Users, Building2, BookKey, FileCheck, Receipt,
  KeyRound, Banknote, Menu, X, ExternalLink, LogOut, Inbox, MessageSquare,
} from "lucide-react";
import NavProgress from "@/components/admin/NavProgress";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/projects", label: "Projects", icon: Building2 },
  { href: "/admin/submissions", label: "Submissions", icon: Inbox },
  { href: "/admin/queries", label: "Queries", icon: MessageSquare },
  { href: "/admin/bookings", label: "Bookings", icon: BookKey },
  { href: "/admin/ledger", label: "Coin Ledger", icon: FileCheck },
  { href: "/admin/redemptions", label: "Redemptions", icon: Banknote },
  { href: "/admin/payments", label: "Payments", icon: Receipt },
  { href: "/admin/settings", label: "Password", icon: KeyRound },
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
    <div className="min-h-screen lg:h-screen lg:grid lg:grid-cols-[260px_1fr] lg:overflow-hidden bg-ink-50">
      <Suspense fallback={null}>
        <NavProgress />
      </Suspense>
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

      {/* ===== Main content (independent scroll on desktop) ===== */}
      <main className="px-4 py-5 md:p-8 max-w-full lg:h-screen lg:overflow-y-auto overflow-x-auto">
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
          "fixed lg:static inset-y-0 left-0 z-50 w-[260px] bg-ink-950 text-ink-100",
          "flex flex-col p-5 relative overflow-hidden",
          "transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0", // always visible on desktop
        ].join(" ")}
      >
        {/* subtle mesh glow at the top of the sidebar */}
        <div className="pointer-events-none absolute -top-24 -left-10 h-56 w-56 rounded-full bg-brand-600/25 blur-3xl" />
        {/* Header row */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          <Link href="/admin" className="font-serif text-lg tracking-tight text-white">
            PRAP<span className="text-brand-400">.</span>{" "}
            <span className="text-xs uppercase tracking-[0.2em] text-ink-300 font-sans">Admin</span>
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
        <nav className="relative z-10 mt-8 flex-1 overflow-y-auto -mx-1 px-1 space-y-1">
          {nav.map((n) => {
            const active = isActive(pathname, n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                prefetch
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
