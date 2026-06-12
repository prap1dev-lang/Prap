"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import DashboardSidebar from "./DashboardSidebar";

type Role = "broker" | "corporate" | "referrer" | "admin";

export default function DashboardShell({
  name,
  role,
  photoUrl,
  children,
}: {
  name: string;
  role: Role;
  photoUrl: string | null;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr] bg-ivory">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col bg-white p-4 h-screen sticky top-0">
        <DashboardSidebar name={name} role={role} photoUrl={photoUrl} />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <>
          <button aria-label="Close menu" onClick={() => setOpen(false)} className="lg:hidden fixed inset-0 z-40 bg-ink-950/40 backdrop-blur-sm" />
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-[280px] bg-white p-4 flex flex-col shadow-soft">
            <button onClick={() => setOpen(false)} className="absolute right-3 top-3 h-9 w-9 grid place-items-center rounded-full hover:bg-ink-900/5" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
            <DashboardSidebar name={name} role={role} photoUrl={photoUrl} onNavigate={() => setOpen(false)} />
          </aside>
        </>
      )}

      <div className="flex flex-col min-w-0">
        <header className="lg:hidden bg-white/80 backdrop-blur-xl border-b border-ink-900/5 sticky top-0 z-30">
          <div className="container py-3 flex items-center justify-between">
            <button onClick={() => setOpen(true)} className="h-10 w-10 grid place-items-center rounded-full hover:bg-ink-900/5" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/" className="font-serif text-lg tracking-tight">PRAP<span className="text-brand-600">.</span></Link>
            <span className="w-10" />
          </div>
        </header>
        <main className="p-5 md:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
