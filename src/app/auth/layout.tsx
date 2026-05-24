import Link from "next/link";
import { Coins } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <aside className="hidden lg:flex flex-col justify-between bg-ink-950 text-white p-10 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-gold-500/20 blur-3xl" />
        <Link href="/" className="flex items-center gap-2 font-extrabold relative z-10">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600">
            <Coins className="h-5 w-5" />
          </span>
          <span className="text-lg tracking-tight">PRAP<span className="text-brand-400">.</span></span>
        </Link>
        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-extrabold leading-tight">
            Buy property. Earn real money. <span className="text-brand-400">Instantly.</span>
          </h2>
          <p className="mt-4 text-ink-200">
            Get 25,000 PRAP Coins (= ₹25,000) on signup. Earn at every site visit, every
            milestone, every referral.
          </p>
          <ul className="mt-6 space-y-2 text-ink-200 text-sm">
            <li>• 100% RERA-verified inventory</li>
            <li>• Aadhaar lock-in for brokers</li>
            <li>• Bank/UPI redemption capped at ₹1,00,000 per cycle</li>
          </ul>
        </div>
        <p className="relative z-10 text-xs text-ink-300">© {new Date().getFullYear()} PRAP Technologies Pvt. Ltd.</p>
      </aside>
      <main className="grid place-items-center p-6 md:p-10 bg-white">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
