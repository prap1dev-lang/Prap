"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [validLink, setValidLink] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // The recovery link drops the user here with a session in the URL hash.
  // detectSessionInUrl establishes it; we confirm a session exists.
  useEffect(() => {
    const sb = supabaseBrowser();
    let mounted = true;

    // PASSWORD_RECOVERY fires once the recovery session is parsed from the URL.
    const { data: sub } = sb.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && mounted) {
        setValidLink(true);
        setReady(true);
      }
    });

    // Fallback: if the listener already missed the event, check the session.
    sb.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session) setValidLink(true);
      setReady(true);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      const sb = supabaseBrowser();
      const { error: err } = await sb.auth.updateUser({ password });
      if (err) throw err;
      // Flag has_password in our profile table (best-effort).
      await fetch("/api/auth/mark-password", { method: "POST" }).catch(() => {});
      setDone(true);
    } catch (e: any) {
      setError(e?.message?.replace(/^AuthApiError:\s*/, "") || "Could not update password.");
      setLoading(false);
    }
  }

  if (!ready) {
    return (
      <div className="grid place-items-center py-16 text-ink-500">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
        <p className="mt-3 text-sm">Verifying your reset link…</p>
      </div>
    );
  }

  if (done) {
    return (
      <div>
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 flex items-start gap-3">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 flex-none mt-0.5" />
          <div>
            <h1 className="text-xl font-extrabold text-emerald-900">Password updated</h1>
            <p className="mt-1 text-sm text-emerald-800">You can now sign in with your new password.</p>
          </div>
        </div>
        <Link href="/auth/login" className="btn-primary mt-6">Go to sign in</Link>
      </div>
    );
  }

  if (!validLink) {
    return (
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Link expired</h1>
        <p className="mt-2 text-ink-700">
          This password-reset link is invalid or has expired. Please request a new one.
        </p>
        <Link href="/auth/forgot-password" className="btn-primary mt-6">Request a new link</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Set a new password</h1>
      <p className="mt-2 text-ink-700">Choose a strong password you'll remember.</p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="label">New password</label>
          <input
            className="input"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            autoFocus
          />
        </div>
        <div>
          <label className="label">Confirm password</label>
          <input
            className="input"
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter password"
            autoComplete="new-password"
          />
        </div>
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-none" /> <span>{error}</span>
          </div>
        )}
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
        </button>
      </form>
    </div>
  );
}
