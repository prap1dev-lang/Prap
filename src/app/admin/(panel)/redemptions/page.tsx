import { revalidatePath } from "next/cache";
import { buildMetadata } from "@/lib/seo";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import { CheckCircle2, XCircle } from "lucide-react";

export const metadata = buildMetadata({ title: "Redemptions · Admin", path: "/admin/redemptions", noIndex: true });
export const dynamic = "force-dynamic";

async function markPaid(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id"));
  const sb = supabaseAdmin();
  await sb.from("payout_requests").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", id);
  await sb.from("audit_log").insert({ action: "payout_marked_paid", payload: { id } });
  revalidatePath("/admin/redemptions");
}

async function markFailed(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id"));
  const sb = supabaseAdmin();
  // 1. Mark request as failed
  await sb.from("payout_requests").update({ status: "failed" }).eq("id", id);
  // 2. Reverse the coin debit
  const { data: pr } = await sb.from("payout_requests").select("user_id, amount_inr").eq("id", id).single();
  if (pr) {
    const { data: wallet } = await sb.from("wallets").select("balance").eq("user_id", pr.user_id).single();
    const newBal = Number(wallet?.balance ?? 0) + Number(pr.amount_inr);
    await sb.from("coin_ledger").insert({
      user_id: pr.user_id,
      source: "release",
      delta: Number(pr.amount_inr),
      balance_after: newBal,
      notes: `Payout ${id} failed — coins restored`,
    });
  }
  revalidatePath("/admin/redemptions");
}

export default async function RedemptionsPage() {
  await requireAdmin();
  const sb = supabaseAdmin();
  const { data: rows } = await sb
    .from("payout_requests")
    .select("id, user_id, amount_inr, method, destination, status, created_at, user:users!payout_requests_user_id_fkey(name, email)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Coin Redemptions</h1>
      <p className="mt-2 text-ink-500">Queue of user withdrawal requests. Mark as paid after sending money via UPI/NEFT.</p>
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-sm min-w-[680px]">
          <thead className="bg-ink-50 text-ink-500 uppercase text-xs">
            <tr>
              <th className="px-5 py-3 text-left">User</th>
              <th className="px-5 py-3 text-right">Amount</th>
              <th className="px-5 py-3 text-left">Method</th>
              <th className="px-5 py-3 text-left">Destination</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Requested</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r: any) => (
              <tr key={r.id} className="border-t border-ink-100">
                <td className="px-5 py-3">
                  <p className="font-semibold">{r.user?.name}</p>
                  <p className="text-xs text-ink-500">{r.user?.email}</p>
                </td>
                <td className="px-5 py-3 text-right font-semibold">₹{Number(r.amount_inr).toLocaleString("en-IN")}</td>
                <td className="px-5 py-3 uppercase">{r.method}</td>
                <td className="px-5 py-3 font-mono text-xs">{r.destination}</td>
                <td className="px-5 py-3"><span className="badge">{r.status}</span></td>
                <td className="px-5 py-3 text-ink-500">{new Date(r.created_at).toLocaleString("en-IN")}</td>
                <td className="px-5 py-3 text-right">
                  {r.status === "queued" || r.status === "processing" ? (
                    <div className="flex gap-2 justify-end">
                      <form action={markFailed} className="inline">
                        <input type="hidden" name="id" value={r.id} />
                        <button className="btn-outline !py-1.5 !px-3 text-xs"><XCircle className="h-3.5 w-3.5" /> Fail</button>
                      </form>
                      <form action={markPaid} className="inline">
                        <input type="hidden" name="id" value={r.id} />
                        <button className="btn-primary !py-1.5 !px-3 text-xs"><CheckCircle2 className="h-3.5 w-3.5" /> Paid</button>
                      </form>
                    </div>
                  ) : "—"}
                </td>
              </tr>
            ))}
            {(!rows || rows.length === 0) && (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-ink-500">No redemption requests yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
