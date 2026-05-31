"use client";
import { useState } from "react";
import { ShieldCheck, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";

type Stage = "idle" | "sending" | "awaiting_otp" | "verifying" | "done" | "error";

export default function AadhaarOtpCard({ initiallyVerified = false }: { initiallyVerified?: boolean }) {
  const [stage, setStage] = useState<Stage>(initiallyVerified ? "done" : "idle");
  const [aadhaar, setAadhaar] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStage("sending");
    try {
      const res = await fetch("/api/kyc/aadhaar/generate-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaar }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) throw new Error(body.error || "Failed to send OTP");
      setStage("awaiting_otp");
    } catch (e: any) {
      setError(e.message);
      setStage("error");
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStage("verifying");
    try {
      const res = await fetch("/api/kyc/aadhaar/submit-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok || !body.valid) throw new Error(body.error || "Invalid OTP");
      setName(body.fullName ?? null);
      setStage("done");
    } catch (e: any) {
      setError(e.message);
      setStage("awaiting_otp");
    }
  }

  if (stage === "done") {
    return (
      <div className="card p-6 border-emerald-200">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div>
            <p className="font-bold text-ink-900">Aadhaar verified</p>
            <p className="text-sm text-ink-500">{name ? `Verified as ${name}` : "Your Aadhaar is verified on UIDAI."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3">
        <span className="h-10 w-10 rounded-xl bg-brand-50 text-brand-700 grid place-items-center">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <p className="font-bold text-ink-900">Verify your Aadhaar</p>
          <p className="text-sm text-ink-500">Get a one-time code on your Aadhaar-registered mobile.</p>
        </div>
      </div>

      {stage !== "awaiting_otp" && stage !== "verifying" ? (
        <form onSubmit={sendOtp} className="mt-5 space-y-3">
          <input
            className="input"
            placeholder="12-digit Aadhaar number"
            value={aadhaar}
            inputMode="numeric"
            maxLength={12}
            onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ""))}
            required
          />
          {error && <ErrorBox msg={error} />}
          <button className="btn-primary w-full" disabled={stage === "sending" || aadhaar.length !== 12}>
            {stage === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="mt-5 space-y-3">
          <p className="text-sm text-ink-700">
            We sent a code to the mobile linked to Aadhaar ending <strong>{aadhaar.slice(-4)}</strong>.
          </p>
          <input
            className="input tracking-[0.5em] text-center font-bold text-lg"
            placeholder="• • • • • •"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
            inputMode="numeric"
            required
          />
          {error && <ErrorBox msg={error} />}
          <button className="btn-primary w-full" disabled={stage === "verifying" || otp.length < 4}>
            {stage === "verifying" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Aadhaar"}
          </button>
          <button type="button" onClick={() => setStage("idle")} className="btn-ghost w-full">
            Change number
          </button>
        </form>
      )}
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 flex items-start gap-2">
      <AlertTriangle className="h-4 w-4 mt-0.5 flex-none" /> <span>{msg}</span>
    </div>
  );
}
