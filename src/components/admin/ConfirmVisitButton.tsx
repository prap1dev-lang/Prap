"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";

/**
 * Admin control to confirm the next site visit for a booking and credit coins.
 * Calls the admin-only /api/admin/bookings/visit endpoint.
 */
export default function ConfirmVisitButton({
  bookingId,
  nextVisitNo,
  clientName,
}: {
  bookingId: string;
  nextVisitNo: number;
  clientName: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (nextVisitNo > 2) {
    return <span className="text-xs text-ink-400">No bonus (visit 3+)</span>;
  }

  async function confirm() {
    const raw = prompt(
      `Confirm visit #${nextVisitNo} for ${clientName}.\nEnter attendee names (comma-separated, min 2):`,
    );
    if (raw == null) return;
    const attendees = raw.split(",").map((s) => s.trim()).filter(Boolean);
    if (attendees.length < 2) {
      setError("At least 2 attendees required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/bookings/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, visitNo: nextVisitNo, attendees }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.ok) throw new Error(body.error || "Failed to confirm visit");
      setDone(true);
      router.refresh();
    } catch (e: any) {
      setError(e?.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-semibold">
        <CheckCircle2 className="h-4 w-4" /> Credited
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button className="btn-outline !py-1 !px-2 text-xs" onClick={confirm} disabled={busy}>
        {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
        Confirm visit #{nextVisitNo}
      </button>
      {error && <span className="text-[11px] text-rose-700">{error}</span>}
    </div>
  );
}
