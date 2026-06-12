"use client";
import { useState, useRef, useEffect } from "react";
import { Briefcase, Building2, UserRound, ArrowRight, Loader2, AlertTriangle, Phone } from "lucide-react";
import { firebaseAuth } from "@/lib/firebase-client";
import { supabaseBrowser } from "@/lib/supabase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";

type Role = "broker" | "corporate" | "referrer";

const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

/** Map Firebase auth error codes to clear, user-facing messages. */
function friendlyFirebaseError(e: any): string {
  switch (e?.code) {
    case "auth/invalid-phone-number":
      return "That phone number isn't valid. Enter a 10-digit Indian mobile.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "auth/quota-exceeded":
      return "OTP service is busy right now. Please try again shortly.";
    case "auth/code-expired":
    case "auth/session-expired":
      return "Your code expired. Please request a new OTP.";
    case "auth/captcha-check-failed":
      return "Verification failed. Please try again.";
    default:
      return e?.message?.replace(/^Firebase:\s*/, "") || "Failed to send OTP";
  }
}

const roles: { id: Role; title: string; icon: React.ComponentType<any>; subtitle: string }[] = [
  { id: "broker", title: "Broker", icon: Briefcase, subtitle: "Channel Partner / Agent" },
  { id: "corporate", title: "Corporate", icon: Building2, subtitle: "HR / Employer" },
  { id: "referrer", title: "Referrer", icon: UserRound, subtitle: "Buyer / Investor" },
];

/** Extract the 10-digit Indian mobile number, dropping +91 / 0 prefixes. */
function tenDigits(p: string): string {
  let d = p.replace(/\D/g, ""); // keep digits only
  if (d.startsWith("91") && d.length === 12) d = d.slice(2); // +91XXXXXXXXXX
  if (d.startsWith("0") && d.length === 11) d = d.slice(1); // 0XXXXXXXXXX
  return d;
}

/** True only for a valid 10-digit Indian mobile (starts 6–9). */
function isValidIndianMobile(p: string): boolean {
  return /^[6-9]\d{9}$/.test(tenDigits(p));
}

function normalizePhone(p: string) {
  return `+91${tenDigits(p)}`;
}

export default function SignupForm({
  initialRole,
  initialReferral = "",
}: {
  initialRole?: Role;
  initialReferral?: string;
}) {
  const [role, setRole] = useState<Role>(
    initialRole && (["broker", "corporate", "referrer"] as Role[]).includes(initialRole)
      ? initialRole
      : "referrer",
  );
  const [step, setStep] = useState<"form" | "otp">("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    pan: "",
    aadhaar: "",
    rera: "",
    referralCode: initialReferral.toUpperCase(),
    password: "",
  });
  const [otp, setOtp] = useState("");
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    return () => {
      recaptchaRef.current?.clear();
    };
  }, []);

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // ---- Client-side validation BEFORE touching Firebase ----
    if (!isValidIndianMobile(form.phone)) {
      setError("Enter a valid 10-digit mobile number (no leading 0 or +91).");
      return;
    }
    if (!PAN_RE.test(form.pan)) {
      setError("Enter a valid PAN (e.g. ABCDE1234F).");
      return;
    }
    if (form.aadhaar.length !== 12) {
      setError("Aadhaar must be exactly 12 digits.");
      return;
    }
    if (form.password.length < 8) {
      setError("Create a password of at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      // Always rebuild a fresh invisible reCAPTCHA — a stale/expired verifier
      // is the usual cause of "reCAPTCHA has already been rendered / expired".
      recaptchaRef.current?.clear();
      recaptchaRef.current = new RecaptchaVerifier(firebaseAuth, "recaptcha-container-signup", {
        size: "invisible",
      });

      const result = await signInWithPhoneNumber(
        firebaseAuth,
        normalizePhone(form.phone),
        recaptchaRef.current,
      );
      confirmationRef.current = result;
      setStep("otp");
    } catch (e: any) {
      setError(friendlyFirebaseError(e));
      // Tear the verifier down so the next attempt starts clean.
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyAndContinue(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (!confirmationRef.current) {
        resetToForm("Your code expired. Please request a new OTP.");
        return;
      }
      const credential = await confirmationRef.current.confirm(otp);
      const idToken = await credential.user.getIdToken();

      const phone = normalizePhone(form.phone);
      const res = await fetch("/api/auth/firebase/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          mode: "signup",
          role,
          profile: { ...form, phone },
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok || !body.session) {
        throw new Error(errorMessage(body.error, "OTP verification failed"));
      }

      // Set the Supabase session directly — no magic-link redirect.
      const { error: sessErr } = await supabaseBrowser().auth.setSession(body.session);
      if (sessErr) throw sessErr;

      window.location.href = `/dashboard?role=${role}&welcome=1`;
    } catch (e: any) {
      const code = e?.code || "";
      // Expired session / expired-or-stale reCAPTCHA → bounce back to the form
      // with a fresh verifier so the user can re-request a code cleanly.
      if (
        code === "auth/code-expired" ||
        code === "auth/session-expired" ||
        /expired|recaptcha/i.test(String(e?.message))
      ) {
        resetToForm("Your code expired. Please request a new OTP.");
        return;
      }
      if (code === "auth/invalid-verification-code") {
        setError("That OTP is incorrect. Please re-enter the 6-digit code.");
        setSubmitting(false);
        return;
      }
      setError(friendlyFirebaseError(e));
      setSubmitting(false);
    }
  }

  /** Reset OTP state and return to the form so the user can retry from scratch. */
  function resetToForm(msg: string) {
    recaptchaRef.current?.clear();
    recaptchaRef.current = null;
    confirmationRef.current = null;
    setOtp("");
    setSubmitting(false);
    setStep("form");
    setError(msg);
  }

  async function resendOtp() {
    setError(null);
    try {
      recaptchaRef.current?.clear();
      recaptchaRef.current = new RecaptchaVerifier(firebaseAuth, "recaptcha-container-signup", {
        size: "invisible",
      });
      const result = await signInWithPhoneNumber(
        firebaseAuth,
        normalizePhone(form.phone),
        recaptchaRef.current,
      );
      confirmationRef.current = result;
      setOtp("");
    } catch (e: any) {
      setError(friendlyFirebaseError(e));
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
    }
  }

  if (step === "otp") {
    return (
      <>
        <div id="recaptcha-container-signup" />
        <form onSubmit={verifyAndContinue} className="mt-6 space-y-4">
          <div className="rounded-xl bg-brand-50 border border-brand-200 p-4 flex items-start gap-3 text-brand-900">
            <Phone className="h-5 w-5 mt-0.5 flex-none" />
            <div className="text-sm">
              <p className="font-semibold">Check your SMS</p>
              <p>We sent a 6-digit code to <strong>{normalizePhone(form.phone)}</strong>. Valid for a few minutes.</p>
            </div>
          </div>
          <div>
            <label className="label">Enter the 6-digit code</label>
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
          <button className="btn-primary w-full" disabled={submitting || otp.length !== 6}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Verify & continue <ArrowRight className="h-4 w-4" /></>}
          </button>
          <div className="flex gap-2">
            <button type="button" className="btn-ghost flex-1" onClick={resendOtp}>Resend SMS</button>
            <button type="button" className="btn-ghost flex-1" onClick={() => { setStep("form"); setOtp(""); }}>Edit details</button>
          </div>
        </form>
      </>
    );
  }

  return (
    <>
      <div id="recaptcha-container-signup" />
      <form onSubmit={requestOtp} className="mt-6 space-y-5">
        <div>
          <p className="label">I want to sign up as</p>
          <div className="grid grid-cols-3 gap-2">
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`card p-3 text-left transition ${role === r.id ? "ring-2 ring-brand-500 border-brand-300" : "hover:border-ink-200"}`}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <r.icon className="h-4 w-4" />
                </span>
                <p className="mt-2 font-semibold text-sm">{r.title}</p>
                <p className="text-[11px] text-ink-500">{r.subtitle}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Full name (as on Aadhaar)</label>
          <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>

        <div>
          <label className="label">Phone <span className="text-xs text-ink-500 font-normal">— we'll SMS your OTP here</span></label>
          <div className="flex">
            <span className="inline-flex items-center rounded-l-xl border border-r-0 border-ink-200 bg-ink-50 px-3 text-sm font-semibold text-ink-700">
              +91
            </span>
            <input
              className="input !rounded-l-none"
              required
              value={form.phone}
              onChange={(e) => {
                // digits only, drop a leading 0, cap at 10
                let d = e.target.value.replace(/\D/g, "");
                if (d.startsWith("0")) d = d.slice(1);
                setForm({ ...form, phone: d.slice(0, 10) });
              }}
              placeholder="98XXXXXXXX"
              inputMode="numeric"
              maxLength={10}
            />
          </div>
          {form.phone.length > 0 && !isValidIndianMobile(form.phone) && (
            <p className="text-xs text-rose-600 mt-1">Enter a 10-digit number starting 6–9 (no 0 or +91).</p>
          )}
        </div>

        <div>
          <label className="label">Email <span className="text-xs text-ink-500 font-normal">— for receipts & password reset (optional)</span></label>
          <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
        </div>

        <div>
          <label className="label">Create password</label>
          <input
            className="input"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
          <p className="text-xs text-ink-500 mt-1">You'll use your phone &amp; this password to sign in next time.</p>
          {form.password.length > 0 && form.password.length < 8 && (
            <p className="text-xs text-rose-600 mt-1">Password must be at least 8 characters.</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">PAN</label>
            <input
              className="input uppercase"
              required
              maxLength={10}
              value={form.pan}
              onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })}
              placeholder="ABCDE1234F"
            />
            {form.pan.length > 0 && !PAN_RE.test(form.pan) && (
              <p className="text-xs text-rose-600 mt-1">Format: 5 letters, 4 digits, 1 letter.</p>
            )}
          </div>
          <div>
            <label className="label">Aadhaar (12 digits)</label>
            <input className="input" required maxLength={12} inputMode="numeric" value={form.aadhaar} onChange={(e) => setForm({ ...form, aadhaar: e.target.value.replace(/\D/g, "") })} />
          </div>
        </div>

        {role === "broker" && (
          <div>
            <label className="label">UP-RERA / State RERA registration number</label>
            <input className="input" required value={form.rera} onChange={(e) => setForm({ ...form, rera: e.target.value })} placeholder="UPRERAAGT00XXXX" />
            <p className="text-xs text-ink-500 mt-1">We verify your RERA via Surepass within 1 business day.</p>
          </div>
        )}

        <div>
          <label className="label">
            Referral code <span className="text-ink-500 font-normal">(optional)</span>
          </label>
          <input
            className="input uppercase"
            value={form.referralCode}
            onChange={(e) => setForm({ ...form, referralCode: e.target.value.toUpperCase() })}
            placeholder="PRAP-XXXXXX"
          />
          <p className="text-xs text-ink-500 mt-1">
            Have a friend's code? You both earn {(5000).toLocaleString("en-IN")} PRAP Coins when you join.
          </p>
        </div>

        <label className="flex items-start gap-2 text-sm text-ink-700">
          <input type="checkbox" required className="mt-1 accent-brand-600" />
          <span>
            I agree to PRAP's <a href="/terms" className="underline">Terms</a> and{" "}
            <a href="/privacy" className="underline">Privacy Policy</a>, and consent to phone OTP & KYC verification.
          </span>
        </label>

        {error && <ErrorBox msg={error} />}

        <button className="btn-primary w-full" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send OTP <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>
    </>
  );
}

function errorMessage(err: unknown, fallback: string): string {
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
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
      <AlertTriangle className="h-4 w-4 mt-0.5 flex-none" /> <span>{msg}</span>
    </div>
  );
}
