import Link from "next/link";
import { ArrowRight, CheckCircle2, Coins, Shield, TrendingUp } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-grid-fade">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-white to-brand-50/40" />
      <div className="container pt-16 pb-20 md:pt-24 md:pb-32 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7">
          <span className="eyebrow">
            <Coins className="h-3.5 w-3.5" /> 25,000 PRAP Coins on signup · 1 Coin = ₹1
          </span>
          <h1 className="h1 mt-5">
            India's smartest way to <span className="text-brand-600">buy property</span> &
            <span className="text-brand-600"> earn rewards</span>.
          </h1>
          <p className="mt-5 text-lg md:text-xl text-ink-700 max-w-2xl leading-relaxed">
            Discover RERA-verified projects in Noida, Greater Noida & across India.
            Earn PRAP Coins on every site visit, milestone & referral. Redeem to bank
            or use as direct discount on your home.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/auth/signup" className="btn-primary">
              Claim 25,000 Coins <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/projects" className="btn-outline">Browse Projects</Link>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-7 gap-y-2 text-sm text-ink-700">
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> 100% RERA verified</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Direct from builder</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Zero brokerage</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Secure escrow payments</li>
          </ul>
        </div>

        <div className="lg:col-span-5">
          <div className="card p-6 md:p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Your wallet preview</p>
                <p className="mt-1 text-3xl font-extrabold text-ink-900">25,000 <span className="text-brand-600">Coins</span></p>
                <p className="text-sm text-ink-500">= ₹25,000 ready on signup</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-brand-600 text-white grid place-items-center shadow-card">
                <Coins className="h-7 w-7" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-ink-50 p-3">
                <p className="text-xs text-ink-500">Visit 1</p>
                <p className="font-bold text-ink-900">+10,000</p>
              </div>
              <div className="rounded-xl bg-ink-50 p-3">
                <p className="text-xs text-ink-500">Visit 2</p>
                <p className="font-bold text-ink-900">+10,000</p>
              </div>
              <div className="rounded-xl bg-ink-50 p-3">
                <p className="text-xs text-ink-500">Investment</p>
                <p className="font-bold text-ink-900">+75,000</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 text-sm">
              <div className="flex items-center gap-3">
                <span className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center">
                  <Shield className="h-5 w-5" />
                </span>
                <p className="text-ink-700">
                  <span className="font-semibold text-ink-900">Bank-grade security.</span>{" "}
                  KYC + Aadhaar-based booking lock-in.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-9 w-9 rounded-xl bg-gold-400/20 text-gold-600 grid place-items-center">
                  <TrendingUp className="h-5 w-5" />
                </span>
                <p className="text-ink-700">
                  <span className="font-semibold text-ink-900">Redeem to bank</span> — up to ₹1,00,000 per cycle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
