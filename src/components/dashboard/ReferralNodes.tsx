"use client";
import { UserRound, CheckCircle2, Clock, Lock, Plus, Coins, Share2 } from "lucide-react";

export interface ReferralNode {
  id: string;
  name: string;
  role: string;
  photoUrl: string | null;
  visited: boolean;
}

/**
 * Referral nodes — a polished "network" view of the people who joined with the
 * user's code. Nodes unlock in batches of 5; the next batch opens only once
 * every node in the current batch has completed a site visit.
 */
export default function ReferralNodes({
  nodes,
  batchSize = 5,
  shareHref = "#referral-code",
}: {
  nodes: ReferralNode[];
  batchSize?: number;
  shareHref?: string;
}) {
  const total = nodes.length;
  const batchStart = Math.floor(total === 0 ? 0 : (total - 1) / batchSize) * batchSize;
  const currentBatch = nodes.slice(batchStart, batchStart + batchSize);
  const batchFull = currentBatch.length === batchSize;
  const allVisited = batchFull && currentBatch.every((n) => n.visited);
  const canAddMore = !batchFull || allVisited;
  const pendingVisits = currentBatch.filter((n) => !n.visited).length;
  const visitedCount = currentBatch.filter((n) => n.visited).length;
  const batchNumber = Math.floor(batchStart / batchSize) + 1;

  // Slots to render for the current batch: filled nodes + one "add" slot (if the
  // user can add more) + locked placeholders for the rest of the 5.
  const emptyCount = batchSize - currentBatch.length;

  return (
    <section className="card p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-bold flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-50 text-brand-700">
              <Coins className="h-4 w-4" />
            </span>
            Your referral network
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            Earn <strong className="text-ink-700">5,000 coins</strong> per signup — unlocked in batches of {batchSize}.
          </p>
        </div>
        <span className="text-sm font-semibold text-ink-600">
          {total} joined · Batch {batchNumber}
        </span>
      </div>

      {/* Batch progress: how many of the current 5 have completed a visit */}
      {batchFull && (
        <div className="mt-4 rounded-xl bg-ink-50 p-3">
          <div className="flex items-center justify-between text-xs font-medium text-ink-600">
            <span>Site visits in this batch</span>
            <span>{visitedCount} / {batchSize}</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-ink-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${allVisited ? "bg-emerald-500" : "bg-brand-600"}`}
              style={{ width: `${(visitedCount / batchSize) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Node grid */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {currentBatch.map((n) => (
          <NodeCard key={n.id} node={n} />
        ))}

        {/* The single actionable empty slot (share to fill it) */}
        {emptyCount > 0 && canAddMore && (
          <a
            href={shareHref}
            className="group flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50/40 p-3 text-center transition hover:border-brand-500 hover:bg-brand-50 min-h-[120px]"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 text-brand-700 group-hover:scale-105 transition">
              <Plus className="h-5 w-5" />
            </span>
            <span className="text-xs font-semibold text-brand-700">Invite someone</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-brand-600"><Share2 className="h-3 w-3" /> Share code</span>
          </a>
        )}

        {/* Remaining locked placeholders */}
        {Array.from({ length: Math.max(0, emptyCount - (canAddMore ? 1 : 0)) }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-ink-100 bg-ink-50/50 p-3 text-center min-h-[120px]"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink-300 border border-ink-100">
              <UserRound className="h-5 w-5" />
            </span>
            <span className="text-[11px] text-ink-400">Open slot</span>
          </div>
        ))}
      </div>

      {/* Locked next-batch banner */}
      {batchFull && !allVisited && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <Lock className="h-5 w-5 flex-none text-amber-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-amber-900">Next 5 nodes are locked</p>
            <p className="mt-0.5 text-amber-800">
              {pendingVisits} of your {batchSize} referrals still need to complete a site visit.
              Once all {batchSize} have visited, you can invite {batchSize} more.
            </p>
          </div>
        </div>
      )}

      {batchFull && allVisited && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="h-5 w-5 flex-none text-emerald-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-emerald-900">Batch complete — next 5 unlocked! 🎉</p>
            <p className="mt-0.5 text-emerald-800">Invite {batchSize} more friends and keep earning.</p>
          </div>
        </div>
      )}

      {total === 0 && (
        <p className="mt-4 text-sm text-ink-500">
          No referrals yet — share your code to start building your network.
        </p>
      )}
    </section>
  );
}

function NodeCard({ node }: { node: ReferralNode }) {
  return (
    <div className="relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-ink-200 bg-white p-3 text-center min-h-[120px] shadow-sm">
      <span
        className={`absolute top-2 right-2 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
          node.visited ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
        }`}
      >
        {node.visited ? <CheckCircle2 className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
        {node.visited ? "Visited" : "Pending"}
      </span>
      <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-brand-700 font-bold overflow-hidden">
        {node.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={node.photoUrl} alt={node.name} className="h-full w-full object-cover" />
        ) : (
          (node.name?.[0] || "?").toUpperCase()
        )}
      </span>
      <p className="text-xs font-semibold text-ink-900 truncate max-w-full">{node.name}</p>
      <p className="text-[10px] text-ink-500 capitalize">{node.role}</p>
    </div>
  );
}
