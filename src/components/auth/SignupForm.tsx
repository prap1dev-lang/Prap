"use client";
import { useState } from "react";
import { Briefcase, Building2, UserRound, ArrowRight, Loader2, AlertTriangle, Phone } from "lucide-react";

type Role = "broker" | "corporate" | "referrer";

const roles: { id: Role; title: string; icon: React.ComponentType<any>; subtitle: string }[] = [
  { id: "broker", title: "Broker", icon: Briefcase, subtitle: "Channel Partner / Agent" },
  { id: "corporate", title: "Corporate", icon: Building2, subtitle: "HR / Employer" },
  { id: "referrer", title: "Referrer", icon: UserRound, subtitle: "Buyer / Investor" },
];

function normalizePhone(p: string) {
  const trimmed = p.replace(/\s|-/g, "");
  if (trimmed.startsWith("+")) return trimmed;
  if (trimmed.length === 10) return `+91${trimmed}`;
  return `+${trimmed.replace(/^\+/, "")}`;
}

export default function SignupForm({ initialRole }: { initialRole?: Role }) {
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
    referralCode: "",
  });
  const [otp, setOtp] = useState("");

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const phone = normalizePhone(form.phone);
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) throw new Error(body.error || "Could not send OTP");
      setStep("otp");
    } catch (e: any) {
      setError(e?.message || "Failed to send OTP");
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const phone = normalizePhone(form.phone);
      // Stash profile so /auth/complete can finalize the public.users row.
      sessionStorage.setItem(
        "prap-signup-profile",
        JSON.stringify({
          role,
          profile: { ...form, phone },
        }),
      );

      const origin = window.location.origin;
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          otp,
          mode: "signup",
          redirectTo: `${origin}/auth/complete`,
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok || !body.actionLink) {
        throw new Error(body.error || "OTP verification failed");
      }
      // Follow the magic link — Supabase sets the cookie, redirects to /auth/complete.
      window.location.href = body.actionLink;
    } catch (e: any) {
      setError(e?.message || "OTP verification failed");
      setSubmitting(false);
    }
  }

  if (step === "otp") {
    return (
      <form onSubmit={verifyOtp} className="mt-6 space-y-4">
        <div className="rounded-xl bg-brand-50 border border-brand-200 p-4 flex items-start gap-3 text-brand-900">
          <Phone className="h-5 w-5 mt-0.5 flex-none" />
          <div className="text-sm">
            <p className="font-semibold">Check your SMS</p>
            <p>
              We sent a 6-digit code to <strong>{normalizePhone(form.phone)}</strong>. Valid for 5 minutes.
            </p>
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
        <button type="button" className="btn-ghost w-full" onClick={() => setStep("form")}>
          Edit details
        </button>
      </form>
    );
  }

  return (
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
        <label className="label">
          Phone <span className="text-xs text-ink-500 font-normal">— we'll SMS your OTP here</span>
        </label>
        <input
          className="input"
          required
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="98XXXXXXXX"
          inputMode="tel"
        />
      </div>

      <div>
        <label className="label">
          Email <span className="text-xs text-ink-500 font-normal">— for receipts (optional)</span>
        </label>
        <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">PAN</label>
          <input className="input uppercase" required maxLength={10} value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })} placeholder="ABCDE1234F" />
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

      {role === "referrer" && (
        <div>
          <label className="label">Corporate referral code <span className="text-ink-500 font-normal">(optional)</span></label>
          <input
            className="input"
            value={form.referralCode}
            onChange={(e) => setForm({ ...form, referralCode: e.target.value.toUpperCase() })}
            placeholder="PRAP-XXXXXX"
          />
        </div>
      )}

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
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 flex items-start gap-2">
      <AlertTriangle className="h-4 w-4 mt-0.5 flex-none" /> <span>{msg}</span>
    </div>
  );
}
