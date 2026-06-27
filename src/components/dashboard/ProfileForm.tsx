"use client";
import { useState, useRef } from "react";
import { Loader2, Check, AlertTriangle, ShieldCheck, UserRound, Pencil } from "lucide-react";

export type Profile = {
  name: string | null;
  email: string | null;
  phone: string | null;
  pan: string | null;
  role: "broker" | "corporate" | "creator" | "builder" | "individual" | "referrer" | "admin";
  rera_number: string | null;
  upi_id: string | null;
  bank_account: string | null;
  bank_ifsc: string | null;
  photo_url: string | null;
  instagram: string | null;
  facebook: string | null;
  youtube: string | null;
  pan_verified: boolean;
  aadhaar_verified: boolean;
  rera_verified: boolean;
};

type Status = { kind: "idle" | "saving" | "saved" | "error"; msg?: string };

export default function ProfileForm({ initial }: { initial: Profile }) {
  const [form, setForm] = useState({
    name: initial.name ?? "",
    email: initial.email ?? "",
    rera_number: initial.rera_number ?? "",
    upi_id: initial.upi_id ?? "",
    bank_account: initial.bank_account ?? "",
    bank_ifsc: initial.bank_ifsc ?? "",
    instagram: initial.instagram ?? "",
    facebook: initial.facebook ?? "",
    youtube: initial.youtube ?? "",
  });
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  // One Save for the whole form — personal details + payout details together.
  async function saveAll() {
    setStatus({ kind: "saving" });
    try {
      const fields: Record<string, string> = {
        name: form.name,
        email: form.email,
        upi_id: form.upi_id,
        bank_account: form.bank_account,
        bank_ifsc: form.bank_ifsc,
      };
      if (initial.role === "broker") fields.rera_number = form.rera_number;
      if (initial.role === "creator") {
        fields.instagram = form.instagram;
        fields.facebook = form.facebook;
        fields.youtube = form.youtube;
      }

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) {
        const err =
          typeof body.error === "string"
            ? body.error
            : Object.values(body.error || {}).flat().join(", ") || "Save failed";
        throw new Error(err);
      }
      setStatus({ kind: "saved" });
      setTimeout(() => setStatus({ kind: "idle" }), 2500);
    } catch (e: any) {
      setStatus({ kind: "error", msg: e?.message || "Save failed" });
    }
  }

  return (
    <div className="grid gap-6">
      {/* Personal details */}
      <section className="card p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold">Personal details</h2>
          <VerifyBadge label="PAN" ok={initial.pan_verified} />
        </div>

        <div className="mt-5 flex items-center gap-4">
          <AvatarUpload initialUrl={initial.photo_url} name={form.name || initial.name} />
          <div>
            <p className="font-semibold text-ink-900">{form.name || initial.name || "Your name"}</p>
            <p className="text-sm text-ink-500 capitalize">{initial.role}</p>
          </div>
        </div>

        <div className="mt-5 grid sm:grid-cols-2 gap-4">
          <Field label="Full name">
            <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Phone" hint="KYC-locked">
            <input className="input" value={initial.phone ?? ""} disabled />
          </Field>
          <Field label="Email">
            <input className="input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
          </Field>
          <Field label="PAN" hint="KYC-locked">
            <input className="input uppercase" value={initial.pan ?? ""} disabled />
          </Field>
          {initial.role === "broker" && (
            <Field label="UP-RERA registration number" full>
              <input
                className="input"
                value={form.rera_number}
                onChange={(e) => set("rera_number", e.target.value.toUpperCase())}
                placeholder="UPRERAAGT00XXXX"
              />
            </Field>
          )}
        </div>
      </section>

      {/* Creator social profiles */}
      {initial.role === "creator" && (
        <section className="card p-6">
          <h2 className="font-bold">Social profiles</h2>
          <p className="mt-1 text-sm text-ink-500">Link your channels so we can feature your creator profile.</p>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <Field label="Instagram">
              <input className="input" value={form.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="https://instagram.com/yourhandle" />
            </Field>
            <Field label="Facebook">
              <input className="input" value={form.facebook} onChange={(e) => set("facebook", e.target.value)} placeholder="https://facebook.com/yourpage" />
            </Field>
            <Field label="YouTube" full>
              <input className="input" value={form.youtube} onChange={(e) => set("youtube", e.target.value)} placeholder="https://youtube.com/@yourchannel" />
            </Field>
          </div>
        </section>
      )}

      {/* Payout methods */}
      <section className="card p-6">
        <h2 className="font-bold">Payout methods</h2>
        <p className="mt-1 text-sm text-ink-500">Where we send your redeemed PRAP Coins.</p>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <Field label="UPI ID">
            <input className="input" value={form.upi_id} onChange={(e) => set("upi_id", e.target.value)} placeholder="name@upi" />
          </Field>
          <Field label="Bank account number">
            <input className="input" value={form.bank_account} onChange={(e) => set("bank_account", e.target.value.replace(/\s/g, ""))} placeholder="XXXXXXXX1234" />
          </Field>
          <Field label="IFSC code">
            <input className="input uppercase" value={form.bank_ifsc} onChange={(e) => set("bank_ifsc", e.target.value.toUpperCase())} placeholder="HDFC0001234" />
          </Field>
        </div>
      </section>

      {/* One Save for the whole form */}
      <div className="sticky bottom-4 z-10">
        <div className="card p-4 flex items-center justify-between gap-3 shadow-lg">
          <StatusRow status={status} />
          <button className="btn-primary ml-auto" disabled={status.kind === "saving"} onClick={saveAll}>
            {status.kind === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save all changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, full, children }: { label: string; hint?: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <label className="label flex items-center gap-2">
        {label}
        {hint && <span className="text-[11px] font-normal text-ink-400">· {hint}</span>}
      </label>
      {children}
    </div>
  );
}

function AvatarUpload({ initialUrl, name }: { initialUrl: string | null; name: string | null }) {
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("kind", "photo");
      const res = await fetch("/api/kyc/upload", { method: "POST", body: fd });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.ok) throw new Error(body.error || "Upload failed");
      setUrl(body.url);
    } catch (err: any) {
      setError(err?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="group relative h-20 w-20 rounded-full overflow-hidden border border-ink-200 bg-ink-50 grid place-items-center"
        aria-label="Edit profile photo"
        title="Edit profile photo"
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={name || "Profile photo"} className="h-full w-full object-cover" />
        ) : (
          <UserRound className="h-9 w-9 text-ink-400" />
        )}
        <span className="absolute inset-0 grid place-items-center bg-ink-900/0 group-hover:bg-ink-900/40 transition">
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          ) : (
            <Pencil className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition" />
          )}
        </span>
      </button>
      {/* explicit Edit button next to the avatar for discoverability */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute -bottom-1 -right-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white shadow-card hover:bg-brand-700"
        aria-label="Edit photo"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      {error && <p className="mt-1 text-[11px] text-rose-700 w-24">{error}</p>}
    </div>
  );
}

function VerifyBadge({ label, ok }: { label: string; ok: boolean }) {
  if (!ok) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
      <ShieldCheck className="h-3.5 w-3.5" /> {label} verified
    </span>
  );
}

function StatusRow({ status }: { status: Status }) {
  if (status.kind === "saved")
    return (
      <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
        <Check className="h-4 w-4" /> All changes saved
      </p>
    );
  if (status.kind === "error")
    return (
      <p className="flex items-center gap-2 text-sm font-medium text-rose-700">
        <AlertTriangle className="h-4 w-4" /> {status.msg}
      </p>
    );
  return <span className="text-sm text-ink-500">Saves your profile &amp; payout details</span>;
}
