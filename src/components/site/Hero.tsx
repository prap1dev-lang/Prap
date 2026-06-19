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
    <section className="relative overflow-hidden bg-ivory">
      {/* Soft colour wash */}
      <div className="absolute inset-0 -z-30 mesh-bg opacity-40" />
      {/* 2D blueprint grid + black & white architectural sketch */}
      <HeroBackdrop />
      {/* Fade so headline text stays legible over the sketch */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ivory via-ivory/80 to-ivory/30" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ivory/40 via-transparent to-ivory" />

      <div className="container min-h-[88vh] flex flex-col justify-center py-24 md:py-32">
        <Reveal className="max-w-3xl">
          <span className="eyebrow">Property · Referral · Award · Program </span>

          <h1 className="h1 mt-7 text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
            Own a home that's been{" "}
            <span className="italic text-gradient">verified before</span> you invest.
          </h1>

          <p className="mt-7 max-w-xl text-xl md:text-2xl text-ink-600 leading-relaxed font-light">
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

/* ── Blueprint backdrop: 2D grid + black & white architectural line sketch ── */
function HeroBackdrop() {
  return (
    <div className="absolute inset-0 -z-20 pointer-events-none" aria-hidden="true">
      {/* graph-paper grid */}
      <svg className="absolute inset-0 h-full w-full text-ink-900/[0.05]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hero-grid-sm" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0H0V28" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
          <pattern id="hero-grid-lg" width="140" height="140" patternUnits="userSpaceOnUse">
            <rect width="140" height="140" fill="url(#hero-grid-sm)" />
            <path d="M140 0H0V140" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid-lg)" />
      </svg>

      {/* architectural skyline — thin ink line-art, anchored bottom */}
      <svg
        className="absolute bottom-0 right-0 w-full md:w-[64%] h-[58%] text-ink-900/[0.16]"
        viewBox="0 0 800 420"
        fill="none"
        preserveAspectRatio="xMaxYMax meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round">
          {/* ground line */}
          <path d="M0 410 H800" strokeWidth="1.6" />

          {/* tall tower (left) with floor + window mullions */}
          <path d="M70 410 V120 L150 90 V410" />
          <path d="M70 150 H150 M70 185 H150 M70 220 H150 M70 255 H150 M70 290 H150 M70 325 H150 M70 360 H150" />
          <path d="M97 120 V410 M124 110 V410" />

          {/* mid building with setback roof */}
          <path d="M170 410 V200 H300 V160 H340 V410" />
          <path d="M170 235 H340 M170 270 H340 M170 305 H340 M170 340 H340 M170 375 H340" />
          <path d="M205 200 V410 M240 200 V410 M275 200 V410 M305 160 V410" />

          {/* glass high-rise (right of centre) */}
          <path d="M380 410 V70 L470 50 V410" />
          <path d="M380 100 H470 M380 135 H470 M380 170 H470 M380 205 H470 M380 240 H470 M380 275 H470 M380 310 H470 M380 345 H470 M380 380 H470" />
          <path d="M410 70 V410 M440 64 V410" />

          {/* low podium block */}
          <path d="M490 410 V300 H600 V410" />
          <path d="M490 335 H600 M490 370 H600 M525 300 V410 M560 300 V410" />

          {/* slender tower with crane (far right) */}
          <path d="M640 410 V140 H700 V410" />
          <path d="M640 180 H700 M640 220 H700 M640 260 H700 M640 300 H700 M640 340 H700 M640 380 H700 M670 140 V410" />
          {/* construction crane */}
          <path d="M712 130 V410 M690 130 H792 M712 130 L700 150 M712 130 L724 150" />
          <path d="M788 130 V160" />
          <path d="M735 130 V112" />
        </g>
        {/* one accent building outline in brand colour */}
        <path
          d="M380 410 V70 L470 50 V410"
          stroke="rgb(27 67 50 / 0.22)"
          strokeWidth="1.6"
          fill="rgb(27 67 50 / 0.03)"
        />
      </svg>
    </div>
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
