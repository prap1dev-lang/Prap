import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <aside className="hidden lg:flex flex-col justify-between bg-ink-950 text-white p-10 relative overflow-hidden">
        <div className="absolute inset-0 mesh-bg opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-br from-ink-950/70 to-brand-900/60" />
        <Link href="/" className="relative z-10 font-serif text-xl tracking-tight">
          PRAP<span className="text-brand-400">.</span>
        </Link>
        <div className="relative z-10 max-w-md">
          <h2 className="font-serif text-4xl font-light leading-[1.1]">
            Property, <span className="italic">verified</span> before you invest.
          </h2>
          <p className="mt-5 text-ivory/80 font-light leading-relaxed">
            RERA-verified inventory, legal due-diligence and real cash rewards —
            buying a home, made calm.
          </p>
          <ul className="mt-8 space-y-3 text-ivory/75 text-sm editorial-list">
            <li>100% RERA-verified inventory</li>
            <li>Aadhaar lock-in for brokers</li>
            <li>Redeem PRAP Coins to bank or UPI</li>
          </ul>
        </div>
        <p className="relative z-10 text-xs text-ink-300">© {new Date().getFullYear()} PRAP Technologies Pvt. Ltd.</p>
      </aside>
      <main className="relative grid place-items-center p-6 md:p-10 bg-ivory overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-grid-fade opacity-60 lg:hidden" />
        <div className="w-full max-w-md glass !bg-white/70 p-7 md:p-9">{children}</div>
      </main>
    </div>
  );
}
