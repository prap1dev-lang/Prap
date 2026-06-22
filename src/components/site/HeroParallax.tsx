"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Layered parallax hero (findrealestate.com-style) for PRAP.
 *
 * Stacked layers — sky → back clouds → architectural sketch building → front
 * clouds → smoke → big "PRAP / Real Estate" wordmark → copy. Each layer moves
 * at a different speed on scroll (GSAP ScrollTrigger + scrub), while clouds and
 * smoke drift on their own infinite GSAP loops so the scene feels alive even
 * when idle. A light pointer parallax adds depth. Honours reduced-motion.
 */

/** One soft, blurred cloud puff. */
function Puff({ className = "", style }: { className?: string; style: React.CSSProperties }) {
  return (
    <span
      className={`bp-puff absolute rounded-full ${className}`}
      style={{
        background: "radial-gradient(ellipse at center, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.7) 38%, rgba(255,255,255,0) 72%)",
        filter: "blur(6px)",
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

export default function HeroParallax() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // ── Idle drift — runs forever, independent of scroll ──
      gsap.to(".hero-clouds-front", { xPercent: 5, duration: 19, ease: "sine.inOut", repeat: -1, yoyo: true });
      gsap.to(".hero-clouds-back", { xPercent: -7, duration: 26, ease: "sine.inOut", repeat: -1, yoyo: true });
      gsap.to(".hero-smoke", { yPercent: -14, opacity: 0.55, duration: 9, ease: "sine.inOut", repeat: -1, yoyo: true });
      gsap.to(".bp-puff", {
        y: "+=10", duration: 7, ease: "sine.inOut", repeat: -1, yoyo: true,
        stagger: { each: 0.6, from: "random" },
      });

      // ── Entrance ──
      gsap.from(".hero-copy > *", { y: 26, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.12, delay: 0.1 });
      gsap.from(".hero-wordmark", { scale: 0.92, opacity: 0, duration: 1.4, ease: "expo.out", delay: 0.25 });

      // ── Scroll parallax (scrubbed) ──
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.6 },
      });
      tl.to(".hero-sky", { yPercent: 14, ease: "none" }, 0)
        .to(".hero-clouds-back", { yPercent: -26, ease: "none" }, 0)
        .to(".hero-clouds-front", { yPercent: 42, ease: "none" }, 0)
        .to(".hero-smoke", { yPercent: 60, ease: "none" }, 0)
        .to(".hero-wordmark", { yPercent: -34, scale: 1.14, ease: "none" }, 0)
        .to(".hero-copy", { yPercent: -90, opacity: 0, ease: "none" }, 0);

      // ── Light pointer parallax ──
      const el = root.current!;
      const front = el.querySelector<HTMLElement>(".hero-clouds-front");
      const word = el.querySelector<HTMLElement>(".hero-wordmark");
      const xF = front ? gsap.quickTo(front, "x", { duration: 0.9, ease: "power3.out" }) : null;
      const xW = word ? gsap.quickTo(word, "x", { duration: 0.7, ease: "power3.out" }) : null;
      const onMove = (e: PointerEvent) => {
        const dx = (e.clientX / window.innerWidth - 0.5) * 2; // -1..1
        xF?.(dx * 26);
        xW?.(dx * -10);
      };
      window.addEventListener("pointermove", onMove);
      return () => window.removeEventListener("pointermove", onMove);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      data-noreveal
      className="relative isolate h-[100svh] min-h-[640px] overflow-hidden"
      aria-label="PRAP — find what moves you"
    >
      {/* ── Sky ── */}
      <div
        className="hero-sky absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(180deg, #9cc3e6 0%, #bcd6ec 34%, #e7e2dd 62%, #f6d9c4 82%, #f7e3d2 100%)",
        }}
        aria-hidden="true"
      />

      {/* ── Back clouds (behind building) ── */}
      <div className="hero-clouds-back pointer-events-none absolute inset-0 z-[1]" aria-hidden="true">
        <Puff style={{ top: "12%", left: "8%", width: 320, height: 120, opacity: 0.7 }} />
        <Puff style={{ top: "22%", right: "10%", width: 380, height: 130, opacity: 0.6 }} />
        <Puff style={{ top: "6%", left: "44%", width: 280, height: 100, opacity: 0.5 }} />
      </div>

      {/* ── Big wordmark (outline) ── */}
      <div className="hero-wordmark pointer-events-none absolute inset-0 z-[3] flex flex-col items-center justify-center" aria-hidden="true">
        <span
          className="font-display font-extrabold leading-none tracking-tight"
          style={{
            fontSize: "clamp(5rem, 22vw, 19rem)",
            color: "transparent",
            WebkitTextStroke: "2px rgba(26,31,24,0.55)",
          }}
        >
          PRAP
        </span>
        <span
          className="font-display font-semibold uppercase"
          style={{
            fontSize: "clamp(1.1rem, 4.6vw, 3.6rem)",
            letterSpacing: "0.04em",
            color: "transparent",
            WebkitTextStroke: "1px rgba(26,31,24,0.4)",
            marginTop: "-0.3em",
          }}
        >
          Real Estate
        </span>
      </div>

      {/* ── Front clouds (covering building base) ── */}
      <div className="hero-clouds-front pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-[55%]" aria-hidden="true">
        <Puff style={{ bottom: "8%", left: "-4%", width: 460, height: 180, opacity: 0.95 }} />
        <Puff style={{ bottom: "0%", left: "26%", width: 560, height: 220, opacity: 0.98 }} />
        <Puff style={{ bottom: "12%", right: "18%", width: 420, height: 170, opacity: 0.9 }} />
        <Puff style={{ bottom: "-2%", right: "-6%", width: 520, height: 200, opacity: 0.96 }} />
      </div>

      {/* ── Smoke (rising, near the floor) ── */}
      <div className="hero-smoke pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-[30%]" aria-hidden="true">
        <Puff className="!blur-[14px]" style={{ bottom: "-6%", left: "12%", width: 360, height: 150, opacity: 0.5 }} />
        <Puff className="!blur-[14px]" style={{ bottom: "-10%", left: "50%", width: 420, height: 170, opacity: 0.45 }} />
      </div>

      {/* Bottom fade into the page */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-40 bg-gradient-to-b from-transparent to-ivory" aria-hidden="true" />

      {/* ── Foreground copy ── */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="hero-copy max-w-3xl">
          <span className="inline-block text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-ink-700/80">
            PRAP · Property Referral Award Program
          </span>
          {/* <h1 className="font-display font-extrabold tracking-tight text-ink-950 mt-5 text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95]">
            Find What Moves You
          </h1> */}
          <p className="mx-auto mt-10 max-w-xl text-lg sm:text-xl font-semibold text-ink-900">
            Built for a smarter way to discover, verify, and invest.
          </p>
          <p className="mt-2 text-lg sm:text-2xl text-ink-700">
            <span className="text-ink-500">A smarter platform&nbsp;</span>
            <Typewriter
              words={["for brokers", "for builders", "for creators", "for investors"]}
              className="font-semibold text-brand-700"
            />
          </p>
          <div className="mt-9 flex items-center justify-center gap-4">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full bg-ink-950 px-7 py-3.5 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-ink-900"
            >
              Find Properties <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Rotating typewriter — types each word, pauses, deletes, moves to the next,
 * looping forever, with a blinking caret. Falls back to static text under
 * prefers-reduced-motion.
 */
function Typewriter({ words, className = "" }: { words: string[]; className?: string }) {
  const [text, setText] = useState("");
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">("typing");
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    const word = words[idx % words.length];
    if (reduce.current) {
      if (text !== word) setText(word);
      return;
    }
    let t: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      t = text.length < word.length
        ? setTimeout(() => setText(word.slice(0, text.length + 1)), 80)
        : setTimeout(() => setPhase("pausing"), 1500);
    } else if (phase === "pausing") {
      t = setTimeout(() => setPhase("deleting"), 500);
    } else {
      if (text.length > 0) {
        t = setTimeout(() => setText(word.slice(0, text.length - 1)), 40);
      } else {
        setIdx((i) => (i + 1) % words.length);
        setPhase("typing");
        return;
      }
    }
    return () => clearTimeout(t);
  }, [text, phase, idx, words]);

  return (
    <span className={className}>
      {text}
      <span
        className="ml-0.5 inline-block w-[2px] translate-y-[2px] animate-pulse bg-current"
        style={{ height: "1em" }}
        aria-hidden="true"
      />
    </span>
  );
}
