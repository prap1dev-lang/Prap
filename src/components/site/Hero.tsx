import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";

/**
 * Luxury-wellness hero. Animated mesh-gradient canvas, serif headline,
 * generous whitespace. Communicates PRAP's whole ideology in one section:
 * buy verified property, earn real rewards, protected by legal + AI.
 */
export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Animated mesh gradient backdrop */}
      <div className="absolute inset-0 -z-10 mesh-bg opacity-90" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ivory/30 via-ivory/60 to-ivory" />

      <div className="container min-h-[88vh] flex flex-col justify-center py-24 md:py-32">
        <Reveal className="max-w-3xl">
          <span className="eyebrow">Property · Referral · Award · Program </span>

          <h1 className="h1 mt-7">
            Own a home that's been{" "}
            <span className="italic text-gradient">verified before</span> you invest.
          </h1>

          <p className="mt-7 max-w-xl text-lg md:text-xl text-ink-600 leading-relaxed font-light">
            PRAP pairs RERA-verified projects with legal due-diligence and real cash
            rewards — so buying property feels calm, transparent and entirely yours.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/auth/signup" className="btn-primary">
              Begin your journey <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="/buyer-protection" className="btn-link text-ink-700">
              Explore Buyer Protection
            </Link>
          </div>
        </Reveal>

        {/* Single-section ideology: three calm pillars, lots of whitespace */}
        <Reveal delay={150} className="mt-20 grid gap-px sm:grid-cols-3 rounded-3xl overflow-hidden bg-ink-900/5">
          {PILLARS.map((p) => (
            <div key={p.title} className="bg-ivory/70 backdrop-blur-sm p-7">
              <p.icon className="h-6 w-6 text-brand-600" strokeWidth={1.4} />
              <p className="mt-4 font-serif text-lg text-ink-900">{p.title}</p>
              <p className="mt-1 text-sm text-ink-500 leading-relaxed">{p.text}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* Minimal, custom line icons (thin stroke, organic) ------------------------ */
function IconShield(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth ?? 1.5} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
function IconLeaf(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth ?? 1.5} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M5 19c0-7 5-12 14-13-1 9-6 14-13 14" />
      <path d="M5 19c2-4 5-7 9-9" />
    </svg>
  );
}
function IconSpark(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth ?? 1.5} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="M12 8a4 4 0 004 4 4 4 0 00-4 4 4 4 0 00-4-4 4 4 0 004-4z" />
    </svg>
  );
}

const PILLARS = [
  { icon: IconShield, title: "Legally verified", text: "Every listing reviewed by Legalist across title, RERA & compliance." },
  { icon: IconLeaf, title: "Calmly transparent", text: "Hidden charges, delays and risk surfaced before you commit." },
  { icon: IconSpark, title: "Genuinely rewarding", text: "Earn PRAP Coins on visits, milestones & referrals — redeemable to bank." },
];
