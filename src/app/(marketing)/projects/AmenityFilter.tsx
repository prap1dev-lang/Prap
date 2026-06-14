"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, Check, X } from "lucide-react";
import { AMENITY_GROUPS } from "@/lib/amenities";

// Collapsible amenity filter. Selected amenity ids are written to the `amenities`
// query param (comma-separated). Projects must match ALL selected amenities.
export default function AmenityFilter() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = (params.get("amenities") || "").split(",").map((s) => s.trim()).filter(Boolean);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(initial);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  function apply() {
    const next = new URLSearchParams(params.toString());
    if (selected.length) next.set("amenities", selected.join(","));
    else next.delete("amenities");
    router.push(`/projects?${next.toString()}`);
    setOpen(false);
  }

  function clearAll() {
    setSelected([]);
    const next = new URLSearchParams(params.toString());
    next.delete("amenities");
    router.push(`/projects?${next.toString()}`);
  }

  return (
    <div className="md:col-span-12">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-sm font-medium transition"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filter by amenities
        {initial.length > 0 && (
          <span className="ml-1 rounded-full bg-brand-600 px-2 py-0.5 text-xs">{initial.length}</span>
        )}
      </button>

      {open && (
        <div className="mt-3 rounded-2xl bg-white text-ink-900 p-5 shadow-lg max-h-[60vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold">Select amenities</p>
            <button type="button" onClick={() => setOpen(false)} className="text-ink-400 hover:text-ink-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-5">
            {AMENITY_GROUPS.map((group) => (
              <div key={group.category}>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">{group.category}</p>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((a) => {
                    const Icon = a.icon;
                    const active = selected.includes(a.id);
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => toggle(a.id)}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                          active
                            ? "bg-brand-600 border-brand-600 text-white"
                            : "bg-white border-ink-200 text-ink-600 hover:border-brand-400"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" /> {a.label}
                        {active && <Check className="h-3.5 w-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 sticky bottom-0 bg-white pt-3 border-t border-ink-100">
            <button type="button" onClick={clearAll} className="text-sm text-ink-500 hover:text-ink-900">
              Clear amenities
            </button>
            <button type="button" onClick={apply} className="btn-primary">
              Apply{selected.length ? ` (${selected.length})` : ""}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
