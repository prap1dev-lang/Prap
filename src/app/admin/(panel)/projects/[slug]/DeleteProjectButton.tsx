"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

export default function DeleteProjectButton({ slug, name }: { slug: string; name: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function doDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/projects/${slug}`, { method: "DELETE" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.ok) throw new Error(body.error || "Delete failed");
      router.push("/admin/projects");
      router.refresh();
    } catch (e: any) {
      setError(e?.message || "Delete failed");
      setDeleting(false);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="btn-outline !py-1.5 !px-3 text-xs !border-rose-200 !text-rose-600 hover:!bg-rose-50"
      >
        <Trash2 className="h-3.5 w-3.5" /> Delete
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5">
      <span className="text-xs text-rose-700">Delete “{name}” permanently?</span>
      <button
        type="button"
        onClick={doDelete}
        disabled={deleting}
        className="text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded px-2 py-1 inline-flex items-center gap-1 disabled:opacity-50"
      >
        {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
        Yes, delete
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        disabled={deleting}
        className="text-xs text-ink-600 hover:text-ink-900"
      >
        Cancel
      </button>
      {error && <span className="text-xs text-rose-700">{error}</span>}
    </div>
  );
}
