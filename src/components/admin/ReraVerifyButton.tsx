"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";

export default function ReraVerifyButton({ userId, state = "UP" }: { userId: string; state?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/kyc/rera", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, state }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) throw new Error(body.error || "Verification failed");
      setMsg(body.valid ? `✅ Verified${body.name ? ` — ${body.name}` : ""}` : "❌ Not found in RERA");
      router.refresh();
    } catch (e: any) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button onClick={run} className="btn-primary !py-2 !px-4 text-sm" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
        Run RERA check
      </button>
      {msg && <p className="text-sm text-ink-700">{msg}</p>}
    </div>
  );
}
