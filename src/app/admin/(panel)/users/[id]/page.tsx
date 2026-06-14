import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import { deleteUserCompletely } from "@/lib/admin-users";
import { destroyCloudinaryUrl } from "@/lib/cloudinary";
import { ExternalLink, ShieldCheck, AlertTriangle, UserRound } from "lucide-react";
import ReraVerifyButton from "@/components/admin/ReraVerifyButton";
import DeleteUserButton from "@/components/admin/DeleteUserButton";
import KycDecisionButtons from "@/components/admin/KycDecisionButtons";
import SendResetButton from "@/components/admin/SendResetButton";
import EditUserForm from "@/components/admin/EditUserForm";
import DeleteKycDocButton from "@/components/admin/DeleteKycDocButton";

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

async function updateUser(formData: FormData): Promise<{ ok: true } | { ok: false; error: string }> {
  "use server";
  const me = await requireAdmin();
  const id = String(formData.get("id"));
  if (!id) return { ok: false, error: "Missing user id" };

  const email = String(formData.get("email") || "").trim();
  const role = String(formData.get("role") || "").trim();
  const confirmAdmin = String(formData.get("confirmAdmin") || "") === "yes";
  const allowedRoles = ["broker", "corporate", "referrer", "admin"];
  if (role && !allowedRoles.includes(role)) return { ok: false, error: "Invalid role" };

  const sb = supabaseAdmin();
  const { data: target } = await sb.from("users").select("role").eq("id", id).maybeSingle();
  if (!target) return { ok: false, error: "User not found" };

  // ── Role-change safeguards ──
  if (role && role !== target.role) {
    // Don't let an admin demote their own account (lock-out protection).
    if (id === me.authId && target.role === "admin") {
      return { ok: false, error: "You cannot change your own admin role." };
    }
    // Granting OR removing the admin role requires explicit confirmation.
    if ((role === "admin" || target.role === "admin") && !confirmAdmin) {
      return {
        ok: false,
        error:
          role === "admin"
            ? "Granting admin access requires confirmation. Tick the confirm box and save again."
            : "Removing admin access requires confirmation. Tick the confirm box and save again.",
      };
    }
  }

  const patch: Record<string, any> = {
    name: String(formData.get("name") || "").trim() || null,
    email: email || null,
    rera_number: String(formData.get("rera_number") || "").trim().toUpperCase() || null,
    upi_id: String(formData.get("upi_id") || "").trim() || null,
    bank_account: String(formData.get("bank_account") || "").trim() || null,
    bank_ifsc: String(formData.get("bank_ifsc") || "").trim().toUpperCase() || null,
  };
  if (role) patch.role = role;

  const { error } = await sb.from("users").update(patch).eq("id", id);
  if (error) return { ok: false, error: error.message };

  // Keep the auth email in sync when it changed (best-effort).
  if (email) {
    await sb.auth.admin.updateUserById(id, { email }).catch(() => {});
  }

  await sb.from("audit_log").insert({ action: "user_updated", payload: { user_id: id, fields: Object.keys(patch) } });

  revalidatePath(`/admin/users/${id}`);
  revalidatePath("/admin/users");
  return { ok: true };
}

async function deleteKycDoc(formData: FormData): Promise<{ ok: true } | { ok: false; error: string }> {
  "use server";
  await requireAdmin();
  const docId = String(formData.get("docId") || "");
  if (!docId) return { ok: false, error: "Missing document id" };

  const sb = supabaseAdmin();
  const { data: doc } = await sb
    .from("kyc_docs")
    .select("id, user_id, kind, storage_key")
    .eq("id", docId)
    .maybeSingle();
  if (!doc) return { ok: false, error: "Document not found" };

  // Purge the actual file from Cloudinary first (best-effort). If it's already
  // gone or not a Cloudinary URL we still remove the DB record.
  let fileResult: { ok: boolean; error?: string } = { ok: true };
  if (doc.storage_key) fileResult = await destroyCloudinaryUrl(doc.storage_key);

  const { error } = await sb.from("kyc_docs").delete().eq("id", docId);
  if (error) return { ok: false, error: error.message };

  // If this was the profile photo, clear the avatar pointer too.
  if (doc.kind === "photo") {
    await sb.from("users").update({ photo_url: null }).eq("id", doc.user_id);
  }

  await sb.from("audit_log").insert({
    action: "kyc_doc_deleted",
    payload: {
      user_id: doc.user_id,
      doc_id: docId,
      kind: doc.kind,
      file_purged: fileResult.ok,
      file_error: fileResult.ok ? undefined : fileResult.error,
    },
  });

  revalidatePath(`/admin/users/${doc.user_id}`);
  return { ok: true };
}

async function sendPasswordReset(formData: FormData) {
  "use server";
  await requireAdmin();
  const email = String(formData.get("email") || "");
  if (!email || email.endsWith("@users.prap.in")) {
    return { ok: false, error: "User has no real email on file — cannot send a reset link." };
  }
  const sb = supabaseAdmin();
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL || ""}/auth/reset-password`;
  const { error } = await sb.auth.resetPasswordForEmail(email, redirectTo ? { redirectTo } : undefined);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
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

      <header className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 rounded-full overflow-hidden border border-ink-200 bg-ink-50 grid place-items-center flex-none">
            {u.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={u.photo_url} alt={u.name || "Profile photo"} className="h-full w-full object-cover" />
            ) : (
              <UserRound className="h-9 w-9 text-ink-400" />
            )}
          </div>
          <div>
            <p className="text-sm text-ink-500 capitalize">{u.role}</p>
            <h1 className="text-3xl font-extrabold tracking-tight">{u.name}</h1>
            <p className="text-ink-500 mt-1">{u.email || "—"} · {u.phone}</p>
          </div>
        </div>
        <span className={`badge ${u.kyc_status === "verified" ? "!bg-emerald-50 !text-emerald-700" : u.kyc_status === "rejected" ? "!bg-rose-50 !text-rose-700" : "!bg-amber-50 !text-amber-700"}`}>
          KYC: {u.kyc_status}
        </span>
      </header>

      {/* Edit profile (collapses to a button until clicked) */}
      <EditUserForm
        user={{
          id: u.id, name: u.name, email: u.email, role: u.role,
          rera_number: u.rera_number, upi_id: u.upi_id,
          bank_account: u.bank_account, bank_ifsc: u.bank_ifsc,
        }}
        action={updateUser}
      />

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
        <h2 className="font-bold">Personal &amp; payout details</h2>
        <dl className="mt-4 grid sm:grid-cols-2 gap-x-8 text-sm">
          <Row k="Full name" v={u.name || "—"} />
          <Row k="Email" v={u.email || "—"} />
          <Row k="Phone" v={u.phone || "—"} />
          <Row k="Role" v={u.role} />
          <Row k="UPI ID" v={u.upi_id || "—"} />
          <Row k="Bank account" v={u.bank_account || "—"} mono />
          <Row k="IFSC code" v={u.bank_ifsc || "—"} mono />
          {u.role === "broker" && <Row k="RERA number" v={u.rera_number || "—"} mono />}
        </dl>
      </section>

      <section className="card p-6">
        <h2 className="font-bold flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-brand-600" /> Login &amp; security</h2>
        <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-ink-100 p-3">
            <p className="text-xs uppercase tracking-wider font-semibold text-ink-500">Password</p>
            <p className={`mt-1 font-bold ${u.has_password ? "text-emerald-700" : "text-amber-700"}`}>
              {u.has_password ? "Set" : "Not set"}
            </p>
            {u.password_set_at && (
              <p className="text-xs text-ink-500 mt-0.5">Set {new Date(u.password_set_at).toLocaleDateString("en-IN")}</p>
            )}
            <p className="text-[11px] text-ink-400 mt-1">Passwords are encrypted and never visible.</p>
          </div>
          <div className="rounded-xl border border-ink-100 p-3">
            <p className="text-xs uppercase tracking-wider font-semibold text-ink-500">Login email</p>
            <p className="mt-1 font-medium text-ink-900 break-all">
              {u.email || <span className="text-ink-400">— (phone-only)</span>}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <SendResetButton email={u.email} action={sendPasswordReset} />
        </div>
      </section>

      <section className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">KYC documents</h2>
          <span className="text-xs text-ink-500">{docs?.length ?? 0} uploaded</span>
        </div>
        {!docs || docs.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">No documents uploaded yet.</p>
        ) : (
          <ul className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            {docs.map((d) => (
              <li key={d.id} className="relative">
                <DeleteKycDocButton docId={d.id} action={deleteKycDoc} />
                <a
                  href={d.storage_key}
                  target="_blank"
                  rel="noreferrer"
                  className="block relative aspect-[4/3] rounded-xl border border-ink-200 overflow-hidden bg-ink-50 group"
                  title="Open full document"
                >
                  {isImageUrl(d.storage_key) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={d.storage_key} alt={docLabel(d.kind)} className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <span className="absolute inset-0 grid place-items-center text-brand-700">
                      <span className="flex flex-col items-center">
                        <ExternalLink className="h-6 w-6" />
                        <span className="text-xs font-semibold mt-1">Open file</span>
                      </span>
                    </span>
                  )}
                  <span className="absolute inset-x-0 bottom-0 bg-ink-900/70 text-white text-[11px] font-medium px-2 py-1 flex items-center justify-between">
                    <span className="truncate">{docLabel(d.kind)}</span>
                    {d.verified ? <ShieldCheck className="h-3.5 w-3.5 text-emerald-300 flex-none" /> : <span className="text-amber-300 flex-none">⏳</span>}
                  </span>
                </a>
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
            <KycDecisionButtons />
          </form>
        </section>
      )}

      <section className="card overflow-hidden">
        <div className="p-5 border-b border-ink-100"><h2 className="font-bold">Recent coin activity</h2></div>
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
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
        </div>
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

function isImageUrl(url: string) {
  return /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url) || /\/image\/upload\//.test(url);
}

const DOC_LABELS: Record<string, string> = {
  aadhaar: "Aadhaar",
  aadhaar_front: "Aadhaar — Front",
  aadhaar_back: "Aadhaar — Back",
  pan: "PAN",
  pan_front: "PAN — Front",
  pan_back: "PAN — Back",
  photo: "Profile photo",
  rera_cert: "RERA certificate",
};
function docLabel(kind: string) {
  return DOC_LABELS[kind] ?? kind;
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
