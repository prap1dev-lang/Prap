import { Loader2 } from "lucide-react";

/** Centered spinner shown while an admin route's server data loads. */
export default function AdminLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="grid place-items-center py-24 text-ink-500">
      <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      <p className="mt-3 text-sm font-medium">{label}</p>
    </div>
  );
}
