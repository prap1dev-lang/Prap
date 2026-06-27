"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, ArrowRight, Loader2, AlertTriangle, CheckCircle2, Phone } from "lucide-react";
import { firebaseAuth } from "@/lib/firebase-client";
import { friendlyFirebaseError } from "@/lib/firebase-errors";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

function tenDigits(p: string): string {
  let d = p.replace(/\D/g, "");
  if (d.startsWith("91") && d.length === 12) d = d.slice(2);
  if (d.startsWith("0") && d.length === 11) d = d.slice(1);
  return d;
}
function isValidIndianMobile(p: string) {
  return /^[6-9]\d{9}$/.test(tenDigits(p));
}
function normalizePhone(p: string) {
  return `+91${tenDigits(p)}`;
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"phone" | "otp" | "password" | "done">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const idTokenRef = useRef<string | null>(null);

  useEffect(() => () => recaptchaRef.current?.clear(), []);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isValidIndianMobile(phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setLoading(true);
    try {
      recaptchaRef.current?.clear();
      recaptchaRef.current = new RecaptchaVerifier(firebaseAuth, "recaptcha-container-reset", { size: "invisible" });
      confirmationRef.current = await signInWithPhoneNumber(firebaseAuth, normalizePhone(phone), recaptchaRef.current);
      setStep("otp");
    } catch (e: any) {
      setError(friendlyFirebaseError(e));
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!confirmationRef.current) {
        setError("Your code expired. Please request a new OTP.");
        setStep("phone");
        return;
      }
      const credential = await confirmationRef.current.confirm(otp);
      idTokenRef.current = await credential.user.getIdToken();
      setStep("password");
    } catch (e: any) {
      if (e?.code === "auth/invalid-verification-code") {
        setError("That OTP is incorrect. Please re-enter the 6-digit code.");
      } else {
        setError(friendlyFirebaseError(e));
      }
    } finally {
      setLoading(false);
    }
  }

  async function setNewPassword(e: React.FormEvent) {
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
      const res = await fetch("/api/auth/reset-password-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: idTokenRef.current, password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.ok) {
        const msg = typeof body.error === "string" ? body.error : "Could not reset password.";
        throw new Error(msg);
      }
      setStep("done");
    } catch (e: any) {
      setError(e?.message || "Could not reset password.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "done") {
    return (
      <div>
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 flex items-start gap-3">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 flex-none mt-0.5" />
          <div>
            <h1 className="text-xl font-extrabold text-emerald-900">Password updated</h1>
            <p className="mt-1 text-sm text-emerald-800">
              Your new password is set for <strong>{normalizePhone(phone)}</strong>. Sign in with your phone and new password.
            </p>
          </div>
        </div>
        <Link href="/auth/login" className="btn-primary mt-6">Go to sign in <ArrowRight className="h-4 w-4" /></Link>
      </div>
    );
  }

  return (
    <div>
      <div id="recaptcha-container-reset" />
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Reset your password</h1>
      <p className="mt-2 text-ink-700">
        {step === "phone" && "Enter your registered phone — we'll send an OTP to verify it."}
        {step === "otp" && "Enter the 6-digit code we sent to your phone."}
        {step === "password" && "Set a new password for your account."}
      </p>

      {step === "phone" && (
        <form onSubmit={sendOtp} className="mt-6 space-y-4">
          <div>
            <label className="label">Phone number</label>
            <div className="flex">
              <span className="inline-flex items-center rounded-l-xl border border-r-0 border-ink-200 bg-ink-50 px-3 text-sm font-semibold text-ink-700">+91</span>
              <input
                className="input !rounded-l-none"
                inputMode="numeric"
                required
                value={phone}
                onChange={(e) => { let d = e.target.value.replace(/\D/g, ""); if (d.startsWith("0")) d = d.slice(1); setPhone(d.slice(0, 10)); }}
                placeholder="98XXXXXXXX"
                maxLength={10}
                autoFocus
              />
            </div>
          </div>
          {error && <ErrorBox msg={error} />}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send OTP <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={verifyOtp} className="mt-6 space-y-4">
          <div className="rounded-xl bg-brand-50 border border-brand-200 p-3 flex items-start gap-2 text-brand-900 text-sm">
            <Phone className="h-4 w-4 mt-0.5 flex-none" />
            <span>We sent a 6-digit code to <strong>{normalizePhone(phone)}</strong>.</span>
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
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify OTP"}
          </button>
          <button type="button" className="btn-ghost w-full" onClick={() => { setStep("phone"); setOtp(""); }}>
            Change phone number
          </button>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={setNewPassword} className="mt-6 space-y-4">
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
            <label className="label">Confirm new password</label>
            <input
              className="input"
              type="password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter your password"
              autoComplete="new-password"
            />
          </div>
          {error && <ErrorBox msg={error} />}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
          </button>
        </form>
      )}

      <p className="mt-6 text-sm text-ink-500">
        Remembered it?{" "}
        <Link href="/auth/login" className="text-brand-700 font-semibold hover:underline">Back to sign in</Link>
      </p>
      <Link href="/auth/login" className="inline-flex items-center gap-1 mt-2 text-xs text-ink-400 hover:text-ink-600">
        <ArrowLeft className="h-3 w-3" /> Sign in
      </Link>
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
