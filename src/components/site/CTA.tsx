import Link from "next/link";
import { ArrowRight, Coins } from "lucide-react";

export default function CTA() {
  return (
    <section className="section bg-gradient-to-br from-brand-600 to-brand-700 text-white">
      <div className="container grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-bold uppercase tracking-wider">
            <Coins className="h-3.5 w-3.5" /> Start earning today
          </span>
          <h2 className="mt-5 text-3xl md:text-5xl font-extrabold leading-tight">
            Get 25,000 PRAP Coins on signup — instantly.
          </h2>
          <p className="mt-4 text-white/85 text-lg max-w-xl">
            No paperwork to start. Just verify your phone, complete KYC and we'll credit
            your wallet right away.
          </p>
        </div>
        <div className="lg:col-span-4 lg:justify-self-end flex flex-wrap gap-3">
          <Link href="/auth/signup" className="btn bg-white text-brand-700 hover:bg-ink-50">
            Create free account <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/projects" className="btn border border-white/40 text-white hover:bg-white/10">
            Browse Projects
          </Link>
        </div>
      </div>
    </section>
  );
}
