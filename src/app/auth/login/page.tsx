"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setStep("otp");
    setLoading(false);
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    router.push("/dashboard");
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-ink-700">Sign in to your PRAP account.</p>

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
              placeholder="+91 98XXXXXXXX"
            />
          </div>
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send OTP <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="mt-6 space-y-4">
          <div>
            <label className="label">Enter OTP sent to {phone}</label>
            <input
              className="input tracking-[0.5em] text-center font-bold text-lg"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="• • • • • •"
              inputMode="numeric"
              required
            />
          </div>
          <button className="btn-primary w-full" disabled={loading || otp.length !== 6}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
          </button>
          <button type="button" className="btn-ghost w-full" onClick={() => setStep("phone")}>
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
