"use client";
import { useState } from "react";
import { Loader2, Check, AlertTriangle, KeyRound } from "lucide-react";

export default function PasswordCard({ hasPassword }: { hasPassword: boolean }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (next.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (next !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setStatus("saving");
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: next, currentPassword: hasPassword ? current : undefined }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.ok) throw new Error(body.error || "Could not update password");
      setStatus("saved");
      setCurrent(""); setNext(""); setConfirm("");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (e: any) {
      setError(e?.message || "Could not update password");
      setStatus("error");
    }
  }

  return (
    <section className="card p-6">
      <h2 className="font-bold flex items-center gap-2">
        <KeyRound className="h-5 w-5 text-brand-600" /> {hasPassword ? "Change password" : "Set a password"}
      </h2>
      <p className="mt-1 text-sm text-ink-500">
        {hasPassword
          ? "Update the password you use to sign in with your phone number."
          : "Set a password so you can sign in with your phone number + password (no OTP needed)."}
      </p>

      <form onSubmit={submit} className="mt-4 grid sm:grid-cols-2 gap-4">
        {hasPassword && (
          <div className="sm:col-span-2">
            <label className="label">Current password</label>
            <input className="input" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" required />
          </div>
        )}
        <div>
          <label className="label">New password</label>
          <input className="input" type="password" minLength={8} value={next} onChange={(e) => setNext(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" required />
        </div>
        <div>
          <label className="label">Confirm new password</label>
          <input className="input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
        </div>

        {error && (
          <p className="sm:col-span-2 flex items-center gap-2 text-sm text-rose-700">
            <AlertTriangle className="h-4 w-4" /> {error}
          </p>
        )}
        {status === "saved" && (
          <p className="sm:col-span-2 flex items-center gap-2 text-sm text-emerald-700">
            <Check className="h-4 w-4" /> Password {hasPassword ? "changed" : "set"}
          </p>
        )}

        <div className="sm:col-span-2">
          <button className="btn-primary" disabled={status === "saving"}>
            {status === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : hasPassword ? "Change password" : "Set password"}
          </button>
        </div>
      </form>
    </section>
  );
}
