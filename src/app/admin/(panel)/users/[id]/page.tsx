import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import { deleteUserCompletely } from "@/lib/admin-users";
import { CheckCircle2, XCircle, ExternalLink, ShieldCheck, AlertTriangle } from "lucide-react";
import ReraVerifyButton from "@/components/admin/ReraVerifyButton";
import DeleteUserButton from "@/components/admin/DeleteUserButton";

export const metadata = buildMetadata({ title: "User · Admin", path: "/admin/users", noIndex: true });
export const dynamic = "force-dynamic";

async function setStatus(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id"));
  const decision = String(formData.get("decision"));
  const notes = String(formData.get("notes") || "");
  const sb = supabaseAdmin();

  const next = decision === "approve" ? "verified" : "rejected";
  await sb
    .from("users")
    .update({
      kyc_status: next,
      rera_verified_at: decision === "approve" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  await sb.from("audit_log").insert({
    action: `kyc_${decision}`,
    payload: { user_id: id, notes },
  });

  revalidatePath(`/admin/users/${id}`);
  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

async function deleteUser(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id"));
  const res = await deleteUserCompletely(id);
  if (!res.ok) return res;
  revalidatePath("/admin/users");
  revalidatePath("/admin");
  redirect("/admin/users");
}

export default async function UserDetail({ params }: { params: { id: string } }) {
  await requireAdmin();
  const sb = supabaseAdmin();

  const { data: u } = await sb.from("users").select("*").eq("id", params.id).maybeSingle();
  if (!u) return notFound();

  const { data: wallet } = await sb.from("wallets").select("*").eq("user_id", u.id).maybeSingle();
  const { data: ledger } = await sb.from("coin_ledger").select("*").eq("user_id", u.id).order("at", { ascending: false }).limit(20);
  const { data: docs } = await sb.from("kyc_docs").select("*").eq("user_id", u.id);

  const reraSearchUrl = u.rera_number
    ? `https://www.up-rera.in/search?q=${encodeURIComponent(u.rera_number)}`
    : null;

  return (
    <div className="space-y-8 max-w-5xl">
      <nav className="text-sm text-ink-500">
        <Link href="/admin/users" className="hover:text-brand-700">← Back to users</Link>
      </nav>

      <header className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm text-ink-500 capitalize">{u.role}</p>
          <h1 className="text-3xl font-extrabold tracking-tight">{u.name}</h1>
          <p className="text-ink-500 mt-1">{u.email} · {u.phone}</p>
        </div>
        <span className={`badge ${u.kyc_status === "verified" ? "!bg-emerald-50 !text-emerald-700" : u.kyc_status === "rejected" ? "!bg-rose-50 !text-rose-700" : "!bg-amber-50 !text-amber-700"}`}>
          KYC: {u.kyc_status}
        </span>
      </header>

      <section className="card p-6">
        <h2 className="font-bold flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-brand-600" /> Surepass verification status</h2>
        <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
          <Pill label="PAN" ok={u.pan_verified} subtitle={u.pan_full_name || "Auto-checked at signup"} />
          <Pill label="Aadhaar" ok={u.aadhaar_verified} subtitle={u.aadhaar_verified ? u.aadhaar_full_name || "User-completed OTP" : "Pending user action"} />
          {u.role === "broker" && (
            <Pill label="RERA" ok={u.rera_verified} subtitle={u.rera_agent_name || (u.rera_number || "—")} />
          )}
        </div>
        {u.role === "broker" && u.rera_number && !u.rera_verified && (
          <div className="mt-5">
            <ReraVerifyButton userId={u.id} state="UP" />
          </div>
        )}
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-bold">Identity</h2>
          <dl className="mt-4 text-sm divide-y divide-ink-100">
            <Row k="PAN" v={u.pan} />
            <Row k="Aadhaar (masked)" v={`XXXX-XXXX-${u.aadhaar_last4}`} />
            <Row k="Aadhaar hash" v={(u.aadhaar_hash || "").slice(0, 16) + "…"} mono />
            {u.role === "broker" && <Row k="RERA #" v={u.rera_number || "—"} mono />}
            <Row k="Created" v={new Date(u.created_at).toLocaleString("en-IN")} />
          </dl>
          {reraSearchUrl && (
            <a href={reraSearchUrl} target="_blank" rel="noreferrer" className="btn-outline mt-5">
              Verify on UP-RERA <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>

        <div className="card p-6">
          <h2 className="font-bold">Wallet</h2>
          <p className="mt-3 text-3xl font-extrabold">{Number(wallet?.balance || 0).toLocaleString("en-IN")} <span className="text-brand-600 text-base font-bold">Coins</span></p>
          <p className="text-xs text-ink-500">≈ ₹{Number(wallet?.balance || 0).toLocaleString("en-IN")}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-ink-50 p-3">
              <p className="text-xs text-ink-500">Lifetime earned</p>
              <p className="font-bold">{Number(wallet?.lifetime_earned || 0).toLocaleString("en-IN")}</p>
            </div>
            <div className="rounded-xl bg-ink-50 p-3">
              <p className="text-xs text-ink-500">Lifetime redeemed</p>
              <p className="font-bold">{Number(wallet?.lifetime_redeemed || 0).toLocaleString("en-IN")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="font-bold">KYC documents</h2>
        {!docs || docs.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">No documents uploaded yet.</p>
        ) : (
          <ul className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
            {docs.map((d) => (
              <li key={d.id} className="card p-3">
                <p className="font-semibold capitalize">{d.kind}</p>
                <p className="text-xs text-ink-500 truncate">{d.storage_key}</p>
                <p className="text-xs mt-1">{d.verified ? "✅ Verified" : "⏳ Pending"}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {u.kyc_status === "pending" && (
        <section className="card p-6 border-amber-200">
          <h2 className="font-bold">Approve / Reject KYC</h2>
          <p className="mt-2 text-sm text-ink-700">
            Cross-check Aadhaar last 4 against uploaded doc{u.role === "broker" ? " and verify RERA number on the UP-RERA portal" : ""}.
            Then choose:
          </p>
          <form action={setStatus} className="mt-5 space-y-3">
            <input type="hidden" name="id" value={u.id} />
            <textarea name="notes" className="input" rows={2} placeholder="Internal notes (optional)" />
            <div className="flex gap-2">
              <button name="decision" value="approve" className="btn-primary"><CheckCircle2 className="h-4 w-4" /> Approve</button>
              <button name="decision" value="reject" className="btn-outline"><XCircle className="h-4 w-4" /> Reject</button>
            </div>
          </form>
        </section>
      )}

      <section className="card overflow-hidden">
        <div className="p-5 border-b border-ink-100"><h2 className="font-bold">Recent coin activity</h2></div>
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-500 uppercase text-xs">
            <tr>
              <th className="px-5 py-3 text-left">When</th>
              <th className="px-5 py-3 text-left">Source</th>
              <th className="px-5 py-3 text-right">Delta</th>
              <th className="px-5 py-3 text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {(ledger ?? []).map((l) => (
              <tr key={l.id} className="border-t border-ink-100">
                <td className="px-5 py-3 text-ink-500">{new Date(l.at).toLocaleString("en-IN")}</td>
                <td className="px-5 py-3">{l.source}</td>
                <td className={`px-5 py-3 text-right font-semibold ${l.delta > 0 ? "text-emerald-700" : "text-rose-700"}`}>
                  {l.delta > 0 ? "+" : ""}{Number(l.delta).toLocaleString("en-IN")}
                </td>
                <td className="px-5 py-3 text-right">{Number(l.balance_after).toLocaleString("en-IN")}</td>
              </tr>
            ))}
            {(!ledger || ledger.length === 0) && (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-ink-500">No activity yet.</td></tr>
            )}
          </tbody>
        </table>
      </section>

      {u.role !== "admin" && (
        <section className="card p-6 border-rose-200">
          <h2 className="font-bold flex items-center gap-2 text-rose-700">
            <AlertTriangle className="h-5 w-5" /> Danger zone
          </h2>
          <p className="mt-2 text-sm text-ink-700">
            Permanently remove this user and every related record — wallet, coin ledger,
            bookings, KYC, payouts and their login. This cannot be undone.
          </p>
          <div className="mt-5">
            <DeleteUserButton userId={u.id} userName={u.name} action={deleteUser} redirectTo="/admin/users" />
          </div>
        </section>
      )}
    </div>
  );
}

function Pill({ label, ok, subtitle }: { label: string; ok: boolean; subtitle?: string }) {
  return (
    <div className={`rounded-xl border p-3 ${ok ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
      <p className="text-xs uppercase tracking-wider font-semibold text-ink-500">{label}</p>
      <p className={`mt-1 font-bold ${ok ? "text-emerald-800" : "text-amber-800"}`}>
        {ok ? "Verified" : "Not verified"}
      </p>
      {subtitle && <p className="text-xs text-ink-700 mt-0.5 truncate">{subtitle}</p>}
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-ink-500">{k}</span>
      <span className={mono ? "font-mono text-xs" : ""}>{v}</span>
    </div>
  );
}
