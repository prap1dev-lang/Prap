"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { SERVICES } from "@/lib/services-nav";

/** Desktop "Services" mega-menu trigger + glass dropdown panel. */
export default function ServicesMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const enter = () => { clearTimeout(closeTimer.current); setOpen(true); };
  const leave = () => { closeTimer.current = setTimeout(() => setOpen(false), 160); };

  return (
    <div ref={ref} className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        onClick={() => setOpen((s) => !s)}
        className="inline-flex items-center gap-1.5 hover:text-brand-600 transition-colors"
        aria-haspopup="true"
        aria-expanded={open}
      >
        Services <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4 w-[min(92vw,940px)]">
          <div className="glass !bg-white/85 p-6 shadow-soft">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-7">
              {SERVICES.map((col) => (
                <div key={col.title}>
                  <p className="flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-brand-600">
                    <col.icon className="h-3.5 w-3.5" strokeWidth={1.6} /> {col.title}
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    {col.items.map((it) => (
                      <li key={it.label}>
                        <Link
                          href={it.href}
                          onClick={() => setOpen(false)}
                          className="block text-[0.82rem] leading-snug text-ink-600 hover:text-brand-700 transition-colors normal-case tracking-normal"
                        >
                          {it.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-ink-900/5 flex items-center justify-between">
              <p className="text-sm text-ink-500 normal-case tracking-normal">India's first AI-powered, legally-verified homebuyer platform.</p>
              <Link href="/buyer-protection" onClick={() => setOpen(false)} className="btn-link text-brand-700 normal-case tracking-normal">
                Explore Buyer Protection
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
