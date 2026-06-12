"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Coins, X, ArrowRight, Gift } from "lucide-react";

/**
 * Lead-capture popup that appears 5 seconds after the page loads, inviting the
 * visitor to register. Shown at most once per browser session so it doesn't
 * nag returning users within the same visit.
 */
const SEEN_KEY = "prap_join_popup_seen";

export default function JoinPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SEEN_KEY)) return;

    const t = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(SEEN_KEY, "1");
    }, 5000);

    return () => clearTimeout(t);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="join-popup-title"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* card */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        <button
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/20 transition"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* header band */}
        <div className="bg-brand-600 px-6 pt-8 pb-10 text-center text-white">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <Coins className="h-7 w-7" />
          </span>
          <h2 id="join-popup-title" className="mt-4 text-2xl font-extrabold tracking-tight">
            Join PRAP
          </h2>
          <p className="mt-1 text-brand-100">
            Register now &amp; get <strong className="text-white">25,000 PRAP Coins</strong> (₹25,000) instantly.
          </p>
        </div>

        {/* body */}
        <div className="px-6 pb-6 -mt-5">
          <div className="rounded-xl bg-white shadow-card border border-ink-100 p-4">
            <ul className="space-y-2 text-sm text-ink-700">
              <li className="flex items-start gap-2">
                <Gift className="h-4 w-4 text-brand-600 mt-0.5 flex-none" />
                25,000 coins credited on signup
              </li>
              <li className="flex items-start gap-2">
                <Gift className="h-4 w-4 text-brand-600 mt-0.5 flex-none" />
                Earn more on every site visit &amp; referral
              </li>
              <li className="flex items-start gap-2">
                <Gift className="h-4 w-4 text-brand-600 mt-0.5 flex-none" />
                RERA-verified projects, zero brokerage
              </li>
            </ul>
          </div>

          <Link
            href="/auth/signup"
            onClick={() => setOpen(false)}
            className="btn-primary w-full mt-5 justify-center"
          >
            Register here <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="block w-full text-center text-sm text-ink-500 mt-3 hover:text-ink-700"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
