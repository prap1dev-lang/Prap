"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ArrowRight, Loader2, AlertTriangle, Phone } from "lucide-react";
import { firebaseAuth } from "@/lib/firebase-client";
import { supabaseBrowser } from "@/lib/supabase";
import { showAlert } from "@/components/ui/Alert";
import { friendlyFirebaseError } from "@/lib/firebase-errors";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";

function tenDigits(p: string): string {
  let d = p.replace(/\D/g, "");
  if (d.startsWith("91") && d.length === 12) d = d.slice(2);
  if (d.startsWith("0") && d.length === 11) d = d.slice(1);
  return d;
}

function isValidIndianMobile(p: string): boolean {
  return /^[6-9]\d{9}$/.test(tenDigits(p));
}

function normalizePhone(p: string) {
  return `+91${tenDigits(p)}`;
}

export default function LoginPage() {
  const [method, setMethod] = useState<"password" | "otp">("password");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    return () => {
      recaptchaRef.current?.clear();
    };
  }, []);

  async function passwordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isValidIndianMobile(phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/password-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.ok || !body.session) {
        throw new Error(errorMessage(body.error, "Sign in failed"));
      }
      const { error: sessErr } = await supabaseBrowser().auth.setSession(body.session);
      if (sessErr) throw sessErr;
      window.location.href = "/dashboard";
    } catch (e: any) {
      showAlert({ type: "error", toast: true, title: "Sign in failed", text: e?.message || "Incorrect phone or password." });
      setLoading(false);
    }
  }

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isValidIndianMobile(phone)) {
      setError("Enter a valid 10-digit mobile number (no leading 0 or +91).");
      return;
    }
    setLoading(true);
    try {
      // Rebuild a fresh invisible reCAPTCHA each attempt to avoid stale/expired verifier errors.
      recaptchaRef.current?.clear();
      recaptchaRef.current = new RecaptchaVerifier(firebaseAuth, "recaptcha-container", {
        size: "invisible",
      });
      const result = await signInWithPhoneNumber(
        firebaseAuth,
        normalizePhone(phone),
        recaptchaRef.current,
      );
      confirmationRef.current = result;
      setStep("otp");
    } catch (e: any) {
      setError(friendlyFirebaseError(e));
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
    } finally {
      setLoading(false);
    }
  }

  function resetToPhone(msg: string) {
    recaptchaRef.current?.clear();
    recaptchaRef.current = null;
    confirmationRef.current = null;
    setOtp("");
    setLoading(false);
    setStep("phone");
    setError(msg);
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!confirmationRef.current) {
        resetToPhone("Your code expired. Please request a new OTP.");
        return;
      }
      const credential = await confirmationRef.current.confirm(otp);
      const idToken = await credential.user.getIdToken();

      const res = await fetch("/api/auth/firebase/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, mode: "login" }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok || !body.session) {
        throw new Error(errorMessage(body.error, "Sign in failed"));
      }

      // Set the Supabase session directly — no magic-link redirect.
      const { error: sessErr } = await supabaseBrowser().auth.setSession(body.session);
      if (sessErr) throw sessErr;

      window.location.href = "/dashboard";
    } catch (e: any) {
      const code = e?.code || "";
      if (code === "auth/code-expired" || code === "auth/session-expired" || /expired|recaptcha/i.test(String(e?.message))) {
        resetToPhone("Your code expired. Please request a new OTP.");
        return;
      }
      if (code === "auth/invalid-verification-code") {
        setError("That OTP is incorrect. Please re-enter the 6-digit code.");
        setLoading(false);
        return;
      }
      setError(friendlyFirebaseError(e));
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-ink-700">Sign in to your PRAP account.</p>

      {/* invisible reCAPTCHA container — Firebase requires a DOM node */}
      <div id="recaptcha-container" />

      {/* Method switch */}
      <div className="mt-6 inline-flex rounded-xl bg-ink-50 border border-ink-200 p-1 text-sm font-semibold">
        <button
          type="button"
          onClick={() => { setMethod("password"); setError(null); }}
          className={`rounded-lg px-4 py-1.5 transition ${method === "password" ? "bg-white shadow-card text-ink-900" : "text-ink-500"}`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => { setMethod("otp"); setStep("phone"); setError(null); }}
          className={`rounded-lg px-4 py-1.5 transition ${method === "otp" ? "bg-white shadow-card text-ink-900" : "text-ink-500"}`}
        >
          OTP
        </button>
      </div>

      {method === "password" ? (
        <form onSubmit={passwordLogin} className="mt-5 space-y-4">
          <div>
            <label className="label">Phone number</label>
            <div className="flex">
              <span className="inline-flex items-center rounded-l-xl border border-r-0 border-ink-200 bg-ink-50 px-3 text-sm font-semibold text-ink-700">+91</span>
              <input
                className="input !rounded-l-none"
                inputMode="numeric"
                required
                value={phone}
                onChange={(e) => {
                  let d = e.target.value.replace(/\D/g, "");
                  if (d.startsWith("0")) d = d.slice(1);
                  setPhone(d.slice(0, 10));
                }}
                placeholder="98XXXXXXXX"
                maxLength={10}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="label !mb-0">Password</label>
              <Link href="/auth/forgot-password" className="text-xs font-semibold text-brand-700 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              className="input mt-1.5"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
            />
          </div>
          {error && <ErrorBox msg={error} />}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
          </button>
          <p className="text-center text-xs text-ink-500">
            No password yet? Use the <button type="button" onClick={() => { setMethod("otp"); setStep("phone"); setError(null); }} className="font-semibold text-brand-700 hover:underline">OTP</button> option.
          </p>
        </form>
      ) : step === "phone" ? (
        <form onSubmit={sendOtp} className="mt-5 space-y-4">
          <div>
            <label className="label">Phone number</label>
            <div className="flex">
              <span className="inline-flex items-center rounded-l-xl border border-r-0 border-ink-200 bg-ink-50 px-3 text-sm font-semibold text-ink-700">
                +91
              </span>
              <input
                className="input !rounded-l-none"
                inputMode="numeric"
                required
                value={phone}
                onChange={(e) => {
                  let d = e.target.value.replace(/\D/g, "");
                  if (d.startsWith("0")) d = d.slice(1);
                  setPhone(d.slice(0, 10));
                }}
                placeholder="98XXXXXXXX"
                maxLength={10}
              />
            </div>
            {phone.length > 0 && !isValidIndianMobile(phone) && (
              <p className="text-xs text-rose-600 mt-1">Enter a 10-digit number starting 6–9.</p>
            )}
          </div>
          {error && <ErrorBox msg={error} />}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send OTP <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="mt-6 space-y-4">
          <div className="rounded-xl bg-brand-50 border border-brand-200 p-3 flex items-start gap-2 text-brand-900 text-sm">
            <Phone className="h-4 w-4 mt-0.5 flex-none" />
            <span>We SMS'd a 6-digit code to <strong>{normalizePhone(phone)}</strong>.</span>
          </div>
          <div>
            <label className="label">Enter OTP</label>
            <input
              className="input tracking-[0.5em] text-center font-bold text-lg"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="• • • • • •"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              autoFocus
            />
          </div>
          {error && <ErrorBox msg={error} />}
          <button className="btn-primary w-full" disabled={loading || otp.length !== 6}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
          </button>
          <button type="button" className="btn-ghost w-full" onClick={() => { setStep("phone"); setOtp(""); }}>
            Change phone number
          </button>
        </form>
      )}

      <p className="mt-6 text-sm text-ink-500">
        New to PRAP?{" "}
        <Link href="/auth/signup" className="text-brand-700 font-semibold hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

function errorMessage(err: unknown, fallback: string): string {
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    // Zod flatten: { formErrors: [], fieldErrors: { x: [msg] } }
    const o = err as any;
    const field = o.fieldErrors
      ? Object.values(o.fieldErrors).flat().filter(Boolean).join(", ")
      : "";
    const form = Array.isArray(o.formErrors) ? o.formErrors.join(", ") : "";
    return field || form || fallback;
  }
  return fallback;
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 flex items-start gap-2">
      <AlertTriangle className="h-4 w-4 mt-0.5 flex-none" />
      <span>{msg}</span>
    </div>
  );
}
