"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Site-wide "rising text" reveal. On every page load (and client navigation),
 * all headings and body text inside <main> rise up + fade in — above-the-fold
 * elements animate immediately (the sunrise feel), the rest as they scroll into
 * view, with a gentle stagger and expo easing.
 *
 * Skips:
 *   • anything inside [data-noreveal]  (e.g. the parallax hero — own entrance)
 *   • anything inside [data-reveal]    (blocks handled by the <Reveal> wrapper)
 * Honours prefers-reduced-motion (leaves everything visible).
 */

const SELECTOR = "main :is(h1, h2, h3, h4, p, blockquote, .rise)";

export default function AutoReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const els = gsap.utils.toArray<HTMLElement>(SELECTOR).filter(
      (el) =>
        !el.closest("[data-noreveal]") &&
        !el.closest("[data-reveal]") &&
        !el.hasAttribute("data-revealed") &&
        (el.textContent ?? "").trim().length > 0,
    );
    if (!els.length) return;

    // Hide as early as possible (right after the effect commits) to minimise
    // any flash, then rise each element in as it enters the viewport.
    els.forEach((el) => el.setAttribute("data-revealed", ""));
    gsap.set(els, { y: 30, opacity: 0 });

    const batched = ScrollTrigger.batch(els, {
      start: "top 90%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.08,
          overwrite: true,
        }),
    });
    ScrollTrigger.refresh();

    return () => {
      batched.forEach((t) => t.kill());
    };
  }, [pathname]);

  return null;
}
