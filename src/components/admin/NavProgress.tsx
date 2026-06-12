"use client";
import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Thin top progress bar that flashes on admin route changes, giving instant
 * feedback when a card/link is clicked. It animates up while navigating and
 * completes once the new route's pathname/search settles.
 */
export default function NavProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const firstRender = useRef(true);

  useEffect(() => {
    // Skip the initial mount so the bar doesn't flash on first load.
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    // New route committed → run a quick fill-and-fade.
    timers.current.forEach(clearTimeout);
    setVisible(true);
    setWidth(80);
    timers.current = [
      setTimeout(() => setWidth(100), 120),
      setTimeout(() => setVisible(false), 360),
      setTimeout(() => setWidth(0), 520),
    ];
    return () => timers.current.forEach(clearTimeout);
  }, [pathname, search]);

  // Kick the bar the moment any link inside admin is clicked (pre-commit).
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const a = (e.target as HTMLElement)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (href.startsWith("/admin") && !a.target) {
        setVisible(true);
        setWidth(40);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div className="pointer-events-none fixed top-0 left-0 right-0 z-[100] h-0.5">
      <div
        className="h-full bg-brand-600 transition-all duration-200 ease-out"
        style={{ width: `${width}%`, opacity: visible ? 1 : 0 }}
      />
    </div>
  );
}
