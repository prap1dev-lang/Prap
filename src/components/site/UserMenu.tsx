"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Settings, LogOut, UserRound, Loader2, ChevronDown } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";

type Me = { name: string | null; role: string; photoUrl: string | null };

/**
 * Navbar auth widget. Fetches the signed-in user once on mount; shows
 * Sign in / Register when logged out, or an avatar dropdown when logged in.
 * Keeps marketing pages static — auth state hydrates on the client.
 */
export default function UserMenu({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (alive) setMe(d.user ?? null); })
      .catch(() => {})
      .finally(() => { if (alive) setLoaded(true); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function signOut() {
    setSigningOut(true);
    try {
      await supabaseBrowser().auth.signOut();
    } catch {
      /* ignore */
    }
    window.location.href = "/";
  }

  // ---- Logged-out ----
  if (loaded && !me) {
    if (variant === "mobile") {
      return (
        <div className="flex gap-2">
          <Link href="/auth/login" className="btn-outline w-1/2">Sign in</Link>
          <Link href="/auth/signup" className="btn-primary w-1/2">Register</Link>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-6">
        <Link href="/auth/login" className="btn-link text-ink-700 !text-[0.82rem] uppercase tracking-[0.18em]">
          Sign in
        </Link>
        <Link href="/auth/signup" className="btn-primary !py-2.5 !px-5 !text-sm uppercase tracking-[0.14em]">
          Register
        </Link>
      </div>
    );
  }

  // ---- Still loading: keep layout stable with a faint placeholder ----
  if (!loaded) {
    return <div className={variant === "mobile" ? "h-11" : "h-10 w-10 rounded-full bg-ink-900/5 animate-pulse"} />;
  }

  // ---- Logged-in ----
  const firstName = me?.name?.split(" ")[0] || "You";
  const initial = (me?.name?.trim()?.[0] || "U").toUpperCase();

  const avatar = (
    <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full overflow-hidden bg-brand-600 text-ivory ring-2 ring-white/60 shadow-card">
      {me?.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={me.photoUrl} alt={firstName} className="h-full w-full object-cover" />
      ) : (
        <span className="text-sm font-medium">{initial}</span>
      )}
    </span>
  );

  if (variant === "mobile") {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-3 px-3 py-3">
          {avatar}
          <div className="min-w-0">
            <p className="font-medium text-ink-900 truncate">{me?.name || "Your account"}</p>
            <p className="text-xs uppercase tracking-wider text-ink-500 capitalize">{me?.role}</p>
          </div>
        </div>
        <Link href="/dashboard" className="block px-3 py-3 rounded-2xl text-sm uppercase tracking-[0.14em] text-ink-700 hover:bg-ink-900/5">Dashboard</Link>
        <Link href="/dashboard/settings" className="block px-3 py-3 rounded-2xl text-sm uppercase tracking-[0.14em] text-ink-700 hover:bg-ink-900/5">Profile</Link>
        <button onClick={signOut} disabled={signingOut} className="w-full text-left px-3 py-3 rounded-2xl text-sm uppercase tracking-[0.14em] text-rose-600 hover:bg-rose-50">
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((s) => !s)}
        className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-ink-900/5 transition"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {avatar}
        <span className="hidden xl:inline text-sm text-ink-700">{firstName}</span>
        <ChevronDown className={`h-4 w-4 text-ink-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 glass !bg-white/80 p-2 z-50" role="menu">
          <div className="flex items-center gap-3 px-3 py-2.5">
            {avatar}
            <div className="min-w-0">
              <p className="font-medium text-ink-900 text-sm truncate">{me?.name || "Your account"}</p>
              <p className="text-[0.7rem] uppercase tracking-wider text-ink-500 capitalize">{me?.role}</p>
            </div>
          </div>
          <div className="my-1 h-px bg-ink-900/5" />
          <MenuItem href="/dashboard" icon={LayoutDashboard}>Dashboard</MenuItem>
          <MenuItem href="/dashboard/settings" icon={Settings}>Profile &amp; settings</MenuItem>
          {me?.role === "admin" && <MenuItem href="/admin" icon={UserRound}>Admin panel</MenuItem>}
          <div className="my-1 h-px bg-ink-900/5" />
          <button
            onClick={signOut}
            disabled={signingOut}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition"
            role="menuitem"
          >
            {signingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function MenuItem({ href, icon: Icon, children }: { href: string; icon: any; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-ink-700 hover:bg-ink-900/5 transition" role="menuitem">
      <Icon className="h-4 w-4 text-ink-500" /> {children}
    </Link>
  );
}
