"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Building2, UserRound, ArrowRight, Loader2 } from "lucide-react";

type Role = "broker" | "corporate" | "referrer";

const roles: { id: Role; title: string; icon: React.ComponentType<any>; subtitle: string }[] = [
  { id: "broker", title: "Broker", icon: Briefcase, subtitle: "Channel Partner / Agent" },
  { id: "corporate", title: "Corporate", icon: Building2, subtitle: "HR / Employer" },
  { id: "referrer", title: "Referrer", icon: UserRound, subtitle: "Buyer / Investor" },
];

export default function SignupForm({ initialRole }: { initialRole?: Role }) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(initialRole && (["broker", "corporate", "referrer"] as Role[]).includes(initialRole) ? initialRole : "referrer");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [submitting, setSubmitting] = useState(false);
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
    setSubmitting(true);
    try {
      // POST /api/auth/otp { phone, role }
      await new Promise((r) => setTimeout(r, 700));
      setStep("otp");
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      // POST /api/auth/verify { phone, otp, role, profile }
      await new Promise((r) => setTimeout(r, 600));
      router.push(`/dashboard?role=${role}&welcome=1`);
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "otp") {
    return (
      <form onSubmit={verifyOtp} className="mt-6 space-y-4">
        <div>
          <label className="label">Enter the 6-digit OTP we sent to {form.phone || "your phone"}</label>
          <input
            className="input tracking-[0.5em] text-center font-bold text-lg"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="• • • • • •"
            inputMode="numeric"
            required
          />
        </div>
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Phone (+91)</label>
          <input className="input" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="98XXXXXXXX" />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
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
          <p className="text-xs text-ink-500 mt-1">We verify your RERA on the official portal within 1 business day.</p>
        </div>
      )}

      {role === "referrer" && (
        <div>
          <label className="label">Corporate referral code <span className="text-ink-500 font-normal">(optional)</span></label>
          <input className="input" value={form.referralCode} onChange={(e) => setForm({ ...form, referralCode: e.target.value.toUpperCase() })} placeholder="PRAP-XXXXXX" />
        </div>
      )}

      <label className="flex items-start gap-2 text-sm text-ink-700">
        <input type="checkbox" required className="mt-1 accent-brand-600" />
        <span>
          I agree to PRAP's <a href="/terms" className="underline">Terms</a> and{" "}
          <a href="/privacy" className="underline">Privacy Policy</a>, and consent to
          phone OTP & KYC verification.
        </span>
      </label>

      <button className="btn-primary w-full" disabled={submitting}>
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send OTP & Continue <ArrowRight className="h-4 w-4" /></>}
      </button>
    </form>
  );
}
