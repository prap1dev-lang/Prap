"use client";
import { useState } from "react";
import { Loader2, Check, AlertTriangle, Pencil, X } from "lucide-react";

export type EditableUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  rera_number: string | null;
  upi_id: string | null;
  bank_account: string | null;
  bank_ifsc: string | null;
};

type Result = { ok: true } | { ok: false; error: string };

export default function EditUserForm({
  user,
  action,
}: {
  user: EditableUser;
  action: (formData: FormData) => Promise<Result>;
}) {
  const [editing, setEditing] = useState(false);
  const [role, setRole] = useState(user.role);
  const [status, setStatus] = useState<{ kind: "idle" | "saving" | "error"; msg?: string }>({ kind: "idle" });

  // Show the confirm box whenever the admin role is being granted or removed.
  const roleChanged = role !== user.role;
  const touchesAdmin = roleChanged && (role === "admin" || user.role === "admin");

  async function onSubmit(formData: FormData) {
    setStatus({ kind: "saving" });
    const res = await action(formData);
    if (res.ok) {
      setStatus({ kind: "idle" });
      setEditing(false);
    } else {
      setStatus({ kind: "error", msg: res.error });
    }
  }

  if (!editing) {
    return (
      <button type="button" onClick={() => setEditing(true)} className="btn-outline !py-1.5 !px-3 text-sm">
        <Pencil className="h-3.5 w-3.5" /> Edit profile
      </button>
    );
  }

  return (
    <form action={onSubmit} className="card p-6 border-brand-200">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">Edit profile</h2>
        <button type="button" onClick={() => { setEditing(false); setStatus({ kind: "idle" }); }} className="text-ink-400 hover:text-ink-700">
          <X className="h-5 w-5" />
        </button>
      </div>
      <input type="hidden" name="id" value={user.id} />
      <div className="mt-5 grid sm:grid-cols-2 gap-4">
        <Field label="Full name">
          <input name="name" className="input" defaultValue={user.name ?? ""} />
        </Field>
        <Field label="Email">
          <input name="email" type="email" className="input" defaultValue={user.email ?? ""} placeholder="user@example.com" />
        </Field>
        <Field label="Role">
          <select name="role" className="input" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="broker">Broker</option>
            <option value="corporate">Corporate</option>
            <option value="referrer">Referrer</option>
            <option value="admin">Admin</option>
          </select>
        </Field>
        <Field label="RERA number">
          <input name="rera_number" className="input uppercase" defaultValue={user.rera_number ?? ""} placeholder="UPRERAAGT00XXXX" />
        </Field>
        <Field label="UPI ID">
          <input name="upi_id" className="input" defaultValue={user.upi_id ?? ""} placeholder="name@upi" />
        </Field>
        <Field label="Bank account">
          <input name="bank_account" className="input" defaultValue={user.bank_account ?? ""} placeholder="XXXXXXXX1234" />
        </Field>
        <Field label="IFSC code">
          <input name="bank_ifsc" className="input uppercase" defaultValue={user.bank_ifsc ?? ""} placeholder="HDFC0001234" />
        </Field>
      </div>

      {touchesAdmin && (
        <label className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 cursor-pointer">
          <input type="checkbox" name="confirmAdmin" value="yes" className="mt-0.5 accent-amber-600 h-4 w-4" />
          <span>
            {role === "admin"
              ? "I understand this grants full admin access to the entire panel."
              : "I understand this removes admin access from this user."}
          </span>
        </label>
      )}

      {status.kind === "error" && (
        <p className="mt-4 flex items-center gap-2 text-sm font-medium text-rose-700">
          <AlertTriangle className="h-4 w-4" /> {status.msg}
        </p>
      )}

      <div className="mt-5 flex items-center gap-3">
        <button className="btn-primary" disabled={status.kind === "saving"}>
          {status.kind === "saving" ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Check className="h-4 w-4" /> Save changes</>}
        </button>
        <button type="button" onClick={() => { setEditing(false); setStatus({ kind: "idle" }); }} className="btn-outline">
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
