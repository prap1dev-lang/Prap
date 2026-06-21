"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, PlusCircle } from "lucide-react";
import { PROPERTY_CATEGORIES } from "@/lib/services-nav";

/** Desktop "Projects" dropdown — property categories + a "List property" CTA. */
export default function ProjectsMenu() {
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
        Projects <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4 w-[min(92vw,520px)]">
          <div className="glass !bg-white/85 p-6 shadow-soft">
            <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5">
              {PROPERTY_CATEGORIES.items.map((it) => (
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

            <div className="mt-5 pt-5 border-t border-ink-900/5">
              <Link
                href="/list-property"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition normal-case tracking-normal"
              >
                <PlusCircle className="h-4 w-4" /> List your property
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
