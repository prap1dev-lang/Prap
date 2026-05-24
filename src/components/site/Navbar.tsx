"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Coins } from "lucide-react";

const links = [
  { href: "/projects", label: "Projects" },
  { href: "/city/noida", label: "Noida" },
  { href: "/city/greater-noida", label: "Greater Noida" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/for-brokers", label: "Brokers" },
  { href: "/for-corporates", label: "Corporates" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-ink-100">
      <nav className="container flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-ink-900">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-card">
            <Coins className="h-5 w-5" />
          </span>
          <span className="text-lg tracking-tight">
            PRAP<span className="text-brand-600">.</span>
          </span>
        </Link>

        <ul className="hidden lg:flex items-center gap-7 text-sm font-medium text-ink-700">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="hover:text-brand-600 transition">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          <Link href="/auth/login" className="btn-ghost">Sign in</Link>
          <Link href="/auth/signup" className="btn-primary">Get 25,000 Coins</Link>
        </div>

        <button
          className="lg:hidden inline-flex items-center justify-center rounded-lg p-2 hover:bg-ink-100"
          onClick={() => setOpen((s) => !s)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden border-t border-ink-100 bg-white">
          <ul className="container py-4 space-y-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 rounded-lg text-ink-700 hover:bg-ink-50"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="pt-3 flex gap-2">
              <Link href="/auth/login" className="btn-outline w-1/2">Sign in</Link>
              <Link href="/auth/signup" className="btn-primary w-1/2">Sign up</Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
