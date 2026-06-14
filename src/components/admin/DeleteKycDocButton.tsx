"use client";
import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";

type Result = { ok: true } | { ok: false; error: string };

export default function DeleteKycDocButton({
  docId,
  action,
}: {
  docId: string;
  action: (formData: FormData) => Promise<Result>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    setDeleting(true);
    setError(null);
    const fd = new FormData();
    fd.set("docId", docId);
    const res = await action(fd);
    if (!res.ok) {
      setError(res.error);
      setDeleting(false);
    }
    // On success the page revalidates and the tile disappears.
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirming(true); }}
        className="absolute top-1.5 right-1.5 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-white shadow hover:bg-rose-700"
        title="Delete document"
        aria-label="Delete document"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <div
      className="absolute inset-0 z-20 bg-ink-900/80 grid place-items-center p-2 text-center"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      <div>
        <p className="text-white text-xs mb-2">Delete this document?</p>
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded px-2 py-1 inline-flex items-center gap-1 disabled:opacity-50"
          >
            {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />} Delete
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={deleting}
            className="text-xs text-white/80 hover:text-white"
          >
            Cancel
          </button>
        </div>
        {error && <p className="mt-1 text-[11px] text-rose-300">{error}</p>}
      </div>
    </div>
  );
}
