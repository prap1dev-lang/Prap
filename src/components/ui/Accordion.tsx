"use client";
import { useState } from "react";
import { ChevronDown, CheckCircle2 } from "lucide-react";

export interface AccordionSection {
  id: string;
  title: string;
  // Pre-rendered icon element (e.g. <Info className="h-5 w-5" />). A rendered
  // node can cross the server→client boundary; a component function cannot.
  icon: React.ReactNode;
  filled: boolean;       // show a green tick only when this section has data
  content: React.ReactNode;
}

// Collapsible sections. Each header shows a coloured icon, the title, a green
// tick when filled, and a chevron that flips when open. Click a header to
// expand/collapse. The first filled section opens by default.
// `renderUnfilled` keeps content visible even when a section isn't "filled"
// (useful in admin, where empty rows still read as "—").
export default function Accordion({
  sections, renderUnfilled = false,
}: { sections: AccordionSection[]; renderUnfilled?: boolean }) {
  const firstFilled = sections.find((s) => s.filled)?.id ?? sections[0]?.id;
  const [open, setOpen] = useState<Record<string, boolean>>(firstFilled ? { [firstFilled]: true } : {});

  const toggle = (id: string) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  return (
    <div className="space-y-3">
      {sections.map((s) => {
        const isOpen = !!open[s.id];
        return (
          <section key={s.id} className="card overflow-hidden">
            <button
              type="button"
              onClick={() => toggle(s.id)}
              aria-expanded={isOpen}
              className="w-full flex items-center gap-3 p-4 sm:p-5 text-left hover:bg-ink-50/60 transition"
            >
              <span className={`grid h-9 w-9 flex-none place-items-center rounded-xl ${s.filled ? "bg-brand-50 text-brand-700" : "bg-ink-100 text-ink-400"}`}>
                {s.icon}
              </span>
              <span className="font-serif text-lg sm:text-xl font-light text-ink-900">{s.title}</span>
              {s.filled && <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-none" aria-label="Completed" />}
              <ChevronDown className={`ml-auto h-5 w-5 flex-none text-ink-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && (
              <div className="px-4 sm:px-5 pb-5 pt-0">
                {s.filled || renderUnfilled ? s.content : <p className="text-sm text-ink-400">Not specified yet.</p>}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
