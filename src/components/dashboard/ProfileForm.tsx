"use client";
import { useState } from "react";
import { Loader2, Check, AlertTriangle, ShieldCheck } from "lucide-react";

export type Profile = {
  name: string | null;
  email: string | null;
  phone: string | null;
  pan: string | null;
  role: "broker" | "corporate" | "referrer" | "admin";
  rera_number: string | null;
  upi_id: string | null;
  bank_account: string | null;
  bank_ifsc: string | null;
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
  });
  const [personal, setPersonal] = useState<Status>({ kind: "idle" });
  const [payout, setPayout] = useState<Status>({ kind: "idle" });

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save(
    fields: Partial<typeof form>,
    setStatus: (s: Status) => void,
  ) {
    setStatus({ kind: "saving" });
    try {
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
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
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
        <StatusRow status={personal} />
        <button
          className="btn-primary mt-5"
          disabled={personal.kind === "saving"}
          onClick={() =>
            save(
              {
                name: form.name,
                email: form.email,
                ...(initial.role === "broker" ? { rera_number: form.rera_number } : {}),
              },
              setPersonal,
            )
          }
        >
          {personal.kind === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
        </button>
      </section>

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
        <StatusRow status={payout} />
        <button
          className="btn-primary mt-5"
          disabled={payout.kind === "saving"}
          onClick={() =>
            save(
              { upi_id: form.upi_id, bank_account: form.bank_account, bank_ifsc: form.bank_ifsc },
              setPayout,
            )
          }
        >
          {payout.kind === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save payout details"}
        </button>
      </section>
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
      <p className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-700">
        <Check className="h-4 w-4" /> Saved
      </p>
    );
  if (status.kind === "error")
    return (
      <p className="mt-4 flex items-center gap-2 text-sm font-medium text-rose-700">
        <AlertTriangle className="h-4 w-4" /> {status.msg}
      </p>
    );
  return null;
}
