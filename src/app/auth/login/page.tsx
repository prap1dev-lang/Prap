"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ArrowRight, Loader2, AlertTriangle, Phone } from "lucide-react";
import { firebaseAuth } from "@/lib/firebase-client";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";

function normalizePhone(p: string) {
  const trimmed = p.replace(/\s|-/g, "");
  if (trimmed.startsWith("+")) return trimmed;
  if (trimmed.length === 10) return `+91${trimmed}`;
  return `+${trimmed.replace(/^\+/, "")}`;
}

export default function LoginPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
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

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!recaptchaRef.current) {
        recaptchaRef.current = new RecaptchaVerifier(firebaseAuth, "recaptcha-container", {
          size: "invisible",
        });
      }
      const result = await signInWithPhoneNumber(
        firebaseAuth,
        normalizePhone(phone),
        recaptchaRef.current,
      );
      confirmationRef.current = result;
      setStep("otp");
    } catch (e: any) {
      setError(e?.message || "Failed to send OTP");
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
    } finally {
      setLoading(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!confirmationRef.current) throw new Error("Session expired. Please resend OTP.");
      const credential = await confirmationRef.current.confirm(otp);
      const idToken = await credential.user.getIdToken();

      const origin = window.location.origin;
      const res = await fetch("/api/auth/firebase/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          mode: "login",
          redirectTo: `${origin}/dashboard`,
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok || !body.actionLink) {
        throw new Error(body.error || "Sign in failed");
      }
      window.location.href = body.actionLink;
    } catch (e: any) {
      setError(e?.message || "Invalid OTP");
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-ink-700">Sign in to your PRAP account.</p>

      {/* invisible reCAPTCHA container — Firebase requires a DOM node */}
      <div id="recaptcha-container" />

      {step === "phone" ? (
        <form onSubmit={sendOtp} className="mt-6 space-y-4">
          <div>
            <label className="label">Phone number</label>
            <input
              className="input"
              type="tel"
              inputMode="numeric"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="98XXXXXXXX"
            />
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

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 flex items-start gap-2">
      <AlertTriangle className="h-4 w-4 mt-0.5 flex-none" />
      <span>{msg}</span>
    </div>
  );
}
