"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, Handshake } from "lucide-react";

/**
 * Admin controls for the broker coin programme.
 *   • Credit view  → both broker & client +25,000 (consumes a client slot)
 *   • Close deal   → both broker & client +5,000  (unlocks 5 more slots every 5 deals)
 * Only shown for bookings that have a broker attached.
 */
export default function BrokerDealButtons({
  bookingId,
  hasBroker,
}: {
  bookingId: string;
  hasBroker: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "view" | "deal">(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  if (!hasBroker) return <span className="text-[11px] text-ink-400">No broker</span>;

  async function call(kind: "view" | "deal") {
    setErr(null);
    setMsg(null);
    let dealValueInr: number | undefined;
    if (kind === "deal") {
      const raw = prompt("Deal value in ₹ (numbers only) — optional, sets redemption tier:");
      if (raw === null) return; // cancelled
      const n = Number(raw.replace(/[^\d]/g, ""));
      dealValueInr = Number.isFinite(n) && n > 0 ? n : undefined;
    }
    setBusy(kind);
    try {
      const url = kind === "view" ? "/api/admin/brokers/credit-view" : "/api/admin/brokers/close-deal";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, ...(dealValueInr ? { dealValueInr } : {}) }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.ok) throw new Error(body.error || "Failed");
      setMsg(
        kind === "view"
          ? `View credited${typeof body.slotsRemaining === "number" ? ` · ${body.slotsRemaining} slots left` : ""}`
          : `Deal closed${body.slotsUnlocked ? " · +5 slots unlocked" : ""}`,
      );
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || "Failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        <button className="btn-outline !py-1 !px-2 text-xs" onClick={() => call("view")} disabled={busy !== null}>
          {busy === "view" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3" />} View
        </button>
        <button className="btn-outline !py-1 !px-2 text-xs" onClick={() => call("deal")} disabled={busy !== null}>
          {busy === "deal" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Handshake className="h-3 w-3" />} Close
        </button>
      </div>
      {msg && <span className="text-[11px] text-emerald-700">{msg}</span>}
      {err && <span className="text-[11px] text-rose-700">{err}</span>}
    </div>
  );
}
