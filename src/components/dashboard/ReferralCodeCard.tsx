"use client";
import { useState, useEffect } from "react";
import { Copy, Check, Share2 } from "lucide-react";

/**
 * Referral code card for any role. Shows the user's one permanent code and
 * copies / shares the signup link. Both the referrer and the new user earn
 * coins on signup. The code never changes.
 */
export default function ReferralCodeCard({
  initialCode,
  role = "referrer",
}: {
  initialCode: string | null;
  role?: "broker" | "corporate" | "referrer" | "admin";
}) {
  const [code, setCode] = useState<string | null>(initialCode);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const link = code
    ? `${typeof window !== "undefined" ? window.location.origin : "https://prap.in"}/auth/signup?ref=${code}`
    : "";
  const shareText = code
    ? `Join PRAP with my referral code ${code} — I get 5,000 PRAP Coins (₹5,000) and you get 20,000 signup coins when you sign up. ${link}`
    : "";

  // Auto-fetch a code if the user doesn't have one yet.
  useEffect(() => {
    if (!code) void loadIfMissing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadIfMissing() {
    if (code) return;
    const res = await fetch("/api/corporate/referral-code");
    const body = await res.json().catch(() => ({}));
    if (body.ok) setCode(body.code);
  }

  async function copy() {
    await loadIfMissing();
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function share() {
    await loadIfMissing();
    if (!shareText) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: "PRAP referral", text: shareText });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <section className="card p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm text-ink-500">
            {role === "corporate" ? "Your corporate referral code" : "Your referral code"}
          </p>
          <p className="mt-1 font-mono text-2xl font-extrabold tracking-tight">
            {code ?? "—"}
          </p>
          <p className="mt-2 text-sm text-ink-700">
            Share your link — <strong>you earn 5,000 PRAP Coins</strong> (₹5,000) for each friend who signs up (first 5), and they get their 20,000 signup coins.
          </p>
          {error && <p className="mt-2 text-sm text-rose-700">{error}</p>}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="btn-outline" onClick={copy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied link" : "Copy link"}
          </button>
          <button className="btn-outline" onClick={share}>
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>
      </div>
    </section>
  );
}
