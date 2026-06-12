-- ============================================================
-- MIGRATION: Universal referrals + self-serve bookings
-- Run once in the Supabase SQL editor (idempotent).
-- ============================================================

-- 1. Generic "who referred this user" pointer (any role can refer anyone).
--    referred_by_corporate stays for corporate/employer attribution & reporting.
alter table users
  add column if not exists referred_by uuid references users(id);

create index if not exists users_referred_by_idx on users(referred_by);

-- 2. referral_codes.corporate_id historically meant "the corporate that owns
--    this code". We now let ANY user own a code, so the column is reused as a
--    generic owner id. (Column name kept to avoid breaking existing queries.)
--    Drop the old "must be a corporate" assumption if a CHECK ever enforced it.
--    (No structural change needed — corporate_id already references users(id).)

-- 2b. referral_codes: support code rotation + enforce one active code per owner.
alter table referral_codes
  add column if not exists rotated_at timestamptz;

create unique index if not exists referral_codes_one_active_per_owner
  on referral_codes(corporate_id) where active;

-- 3. Bookings: capture who initiated a self-serve booking and a human ref code.
alter table bookings
  add column if not exists ref_code      text,
  add column if not exists created_by    uuid references users(id),
  add column if not exists notes         text;

-- 4. Allow the coin ledger to record referral credits.
--    (coin_source is an enum; add the value if missing.)
do $$
begin
  if not exists (
    select 1 from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'coin_source' and e.enumlabel = 'referral_bonus'
  ) then
    alter type coin_source add value 'referral_bonus';
  end if;
end $$;
