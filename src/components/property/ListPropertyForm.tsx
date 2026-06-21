"use client";
import { useState } from "react";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { PROPERTY_TYPES, subtypesFor, type PropertyType } from "@/lib/property-types";

const CITIES = ["Noida", "Greater Noida", "Yamuna Expressway", "Gurgaon", "Delhi", "Other"];
const CONFIGS = [
  "1 RK / Studio", "1 BHK", "2 BHK", "2 BHK + Study", "3 BHK", "3 BHK + Study",
  "3 BHK + Servant Room", "4 BHK", "4 BHK + Servant Room", "5 BHK", "Plot", "Other",
];

function tenDigits(p: string) {
  let d = p.replace(/\D/g, "");
  if (d.startsWith("0")) d = d.slice(1);
  return d.slice(0, 10);
}

export default function ListPropertyForm() {
  const [type, setType] = useState<PropertyType>("Residential");
  const [subType, setSubType] = useState("");
  const [form, setForm] = useState({
    ownerName: "", phone: "", email: "", city: "Noida", locality: "",
    config: "", area: "", price: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.ownerName.trim().length < 2) { setError("Please enter your name."); return; }
    if (!/^[6-9]\d{9}$/.test(form.phone)) { setError("Enter a valid 10-digit mobile number."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/property-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyType: type, subType, ...form }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.ok) {
        const msg = typeof body.error === "string" ? body.error : "Could not submit. Please try again.";
        throw new Error(msg);
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
      <div className="card p-10 text-center space-y-3">
        <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
        <h2 className="text-2xl font-extrabold text-ink-900">Property submitted!</h2>
        <p className="text-ink-500">Our team will review your property and reach out on <strong>+91 {form.phone}</strong> shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-6 md:p-8 space-y-7">
      {/* Property type */}
      <div>
        <p className="font-bold text-ink-900 mb-3">What kind of property do you have?</p>
        <div className="flex items-center gap-6">
          {PROPERTY_TYPES.map((t) => (
            <label key={t} className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-ink-700">
              <input
                type="radio"
                name="propertyType"
                className="accent-brand-600 h-4 w-4"
                checked={type === t}
                onChange={() => { setType(t); setSubType(""); }}
              />
              {t}
            </label>
          ))}
        </div>

        {/* Sub-type chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {subtypesFor(type).map((s) => {
            const active = subType === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSubType(s)}
                className={`px-4 py-2 rounded-full text-sm border transition ${
                  active
                    ? "bg-brand-50 border-brand-500 text-brand-700 ring-1 ring-brand-500"
                    : "bg-white border-ink-200 text-ink-600 hover:border-brand-400"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Owner contact */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="label">Your name *</label>
          <input className="input" value={form.ownerName} onChange={(e) => set("ownerName")(e.target.value)} placeholder="Full name" />
        </div>
        <div>
          <label className="label">Phone *</label>
          <div className="flex">
            <span className="inline-flex items-center rounded-l-xl border border-r-0 border-ink-200 bg-ink-50 px-3 text-sm font-semibold text-ink-700">+91</span>
            <input
              className="input !rounded-l-none"
              value={form.phone}
              onChange={(e) => set("phone")(tenDigits(e.target.value))}
              placeholder="98XXXXXXXX"
              inputMode="numeric"
              maxLength={10}
            />
          </div>
        </div>
        <div>
          <label className="label">Email <span className="text-xs text-ink-500 font-normal">(optional)</span></label>
          <input className="input" type="email" value={form.email} onChange={(e) => set("email")(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <label className="label">City</label>
          <select className="input" value={form.city} onChange={(e) => set("city")(e.target.value)}>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Locality / Sector</label>
          <input className="input" value={form.locality} onChange={(e) => set("locality")(e.target.value)} placeholder="e.g. Sector 150" />
        </div>
        <div>
          <label className="label">Configuration</label>
          <select className="input" value={form.config} onChange={(e) => set("config")(e.target.value)}>
            <option value="">Select…</option>
            {CONFIGS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Area</label>
          <input className="input" value={form.area} onChange={(e) => set("area")(e.target.value)} placeholder="e.g. 1450 sq.ft." />
        </div>
        <div>
          <label className="label">Expected price</label>
          <input className="input" value={form.price} onChange={(e) => set("price")(e.target.value)} placeholder="e.g. ₹95 Lakh" />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div>
      )}

      <button className="btn-primary w-full sm:w-auto" disabled={submitting}>
        {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : <>Submit property <ArrowRight className="h-4 w-4" /></>}
      </button>
    </form>
  );
}
