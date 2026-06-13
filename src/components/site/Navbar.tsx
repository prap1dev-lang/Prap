"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import UserMenu from "./UserMenu";
import ServicesMenu from "./ServicesMenu";
import { SERVICES } from "@/lib/services-nav";

const links = [
  { href: "/projects", label: "Projects" },
  { href: "/buyer-protection", label: "Protection" },
  { href: "/how-it-works", label: "How it works" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [mobileServices, setMobileServices] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-ivory/70 backdrop-blur-xl backdrop-saturate-150 border-b border-ink-900/5"
          : "bg-transparent"
      }`}
    >
      <nav className="container flex items-center justify-between h-20">
        <Link href="/" className="font-serif text-xl tracking-tight text-ink-900">
          PRAP<span className="text-brand-600">.</span>
        </Link>

        <ul className="hidden lg:flex items-center gap-9 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-ink-600">
          <li><ServicesMenu /></li>
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="hover:text-brand-600 transition-colors">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center">
          <UserMenu variant="desktop" />
        </div>

        <button
          className="lg:hidden inline-flex items-center justify-center rounded-full p-2 text-ink-700 hover:bg-ink-900/5"
          onClick={() => setOpen((s) => !s)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden bg-ivory/95 backdrop-blur-xl border-t border-ink-900/5 max-h-[80vh] overflow-y-auto">
          <ul className="container py-5 space-y-1">
            {/* Services accordion */}
            <li>
              <button
                onClick={() => setMobileServices((s) => !s)}
                className="flex w-full items-center justify-between px-3 py-3 rounded-2xl text-sm uppercase tracking-[0.14em] text-ink-700 hover:bg-ink-900/5"
              >
                Services
                <ChevronDown className={`h-4 w-4 transition-transform ${mobileServices ? "rotate-180" : ""}`} />
              </button>
              {mobileServices && (
                <div className="ml-3 pl-3 border-l border-ink-900/5 py-1 space-y-4">
                  {SERVICES.map((col) => (
                    <div key={col.title}>
                      <p className="flex items-center gap-2 px-2 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-brand-600">
                        <col.icon className="h-3.5 w-3.5" strokeWidth={1.6} /> {col.title}
                      </p>
                      <ul className="mt-1.5 space-y-0.5">
                        {col.items.slice(0, 5).map((it) => (
                          <li key={it.label}>
                            <Link href={it.href} onClick={() => setOpen(false)} className="block px-2 py-1.5 rounded-xl text-[0.82rem] text-ink-600 hover:bg-ink-900/5">
                              {it.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </li>

            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-3 rounded-2xl text-sm uppercase tracking-[0.14em] text-ink-700 hover:bg-ink-900/5"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="pt-3 border-t border-ink-900/5 mt-2">
              <UserMenu variant="mobile" />
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
