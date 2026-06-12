"use client";
import { useState, useTransition } from "react";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";

/**
 * Two-step destructive delete: opens a confirm box where the admin must type
 * the user's name, then invokes the passed server action.
 */
export default function DeleteUserButton({
  userId,
  userName,
  action,
  redirectTo,
}: {
  userId: string;
  userName: string;
  action: (formData: FormData) => Promise<{ ok: boolean; error?: string } | void>;
  redirectTo?: string;
}) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const armed = confirmText.trim().toLowerCase() === userName.trim().toLowerCase();

  function onDelete() {
    setError(null);
    const fd = new FormData();
    fd.set("id", userId);
    startTransition(async () => {
      const res = await action(fd);
      if (res && !res.ok) {
        setError(res.error || "Deletion failed.");
        return;
      }
      // Server action redirects on success for the detail page; for the list
      // page it revalidates and we just close the box.
      if (redirectTo) window.location.href = redirectTo;
      else setOpen(false);
    });
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-outline !border-rose-200 !text-rose-700 hover:!bg-rose-50">
        <Trash2 className="h-4 w-4" /> Delete user
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 space-y-3">
      <p className="flex items-start gap-2 text-sm text-rose-800">
        <AlertTriangle className="h-4 w-4 mt-0.5 flex-none" />
        <span>
          This permanently deletes <strong>{userName}</strong> and all their data — wallet, coin
          ledger, bookings, KYC and payout records. This cannot be undone.
        </span>
      </p>
      <div>
        <label className="label text-rose-800">Type <strong>{userName}</strong> to confirm</label>
        <input
          className="input"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={userName}
          autoFocus
        />
      </div>
      {error && <p className="text-sm font-medium text-rose-700">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onDelete}
          disabled={!armed || pending}
          className="btn !bg-rose-600 !text-white hover:!bg-rose-700 disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Trash2 className="h-4 w-4" /> Permanently delete</>}
        </button>
        <button type="button" onClick={() => { setOpen(false); setConfirmText(""); setError(null); }} className="btn-ghost">
          Cancel
        </button>
      </div>
    </div>
  );
}
