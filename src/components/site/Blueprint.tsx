/**
 * Blueprint design system — architectural line-art used across the site.
 *
 * Everything here is pure SVG and draws with `currentColor`, so colour is
 * controlled by a Tailwind text-* class on the element (e.g. `text-ink-900/10`
 * for a faint ink line, `text-ivory/20` on dark sections).
 *
 *   <BlueprintBackground />            site-wide faint grid + corner building
 *   <BlueprintIsoBuilding />           signature 3D wireframe building
 *   <BlueprintBuilding />              flat elevation skyline
 *   <BlueprintCompass />               north-point compass rose
 *   <BlueprintCorner />                technical-drawing crop bracket
 *   <BlueprintDimension label="…" />   dimension / measurement line
 *   <BlueprintGridPatch />             small graph-paper square
 *   <BlueprintDivider />               horizontal rule with centre diamond
 */

type SVGProps = { className?: string; strokeWidth?: number };

/* ────────────────────────────────────────────────────────────────────────
   Re-usable grid <defs> — referenced by id so a page only ships it once.
──────────────────────────────────────────────────────────────────────── */
function GridDefs({ id }: { id: string }) {
  return (
    <defs>
      <pattern id={`${id}-sm`} width="28" height="28" patternUnits="userSpaceOnUse">
        <path d="M28 0H0V28" fill="none" stroke="currentColor" strokeWidth="1" />
      </pattern>
      <pattern id={`${id}-lg`} width="140" height="140" patternUnits="userSpaceOnUse">
        <rect width="140" height="140" fill={`url(#${id}-sm)`} />
        <path d="M140 0H0V140" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </pattern>
    </defs>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Site-wide background — fixed, faint, behind everything. Drop once in the
   root layout. Renders a graph-paper grid plus a faint wireframe building
   anchored bottom-right.
──────────────────────────────────────────────────────────────────────── */
export function BlueprintBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full text-brand-900/[0.04]" xmlns="http://www.w3.org/2000/svg">
        <GridDefs id="bp-bg" />
        <rect width="100%" height="100%" fill="url(#bp-bg-lg)" />
      </svg>
      <BlueprintIsoBuilding className="absolute -bottom-10 -right-10 w-[420px] max-w-[55vw] text-brand-900/[0.05]" />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Signature 3D wireframe building (isometric, with construction guide lines).
   Geometry is computed so the perspective stays consistent.
──────────────────────────────────────────────────────────────────────── */
export function BlueprintIsoBuilding({ className, strokeWidth = 1.3 }: SVGProps) {
  // Ground rhombus (diamond footprint) + height.
  const F: P = [210, 300], Rr: P = [330, 245], Bk: P = [210, 190], Ll: P = [90, 245];
  const H = 150;
  const up = (p: P, h = H): P => [p[0], p[1] - h];
  const [Ft, Rt, Bt, Lt] = [up(F), up(Rr), up(Bk), up(Ll)];

  // Setback top block: footprint inset toward the roof centroid, raised again.
  const C: P = [210, (Ft[1] + Bt[1]) / 2];
  const inset = (p: P, k = 0.3): P => [p[0] + k * (C[0] - p[0]), p[1] + k * (C[1] - p[1])];
  const [F2, R2, B2, L2] = [inset(Ft), inset(Rt), inset(Bt), inset(Lt)];
  const h2 = 70;
  const [F2t, R2t, B2t, L2t] = [up(F2, h2), up(R2, h2), up(B2, h2), up(L2, h2)];

  // Floor lines + vertical mullions on the two visible faces.
  const floors: Line[] = [];
  for (let i = 1; i <= 5; i++) {
    const t = (i / 6) * H;
    floors.push([F[0], F[1] - t, Rr[0], Rr[1] - t]);   // right face
    floors.push([F[0], F[1] - t, Ll[0], Ll[1] - t]);   // left face
  }
  const mullions: Line[] = [];
  for (const s of [1 / 3, 2 / 3]) {
    const xR = F[0] + (Rr[0] - F[0]) * s, yR = F[1] + (Rr[1] - F[1]) * s;
    mullions.push([xR, yR, xR, yR - H]);
    const xL = F[0] + (Ll[0] - F[0]) * s, yL = F[1] + (Ll[1] - F[1]) * s;
    mullions.push([xL, yL, xL, yL - H]);
  }

  return (
    <svg
      className={className}
      viewBox="0 0 400 380"
      fill="none"
      preserveAspectRatio="xMidYMax meet"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        {/* construction guide lines — extend ground edges + verticals, dashed */}
        <g strokeDasharray="2 6" opacity="0.7">
          <path d={`M${F[0]} ${F[1]} L${F[0]} 372`} />
          <path d={`M${Rr[0]} ${Rr[1]} L380 ${Rr[1] + 26}`} />
          <path d={`M${Ll[0]} ${Ll[1]} L20 ${Ll[1] + 26}`} />
          <path d={`M${Bt[0]} ${Bt[1]} L${Bt[0]} 12`} />
          <path d={`M${Rt[0]} ${Rt[1]} L388 ${Rt[1] - 14}`} />
          <path d={`M${Lt[0]} ${Lt[1]} L12 ${Lt[1] - 14}`} />
        </g>

        {/* hidden back edges — dashed */}
        <g strokeDasharray="3 4" opacity="0.55">
          <path d={poly([Rr, Bk, Ll])} />
          <path d={`M${Bk[0]} ${Bk[1]} L${Bt[0]} ${Bt[1]}`} />
          <path d={poly([Rt, Bt, Lt])} />
        </g>

        {/* ground rhombus (front edges) */}
        <path d={`M${Ll[0]} ${Ll[1]} L${F[0]} ${F[1]} L${Rr[0]} ${Rr[1]}`} />
        {/* main verticals */}
        <path d={`M${F[0]} ${F[1]} L${Ft[0]} ${Ft[1]}`} />
        <path d={`M${Rr[0]} ${Rr[1]} L${Rt[0]} ${Rt[1]}`} />
        <path d={`M${Ll[0]} ${Ll[1]} L${Lt[0]} ${Lt[1]}`} />
        {/* roof of lower block */}
        <path d={`M${Lt[0]} ${Lt[1]} L${Ft[0]} ${Ft[1]} L${Rt[0]} ${Rt[1]}`} />

        {/* floors + mullions */}
        <g opacity="0.75">
          {floors.map((l, i) => <line key={`f${i}`} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} />)}
          {mullions.map((l, i) => <line key={`m${i}`} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} />)}
        </g>

        {/* setback top block */}
        <path d={`M${L2[0]} ${L2[1]} L${F2[0]} ${F2[1]} L${R2[0]} ${R2[1]}`} />
        <path d={`M${F2[0]} ${F2[1]} L${F2t[0]} ${F2t[1]}`} />
        <path d={`M${R2[0]} ${R2[1]} L${R2t[0]} ${R2t[1]}`} />
        <path d={`M${L2[0]} ${L2[1]} L${L2t[0]} ${L2t[1]}`} />
        <path d={poly([L2t, F2t, R2t, B2t], true)} />
        <path d={`M${B2[0]} ${B2[1]} L${B2t[0]} ${B2t[1]}`} strokeDasharray="3 4" opacity="0.55" />
      </g>
    </svg>
  );
}

type P = [number, number];
type Line = [number, number, number, number];
function poly(points: P[], close = false): string {
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]} ${p[1]}`).join(" ") + (close ? " Z" : "");
}

/* ────────────────────────────────────────────────────────────────────────
   Flat elevation skyline — thin line-art, anchored to its baseline.
──────────────────────────────────────────────────────────────────────── */
export function BlueprintBuilding({ className, strokeWidth = 1.4 }: SVGProps) {
  return (
    <svg className={className} viewBox="0 0 800 420" fill="none" preserveAspectRatio="xMaxYMax meet" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round">
        <path d="M0 410 H800" strokeWidth={strokeWidth + 0.2} />
        <path d="M70 410 V120 L150 90 V410" />
        <path d="M70 150 H150 M70 185 H150 M70 220 H150 M70 255 H150 M70 290 H150 M70 325 H150 M70 360 H150" />
        <path d="M97 120 V410 M124 110 V410" />
        <path d="M170 410 V200 H300 V160 H340 V410" />
        <path d="M170 235 H340 M170 270 H340 M170 305 H340 M170 340 H340 M170 375 H340" />
        <path d="M205 200 V410 M240 200 V410 M275 200 V410 M305 160 V410" />
        <path d="M380 410 V70 L470 50 V410" />
        <path d="M380 100 H470 M380 135 H470 M380 170 H470 M380 205 H470 M380 240 H470 M380 275 H470 M380 310 H470 M380 345 H470 M380 380 H470" />
        <path d="M410 70 V410 M440 64 V410" />
        <path d="M490 410 V300 H600 V410" />
        <path d="M490 335 H600 M490 370 H600 M525 300 V410 M560 300 V410" />
        <path d="M640 410 V140 H700 V410" />
        <path d="M640 180 H700 M640 220 H700 M640 260 H700 M640 300 H700 M640 340 H700 M640 380 H700 M670 140 V410" />
        <path d="M712 130 V410 M690 130 H792 M712 130 L700 150 M712 130 L724 150" />
      </g>
    </svg>
  );
}

/* ──────────────────────── Small artifacts ──────────────────────── */

/** North-point compass rose. */
export function BlueprintCompass({ className, strokeWidth = 1.3 }: SVGProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round">
        <circle cx="32" cy="32" r="26" />
        <circle cx="32" cy="32" r="20" strokeDasharray="2 4" opacity="0.6" />
        <path d="M32 6 L38 32 L32 26 L26 32 Z" fill="currentColor" fillOpacity="0.12" />
        <path d="M32 58 L26 32 M32 58 L38 32" opacity="0.7" />
        <path d="M6 32 H14 M50 32 H58 M32 6 V14" opacity="0.7" />
      </g>
    </svg>
  );
}

/** Technical-drawing crop bracket (one corner). Rotate via className. */
export function BlueprintCorner({ className, strokeWidth = 1.3 }: SVGProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round">
        <path d="M2 14 V2 H14" />
        <path d="M2 22 V2 H22" opacity="0.4" strokeDasharray="2 3" />
      </g>
    </svg>
  );
}

/** Dimension / measurement line with end ticks and an optional label. */
export function BlueprintDimension({ label, className, strokeWidth = 1.3 }: SVGProps & { label?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`} aria-hidden="true">
      <svg viewBox="0 0 120 16" className="h-3.5 w-24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round">
          <path d="M2 8 H118" />
          <path d="M2 2 V14 M118 2 V14" />
          <path d="M8 8 L4 5 M8 8 L4 11 M112 8 L116 5 M112 8 L116 11" opacity="0.7" />
        </g>
      </svg>
      {label && <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em]">{label}</span>}
    </span>
  );
}

/** Small graph-paper square with a corner mark. */
export function BlueprintGridPatch({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <GridDefs id="bp-patch" />
      <rect width="96" height="96" fill="url(#bp-patch-sm)" stroke="currentColor" strokeOpacity="0.35" />
      <circle cx="0" cy="0" r="3" fill="currentColor" />
      <circle cx="96" cy="96" r="3" fill="currentColor" />
    </svg>
  );
}

/** Horizontal blueprint rule with a centre diamond — section divider. */
export function BlueprintDivider({ className, strokeWidth = 1.2 }: SVGProps) {
  return (
    <svg className={className} viewBox="0 0 400 16" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round">
        <path d="M0 8 H184 M216 8 H400" />
        <path d="M200 2 L208 8 L200 14 L192 8 Z" fill="currentColor" fillOpacity="0.15" />
      </g>
    </svg>
  );
}
