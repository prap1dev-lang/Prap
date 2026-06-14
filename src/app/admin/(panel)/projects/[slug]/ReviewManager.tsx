"use client";
import { useState } from "react";
import { Star, Trash2, Loader2, Plus } from "lucide-react";

export interface AdminReview {
  id: string;
  author_name: string;
  rating: number;
  body: string;
  is_published: boolean;
  created_at: string;
}
type Result = { ok: true } | { ok: false; error: string };

export default function ReviewManager({
  slug, reviews, addAction, deleteAction,
}: {
  slug: string;
  reviews: AdminReview[];
  addAction: (formData: FormData) => Promise<Result>;
  deleteAction: (formData: FormData) => Promise<Result>;
}) {
  const [rating, setRating] = useState(5);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onAdd(formData: FormData) {
    setBusy(true);
    setError(null);
    formData.set("rating", String(rating));
    formData.set("slug", slug);
    const res = await addAction(formData);
    setBusy(false);
    if (!res.ok) setError(res.error);
    else setRating(5);
  }

  async function onDelete(id: string) {
    const fd = new FormData();
    fd.set("id", id);
    await deleteAction(fd);
  }

  return (
    <section className="card p-6">
      <h2 className="text-lg font-bold">Customer reviews <span className="text-sm font-normal text-ink-400">({reviews.length})</span></h2>

      {/* Add review */}
      <form action={onAdd} className="mt-4 grid sm:grid-cols-2 gap-3">
        <input name="author_name" className="input" placeholder="Reviewer name" required />
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} star`}>
              <Star className={`h-6 w-6 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-ink-300"}`} />
            </button>
          ))}
        </div>
        <textarea name="body" className="input sm:col-span-2" rows={3} placeholder="Review text…" required />
        <div className="sm:col-span-2 flex items-center gap-3">
          <button className="btn-primary" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add review
          </button>
          {error && <span className="text-sm text-rose-600">{error}</span>}
        </div>
      </form>

      {/* Existing reviews */}
      <div className="mt-6 space-y-3">
        {reviews.length === 0 && <p className="text-sm text-ink-400">No reviews yet.</p>}
        {reviews.map((r) => (
          <div key={r.id} className="rounded-xl border border-ink-100 p-3 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-ink-900">{r.author_name}</span>
                <span className="inline-flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={`h-3.5 w-3.5 ${n <= r.rating ? "fill-amber-400 text-amber-400" : "text-ink-200"}`} />
                  ))}
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-600">{r.body}</p>
            </div>
            <button type="button" onClick={() => onDelete(r.id)} className="text-rose-500 hover:text-rose-700 flex-none" aria-label="Delete review">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
