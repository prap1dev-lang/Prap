"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Loader2, AlertTriangle, MailCheck } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/auth/reset-password`;
      const { error: err } = await supabaseBrowser().auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });
      if (err) throw err;
      // Always show success (don't reveal whether the email exists).
      setSent(true);
    } catch (e: any) {
      // Still show generic success to avoid account enumeration, unless it's a
      // clear client/config error worth surfacing.
      if (/rate|too many/i.test(String(e?.message))) {
        setError("Too many requests. Please wait a minute and try again.");
      } else {
        setSent(true);
      }
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div>
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 flex items-start gap-3">
          <MailCheck className="h-6 w-6 text-emerald-600 flex-none mt-0.5" />
          <div>
            <h1 className="text-xl font-extrabold text-emerald-900">Check your email</h1>
            <p className="mt-1 text-sm text-emerald-800">
              If an account exists for <strong>{email}</strong>, we've sent a password-reset link.
              Open it to set a new password. The link expires in 1 hour.
            </p>
          </div>
        </div>
        <Link href="/auth/login" className="btn-outline mt-6">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Reset your password</h1>
      <p className="mt-2 text-ink-700">
        Enter the email on your PRAP account. We'll send you a secure reset link.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="label">Email address</label>
          <input
            className="input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoFocus
          />
        </div>
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-none" /> <span>{error}</span>
          </div>
        )}
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink-500">
        Remembered it?{" "}
        <Link href="/auth/login" className="text-brand-700 font-semibold hover:underline">
          Back to sign in
        </Link>
      </p>
      <p className="mt-2 text-xs text-ink-400">
        No email on your account? Sign in with phone OTP instead, then set an email in Settings.
      </p>
    </div>
  );
}
