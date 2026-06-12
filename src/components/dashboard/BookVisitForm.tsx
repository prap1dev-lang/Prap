"use client";
import { useState } from "react";
import { Calendar, Loader2, Check, AlertTriangle, ArrowRight } from "lucide-react";

type ProjectOption = { slug: string; name: string; city: string };

export default function BookVisitForm({ projects }: { projects: ProjectOption[] }) {
  const [open, setOpen] = useState(false);
  const [slug, setSlug] = useState(projects[0]?.slug ?? "");
  const [when, setWhen] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("saving");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectSlug: slug, scheduledAt: new Date(when).toISOString(), notes }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.ok) {
        const msg =
          typeof body.error === "string"
            ? body.error
            : Object.values(body.error || {}).flat().join(", ") || "Booking failed";
        throw new Error(msg);
      }
      setStatus("done");
      setTimeout(() => window.location.reload(), 900);
    } catch (e: any) {
      setError(e?.message || "Booking failed");
      setStatus("idle");
    }
  }

  if (!projects.length) {
    return (
      <div className="card p-6 text-sm text-ink-600">
        No bookable projects are listed yet. Please check back soon.
      </div>
    );
  }

  if (!open) {
    return (
      <button className="btn-primary" onClick={() => setOpen(true)}>
        <Calendar className="h-4 w-4" /> Book a site visit
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="card p-6 space-y-4">
      <h2 className="font-bold">Book a site visit</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label">Project</label>
          <select className="input" value={slug} onChange={(e) => setSlug(e.target.value)} required>
            {projects.map((p) => (
              <option key={p.slug} value={p.slug}>{p.name} · {p.city}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label">Preferred date &amp; time</label>
          <input
            type="datetime-local"
            className="input"
            value={when}
            min={new Date(Date.now() + 3600_000).toISOString().slice(0, 16)}
            onChange={(e) => setWhen(e.target.value)}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Notes <span className="text-ink-500 font-normal">(optional)</span></label>
          <textarea className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Configuration, budget, anything the team should know…" />
        </div>
      </div>

      {error && (
        <p className="flex items-start gap-2 text-sm text-rose-700">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-none" /> {error}
        </p>
      )}

      <div className="flex gap-2">
        <button className="btn-primary" disabled={status !== "idle"}>
          {status === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : status === "done" ? <><Check className="h-4 w-4" /> Booked</> : <>Confirm booking <ArrowRight className="h-4 w-4" /></>}
        </button>
        <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
      </div>
      <p className="text-xs text-ink-500">
        Your visit is locked to your Aadhaar for this project and appears instantly in the PRAP admin queue.
      </p>
    </form>
  );
}
