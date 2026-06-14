import "server-only";
import { supabaseAdmin } from "@/lib/supabase-server";
import { destroyCloudinaryUrl } from "@/lib/cloudinary";

/**
 * Hard-delete a user and every record tied to them.
 *
 * Several FKs to public.users use `on delete restrict` (coin_ledger,
 * payout_requests) or have no cascade (bookings, referred_by_corporate,
 * audit_log.actor_id), so we cannot rely on a single cascade. We tear the
 * graph down in dependency order, then remove the profile row and finally
 * the Supabase auth user (which frees the phone/email for re-signup).
 *
 * public.users.id === the Supabase auth user id (set at signup), so the
 * same id is used for both.
 */
export async function deleteUserCompletely(userId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const sb = supabaseAdmin();

  // 0. Guard: never let an admin delete an admin (or themselves) via this path.
  const { data: target } = await sb.from("users").select("id, role").eq("id", userId).maybeSingle();
  if (!target) return { ok: false, error: "User not found." };
  if (target.role === "admin") return { ok: false, error: "Admin accounts cannot be deleted here." };

  try {
    // 1. Detach references that would otherwise block the delete.
    //    Referrers who were referred by this (corporate) user.
    await sb.from("users").update({ referred_by_corporate: null }).eq("referred_by_corporate", userId);
    //    Audit actor pointer (nullable, no cascade).
    await sb.from("audit_log").update({ actor_id: null }).eq("actor_id", userId);

    // 2. Delete rows that reference the user with restrict / no-cascade.
    await sb.from("payout_requests").delete().eq("user_id", userId);
    await sb.from("coin_ledger").delete().eq("user_id", userId);
    await sb.from("bookings").delete().eq("broker_id", userId);
    await sb.from("bookings").delete().eq("client_id", userId);

    // 3. Cascade-backed tables — deleting the user row would clear these,
    //    but we remove them explicitly so the order is deterministic.
    //    Purge the actual Cloudinary files first (best-effort).
    const { data: userDocs } = await sb.from("kyc_docs").select("storage_key").eq("user_id", userId);
    for (const d of userDocs ?? []) {
      if (d.storage_key) await destroyCloudinaryUrl(d.storage_key);
    }
    await sb.from("kyc_docs").delete().eq("user_id", userId);
    await sb.from("kyc_verifications").delete().eq("user_id", userId);
    await sb.from("aadhaar_otp_sessions").delete().eq("user_id", userId);
    await sb.from("referral_codes").delete().eq("corporate_id", userId);
    await sb.from("wallets").delete().eq("user_id", userId);

    // 4. The profile row itself.
    const { error: profileErr } = await sb.from("users").delete().eq("id", userId);
    if (profileErr) return { ok: false, error: profileErr.message };

    // 5. The Supabase auth user (best-effort — frees phone/email).
    const { error: authErr } = await sb.auth.admin.deleteUser(userId);
    if (authErr && !/not found/i.test(authErr.message)) {
      return { ok: false, error: `Profile removed, but auth user delete failed: ${authErr.message}` };
    }

    // 6. Audit trail.
    await sb.from("audit_log").insert({
      action: "user_deleted",
      payload: { user_id: userId, role: target.role },
    });

    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Deletion failed." };
  }
}
