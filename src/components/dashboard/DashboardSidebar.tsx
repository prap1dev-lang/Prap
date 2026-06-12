"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { DASHBOARD_NAV, type NavGroup } from "@/lib/dashboard-nav";
import SignOutButton from "@/components/dashboard/SignOutButton";

type Role = "broker" | "corporate" | "referrer" | "admin";

export default function DashboardSidebar({
  name,
  role,
  photoUrl,
  onNavigate,
}: {
  name: string;
  role: Role;
  photoUrl: string | null;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const groups = DASHBOARD_NAV.filter((g) => !g.roles || g.roles.includes(role));

  return (
    <div className="flex h-full flex-col">
      <Link href="/" className="font-serif text-xl tracking-tight text-ink-900 px-2">
        PRAP<span className="text-brand-600">.</span>
      </Link>

      {/* Profile header */}
      <Link
        href="/dashboard/settings"
        onClick={onNavigate}
        className="mt-5 flex items-center gap-3 rounded-2xl p-2.5 hover:bg-ink-900/5 transition"
      >
        <Avatar name={name} photoUrl={photoUrl} />
        <div className="min-w-0">
          <p className="font-medium text-ink-900 text-sm truncate">{name}</p>
          <p className="text-[0.7rem] uppercase tracking-wider text-ink-500 capitalize">{role}</p>
        </div>
      </Link>

      {/* Scrollable accordion nav */}
      <nav className="mt-4 flex-1 overflow-y-auto -mx-1 px-1 pb-4 space-y-1">
        {groups.map((g) => (
          <Group key={g.title} group={g} pathname={pathname} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="pt-2">
        <SignOutButton className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition" />
      </div>
    </div>
  );
}

function Group({ group, pathname, onNavigate }: { group: NavGroup; pathname: string; onNavigate?: () => void }) {
  const hasActive = group.items.some((i) => isActive(pathname, i.href));
  const [open, setOpen] = useState(!!group.defaultOpen || hasActive);
  const Icon = group.icon;

  return (
    <div>
      <button
        onClick={() => setOpen((s) => !s)}
        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-ink-800 hover:bg-ink-900/5 transition"
      >
        <Icon className="h-4 w-4 text-ink-500 shrink-0" strokeWidth={1.6} />
        <span className="flex-1 text-left">{group.title}</span>
        <ChevronDown className={`h-4 w-4 text-ink-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul className="mt-0.5 mb-1 ml-4 border-l border-ink-900/5 pl-3 space-y-0.5">
          {group.items.map((i) => {
            const active = isActive(pathname, i.href);
            return (
              <li key={i.label}>
                <Link
                  href={i.href}
                  onClick={onNavigate}
                  className={`block rounded-xl px-3 py-2 text-[0.82rem] transition ${
                    active
                      ? "bg-brand-600 text-ivory font-medium"
                      : "text-ink-600 hover:bg-ink-900/5 hover:text-ink-900"
                  }`}
                >
                  {i.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function isActive(pathname: string, href: string) {
  const base = href.split("#")[0];
  if (base === "/dashboard") return pathname === "/dashboard";
  return pathname === base;
}

function Avatar({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  const initial = (name?.trim()?.[0] || "U").toUpperCase();
  return (
    <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full overflow-hidden bg-brand-600 text-ivory shrink-0">
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="text-sm font-medium">{initial}</span>
      )}
    </span>
  );
}
