import "server-only";
import { supabaseAdmin } from "@/lib/supabase-server";
import { genReferralCode } from "@/lib/utils";

type Admin = ReturnType<typeof supabaseAdmin>;

/**
 * Referral helpers — any user (broker / corporate / referrer) can own a code
 * and refer anyone. `referral_codes.corporate_id` is reused as a generic
 * owner id (see MIGRATION_REFERRALS_BOOKINGS.sql).
 */

/** Return the caller's active referral code, creating one if absent. */
export async function ensureReferralCode(ownerId: string): Promise<string> {
  const admin = supabaseAdmin();
  const { data: existing } = await admin
    .from("referral_codes")
    .select("code")
    .eq("corporate_id", ownerId)
    .eq("active", true)
    .maybeSingle();
  if (existing?.code) return existing.code;

  for (let attempt = 0; attempt < 4; attempt++) {
    const code = genReferralCode();
    const { error } = await admin
      .from("referral_codes")
      .insert({ corporate_id: ownerId, code, active: true });
    if (!error) return code;
    if ((error as any).code !== "23505") throw error;
    // collision or a concurrently-created active row — re-read
    const { data: race } = await admin
      .from("referral_codes")
      .select("code")
      .eq("corporate_id", ownerId)
      .eq("active", true)
      .maybeSingle();
    if (race?.code) return race.code;
  }
  throw new Error("Could not allocate a referral code");
}

export type ReferralOwner = {
  id: string;
  role: string;
  pan: string | null;
  phone: string | null;
};

/** Look up the owner of an active referral code (any role). */
export async function lookupReferralOwner(code: string): Promise<ReferralOwner | null> {
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("referral_codes")
    .select("corporate_id, owner:users!referral_codes_corporate_id_fkey ( id, role, pan, phone )")
    .eq("code", code.trim().toUpperCase())
    .eq("active", true)
    .maybeSingle();
  const owner = (data as any)?.owner;
  return owner ?? null;
}

/**
 * Credit coins to a user via the append-only ledger. Reads the current
 * balance, computes balance_after, inserts a ledger row (a DB trigger syncs
 * the wallet). Safe to call best-effort.
 */
export async function creditCoins(
  admin: Admin,
  userId: string,
  delta: number,
  source: string,
  opts: { notes?: string; refTable?: string; refId?: string } = {},
): Promise<void> {
  const { data: wallet } = await admin
    .from("wallets")
    .select("balance")
    .eq("user_id", userId)
    .maybeSingle();
  const current = Number(wallet?.balance ?? 0);
  const balanceAfter = current + delta;

  const { error } = await admin.from("coin_ledger").insert({
    user_id: userId,
    source,
    delta,
    balance_after: balanceAfter,
    ref_table: opts.refTable ?? null,
    ref_id: opts.refId ?? null,
    notes: opts.notes ?? null,
  });
  if (error) throw error;
}
