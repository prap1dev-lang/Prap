"use client";
import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function ContactForm({
  projectSlug = "",
  hasProject = false,
  intentDefault,
  messageDefault = "",
}: {
  projectSlug?: string;
  hasProject?: boolean;
  intentDefault: string;
  messageDefault?: string;
}) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    intent: intentDefault,
    message: messageDefault,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.name.trim().length < 2) { setError("Please enter your name."); return; }
    if (form.phone.trim().length < 6) { setError("Please enter a valid phone number."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, project: projectSlug }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.ok) {
        throw new Error(typeof body.error === "string" ? body.error : "Could not send. Please try again.");
      }
      setDone(true);
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="card p-8 text-center space-y-3">
        <CheckCircle2 className="h-11 w-11 text-emerald-500 mx-auto" />
        <h2 className="font-serif text-2xl font-light">Thank you for reaching out!</h2>
        <p className="text-ink-600">
          We&apos;ve received your query{form.email ? " and emailed you a confirmation" : ""}. Our team will reach out to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-7 space-y-4">
      <h2 className="font-serif text-2xl font-light">Request a callback</h2>
      <div>
        <label className="label">Full name</label>
        <input className="input" placeholder="Your name" value={form.name} onChange={(e) => set("name")(e.target.value)} required />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Phone</label>
          <input className="input" placeholder="+91…" value={form.phone} onChange={(e) => set("phone")(e.target.value)} required />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set("email")(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label">I want to…</label>
        <select className="input" value={form.intent} onChange={(e) => set("intent")(e.target.value)}>
          {hasProject && <option>Enquire about this project</option>}
          <option>Book a site visit</option>
          <option>Become a Broker / Channel Partner</option>
          <option>Onboard my company (Corporate Referrer)</option>
          <option>General enquiry</option>
        </select>
      </div>
      <div>
        <label className="label">Message</label>
        <textarea className="input" rows={5} placeholder="Tell us how we can help…" value={form.message} onChange={(e) => set("message")(e.target.value)} />
      </div>
      {error && <p className="text-sm text-rose-700">{error}</p>}
      <button className="btn-primary" disabled={submitting}>
        {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : "Send message"}
      </button>
    </form>
  );
}
