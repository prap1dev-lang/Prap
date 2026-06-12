import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";

export default function CTA() {
  return (
    <section className="section relative overflow-hidden bg-brand-700 text-ivory">
      <div className="absolute inset-0 mesh-bg opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-br from-brand-800/40 to-transparent" />
      <Reveal className="container relative grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-8">
          <span className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-ivory/70">
            Begin with PRAP
          </span>
          <h2 className="mt-5 font-serif text-4xl md:text-6xl font-light leading-[1.05]">
            Buy property with proof.<br />Verified before you invest.
          </h2>
          <p className="mt-6 text-ivory/80 text-lg max-w-xl font-light">
            Verify your phone, complete KYC, and 25,000 PRAP Coins land in your
            wallet — no paperwork to begin.
          </p>
        </div>
        <div className="lg:col-span-4 lg:justify-self-end flex flex-wrap gap-4">
          <Link href="/auth/signup" className="btn bg-ivory text-brand-700 hover:bg-white hover:-translate-y-0.5">
            Create account <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/projects" className="btn-link text-ivory/90">
            Browse projects
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
