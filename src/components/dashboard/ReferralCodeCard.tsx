"use client";
import { useState } from "react";
import { Copy, Check, RefreshCw, Share2, Loader2 } from "lucide-react";

/**
 * Corporate referral code card. Shows the active code, copies / shares it, and
 * can rotate it (old code is deactivated server-side, attribution preserved).
 */
export default function ReferralCodeCard({ initialCode }: { initialCode: string | null }) {
  const [code, setCode] = useState<string | null>(initialCode);
  const [copied, setCopied] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareText = code
    ? `Join PRAP with my referral code ${code} and start earning PRAP Coins on your property visits. https://prap.in/auth/signup?ref=${code}`
    : "";

  async function loadIfMissing() {
    if (code) return;
    const res = await fetch("/api/corporate/referral-code");
    const body = await res.json().catch(() => ({}));
    if (body.ok) setCode(body.code);
  }

  async function copy() {
    await loadIfMissing();
    if (!code) return;
    await navigator.clipboard.writeText(code);
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

  async function rotate() {
    if (!confirm("Rotate your code? The old code stops working for NEW signups.")) return;
    setRotating(true);
    setError(null);
    try {
      const res = await fetch("/api/corporate/referral-code", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.ok) throw new Error(body.error || "Rotate failed");
      setCode(body.code);
    } catch (e: any) {
      setError(e?.message || "Could not rotate code");
    } finally {
      setRotating(false);
    }
  }

  return (
    <section className="card p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm text-ink-500">Your corporate referral code</p>
          <p className="mt-1 font-mono text-2xl font-extrabold tracking-tight">
            {code ?? "—"}
          </p>
          <p className="mt-2 text-sm text-ink-700">
            Share with employees &amp; partners. You earn 5,000 coins per qualifying visit.
          </p>
          {error && <p className="mt-2 text-sm text-rose-700">{error}</p>}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="btn-outline" onClick={copy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button className="btn-outline" onClick={share}>
            <Share2 className="h-4 w-4" /> Share
          </button>
          <button className="btn-ghost" onClick={rotate} disabled={rotating}>
            {rotating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Rotate
          </button>
        </div>
      </div>
    </section>
  );
}
