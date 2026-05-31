"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ShieldCheck, AlertTriangle, Lock, Mail } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";

/**
 * Admin sign-in. Separate from the public phone-OTP flow.
 *   • Uses Supabase email + password (no SMS, no magic links).
 *   • Cookies are set directly by signInWithPassword via @supabase/ssr.
 *   • If the email is in ADMIN_BOOTSTRAP_EMAILS, /admin auto-promotes
 *     them to role='admin' on the first /admin visit.
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/admin";
  const presetError = sp.get("error") === "not-admin"
    ? "That account isn't an admin. Sign in with an admin email."
    : null;

  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(presetError);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) throw signInErr;
      // Hard nav so the server picks up the new cookies on /admin.
      window.location.href = next;
    } catch (e: any) {
      setError(e?.message || "Sign-in failed");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <aside className="hidden lg:flex flex-col justify-between bg-ink-950 text-white p-10 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-600/30 blur-3xl" />
        <Link href="/" className="flex items-center gap-2 font-extrabold relative z-10">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="text-lg tracking-tight">PRAP <span className="text-brand-400">Admin</span></span>
        </Link>
        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-extrabold leading-tight">Internal access only.</h2>
          <p className="mt-4 text-ink-200">
            Admin sign-in is separate from the public site. Use the email + password set
            for you in Supabase Auth.
          </p>
          <ul className="mt-6 space-y-2 text-ink-200 text-sm">
            <li>• No phone OTP — no SMS dependency</li>
            <li>• Role enforced at the database level</li>
            <li>• Session resets each time you sign out</li>
          </ul>
        </div>
        <p className="relative z-10 text-xs text-ink-300">PRAP Internal · {new Date().getFullYear()}</p>
      </aside>

      <main className="grid place-items-center p-6 md:p-10 bg-offwhite">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-extrabold tracking-tight">Admin sign-in</h1>
          <p className="mt-2 text-ink-700">Use the credentials set in Supabase Auth.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500" />
                <input
                  className="input !pl-9"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@prap.in"
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500" />
                <input
                  className="input !pl-9"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-none" />
                <span>{error}</span>
              </div>
            )}

            <button className="btn-primary w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in to admin"}
            </button>
          </form>

          <p className="mt-6 text-xs text-ink-500">
            This is the admin panel sign-in. <Link href="/auth/login" className="underline">User login</Link> ·{" "}
            <Link href="/" className="underline">Back to site</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
