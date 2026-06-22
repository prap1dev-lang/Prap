/**
 * Lightweight shimmer skeleton for admin list pages. Renders a title bar plus a
 * card with placeholder rows so route transitions feel instant (used by each
 * admin route's loading.tsx).
 */
export default function TableSkeleton({
  title = "Loading…",
  rows = 8,
  cols = 5,
}: {
  title?: string;
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="animate-pulse">
      <div className="h-7 w-48 rounded-lg bg-ink-100" />
      <div className="mt-2 h-4 w-72 rounded bg-ink-100/70" />

      <div className="card mt-6 overflow-hidden">
        {/* header */}
        <div className="flex gap-4 border-b border-ink-100 bg-ink-50/60 px-5 py-3">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-3 flex-1 rounded bg-ink-200/70" />
          ))}
        </div>
        {/* rows */}
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 border-b border-ink-100 px-5 py-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className="h-3.5 flex-1 rounded bg-ink-100"
                style={{ opacity: 1 - r * 0.07 }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
