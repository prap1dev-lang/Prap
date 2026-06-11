-- =====================================================================
--  PRAP — ONE-SHOT SETUP for a fresh Supabase project.
--  Paste this ENTIRE FILE into Supabase SQL Editor and click Run.
--  Idempotent: safe to run twice.
--
--  Includes:
--   1. Core schema (users, projects, bookings, coin_ledger, payments, ...)
--   2. Surepass KYC migration (PAN / Aadhaar / RERA / bank columns)
--   3. Storage policies for the project-images bucket
-- =====================================================================

create extension if not exists "pgcrypto";

-- =====================================================================
--  1. CORE SCHEMA
-- =====================================================================
do $$ begin create type user_role  as enum ('broker','corporate','referrer','admin'); exception when duplicate_object then null; end $$;
do $$ begin create type kyc_status as enum ('pending','verified','rejected');         exception when duplicate_object then null; end $$;

create table if not exists users (
  id              uuid primary key default gen_random_uuid(),
  role            user_role  not null,
  name            text       not null,
  phone           text       not null unique,
  email           text       unique,
  pan             text       not null check (pan ~ '^[A-Z]{5}[0-9]{4}[A-Z]$'),
  aadhaar_hash    text       not null,
  aadhaar_last4   char(4)    not null,
  rera_number     text,
  photo_url       text,
  kyc_status      kyc_status not null default 'pending',
  rera_verified_at timestamptz,
  referred_by_corporate uuid references users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists users_role_idx on users(role);

create table if not exists referral_codes (
  id           uuid primary key default gen_random_uuid(),
  corporate_id uuid not null references users(id) on delete cascade,
  code         text not null unique,
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);
create index if not exists referral_codes_corp_idx on referral_codes(corporate_id);

do $$ begin create type project_status as enum ('new_launch','under_construction','ready_to_move'); exception when duplicate_object then null; end $$;

create table if not exists projects (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  builder       text not null,
  city          text not null,
  sector        text,
  rera_number   text not null unique,
  configurations text[] not null default '{}',
  starting_price_inr bigint not null default 0,
  max_price_inr      bigint not null default 0,
  possession    text,
  amenities     text[] not null default '{}',
  highlights    text[] not null default '{}',
  cover_url     text,
  gallery       text[] not null default '{}',
  description   text,
  status        project_status not null default 'under_construction',
  is_listed     boolean not null default true,
  created_at    timestamptz not null default now()
);
create index if not exists projects_city_idx on projects(city);

do $$ begin create type booking_status as enum ('scheduled','visited','cancelled','no_show','booked'); exception when duplicate_object then null; end $$;

create table if not exists bookings (
  id                 uuid primary key default gen_random_uuid(),
  project_id         uuid not null references projects(id) on delete restrict,
  broker_id          uuid references users(id),
  client_id          uuid not null references users(id),
  client_aadhaar_hash text not null,
  visits_completed   smallint not null default 0,
  scheduled_at       timestamptz not null,
  status             booking_status not null default 'scheduled',
  first_milestone_paid_at timestamptz,
  total_property_price_inr bigint,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (project_id, client_aadhaar_hash)
);
create index if not exists bookings_broker_idx on bookings(broker_id);
create index if not exists bookings_client_idx on bookings(client_id);

create table if not exists booking_family_members (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null references bookings(id) on delete cascade,
  name        text not null,
  aadhaar_last4 char(4) not null
);
create index if not exists bfm_booking_idx on booking_family_members(booking_id);

create table if not exists wallets (
  user_id           uuid primary key references users(id) on delete cascade,
  balance           bigint not null default 0,
  lifetime_earned   bigint not null default 0,
  lifetime_redeemed bigint not null default 0,
  updated_at        timestamptz not null default now()
);

do $$ begin create type coin_source as enum (
  'onboarding','visit_1','visit_2','visit_1_corporate','visit_2_corporate',
  'investment_bonus','milestone_discount','redemption','hold','release','admin_adjustment'
); exception when duplicate_object then null; end $$;

create table if not exists coin_ledger (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete restrict,
  source        coin_source not null,
  delta         bigint not null,
  balance_after bigint not null,
  ref_table     text,
  ref_id        uuid,
  notes         text,
  at            timestamptz not null default now()
);
create index if not exists ledger_user_idx on coin_ledger(user_id, at desc);

create or replace function sync_wallet_from_ledger()
returns trigger language plpgsql as $$
begin
  insert into wallets(user_id, balance, lifetime_earned, lifetime_redeemed, updated_at)
  values (new.user_id, new.balance_after,
          case when new.delta > 0 and new.source <> 'redemption' then new.delta else 0 end,
          case when new.source = 'redemption' then -new.delta else 0 end,
          now())
  on conflict (user_id) do update set
    balance = new.balance_after,
    lifetime_earned   = wallets.lifetime_earned
        + case when new.delta > 0 and new.source <> 'redemption' then new.delta else 0 end,
    lifetime_redeemed = wallets.lifetime_redeemed
        + case when new.source = 'redemption' then -new.delta else 0 end,
    updated_at = now();
  return new;
end; $$;
drop trigger if exists trg_sync_wallet on coin_ledger;
create trigger trg_sync_wallet after insert on coin_ledger
for each row execute function sync_wallet_from_ledger();

do $$ begin create type payment_status as enum ('created','captured','failed','refunded'); exception when duplicate_object then null; end $$;

create table if not exists payments (
  id                 uuid primary key default gen_random_uuid(),
  booking_id         uuid not null references bookings(id) on delete restrict,
  milestone_index    smallint not null check (milestone_index between 0 and 2),
  gross_amount_inr   bigint not null,
  coin_discount_inr  bigint not null default 0,
  net_amount_inr     bigint not null,
  rzp_order_id       text,
  rzp_payment_id     text,
  status             payment_status not null default 'created',
  captured_at        timestamptz,
  created_at         timestamptz not null default now(),
  unique (booking_id, milestone_index)
);
create index if not exists payments_booking_idx on payments(booking_id);

do $$ begin create type payout_status as enum ('queued','processing','paid','failed','cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type payout_method as enum ('upi','bank');                                       exception when duplicate_object then null; end $$;

create table if not exists payout_requests (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references users(id) on delete restrict,
  booking_id       uuid references bookings(id),
  amount_inr       bigint not null,
  method           payout_method not null,
  destination      text not null,
  status           payout_status not null default 'queued',
  rzp_payout_id    text,
  ledger_entry_id  uuid references coin_ledger(id),
  created_at       timestamptz not null default now(),
  paid_at          timestamptz
);
create index if not exists payouts_user_idx on payout_requests(user_id);

do $$ begin create type doc_kind as enum ('aadhaar','pan','photo','rera_cert'); exception when duplicate_object then null; end $$;

create table if not exists kyc_docs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  kind        doc_kind not null,
  storage_key text not null,
  verified    boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists otp_requests (
  id          uuid primary key default gen_random_uuid(),
  phone       text not null,
  otp_hash    text not null,
  expires_at  timestamptz not null,
  consumed_at timestamptz,
  attempts    smallint not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists otp_phone_idx on otp_requests(phone, created_at desc);

create table if not exists audit_log (
  id        uuid primary key default gen_random_uuid(),
  actor_id  uuid references users(id),
  action    text not null,
  payload   jsonb,
  at        timestamptz not null default now()
);

-- =====================================================================
--  2. SUREPASS KYC MIGRATION
-- =====================================================================
alter table users
  add column if not exists pan_verified         boolean not null default false,
  add column if not exists pan_verified_at      timestamptz,
  add column if not exists pan_full_name        text,
  add column if not exists aadhaar_verified     boolean not null default false,
  add column if not exists aadhaar_verified_at  timestamptz,
  add column if not exists aadhaar_full_name    text,
  add column if not exists rera_verified        boolean not null default false,
  add column if not exists rera_verified_at     timestamptz,
  add column if not exists rera_agent_name      text,
  add column if not exists bank_verified        boolean not null default false,
  add column if not exists upi_verified         boolean not null default false;

create table if not exists kyc_verifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references users(id) on delete cascade,
  kind        text not null,
  input       jsonb not null,
  ok          boolean not null,
  provider    text not null default 'surepass',
  response    jsonb,
  error       text,
  at          timestamptz not null default now()
);
create index if not exists kyc_verifications_user_idx on kyc_verifications(user_id, at desc);

create table if not exists aadhaar_otp_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  client_id   text not null,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '10 minutes',
  consumed    boolean not null default false
);
create index if not exists aadhaar_otp_user_idx on aadhaar_otp_sessions(user_id, created_at desc);

-- =====================================================================
--  3. STORAGE — public bucket for project images
--      Create the bucket in Dashboard → Storage first (name: project-images, PUBLIC).
--      Then these policies allow public read + admin-only writes.
-- =====================================================================
do $$ begin
  insert into storage.buckets (id, name, public)
  values ('project-images', 'project-images', true)
  on conflict (id) do nothing;
end $$;

drop policy if exists "public read project-images"   on storage.objects;
drop policy if exists "admins write project-images"  on storage.objects;
drop policy if exists "admins update project-images" on storage.objects;
drop policy if exists "admins delete project-images" on storage.objects;

create policy "public read project-images" on storage.objects
  for select using (bucket_id = 'project-images');

create policy "admins write project-images" on storage.objects
  for insert with check (
    bucket_id = 'project-images'
    and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

create policy "admins update project-images" on storage.objects
  for update using (
    bucket_id = 'project-images'
    and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

create policy "admins delete project-images" on storage.objects
  for delete using (
    bucket_id = 'project-images'
    and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

-- =====================================================================
--  4. ROW LEVEL SECURITY
-- =====================================================================
alter table users           enable row level security;
alter table bookings        enable row level security;
alter table coin_ledger     enable row level security;
alter table payments        enable row level security;
alter table payout_requests enable row level security;
alter table kyc_docs        enable row level security;

drop policy if exists users_self_read  on users;
drop policy if exists ledger_self_read on coin_ledger;
drop policy if exists bookings_party_read on bookings;

create policy users_self_read on users for select
  using (auth.uid() = id or exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin'));

create policy ledger_self_read on coin_ledger for select
  using (user_id = auth.uid() or exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin'));

create policy bookings_party_read on bookings for select
  using (broker_id = auth.uid() or client_id = auth.uid()
         or exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin'));

-- =====================================================================
--  6. PROJECTS — extended metadata column
--      The admin project-create form writes ~60 extra spec fields into a
--      single JSONB column. Without this, inserts fail with:
--      "Could not find the 'meta' column of 'projects' in the schema cache".
--      After running, reload PostgREST's cache: Dashboard → Settings → API
--      → "Reload schema cache" (or run: notify pgrst, 'reload schema';).
-- =====================================================================
alter table projects
  add column if not exists meta jsonb not null default '{}'::jsonb;

-- =====================================================================
--  7. REFERRAL & VISIT CREDITS — atomic, idempotent, abuse-resistant
-- =====================================================================

-- 7a. Track when a referral code was last rotated / who owns it (1 active code
--     per corporate). corporate_id already references users(id).
alter table referral_codes
  add column if not exists rotated_at timestamptz;

-- Only one ACTIVE code per corporate at a time (history preserved as inactive).
create unique index if not exists referral_codes_one_active_per_corp
  on referral_codes(corporate_id) where (active);

-- 7b. coin_ledger idempotency guard.
--     A given (user, source, ref_id) can be credited at most once, so retries /
--     double-submits / replays can never double-pay. ref_id = booking id for
--     visit credits; partial index ignores rows without a ref_id (e.g. onboarding).
create unique index if not exists coin_ledger_unique_ref
  on coin_ledger(user_id, source, ref_id) where (ref_id is not null);

-- 7c. visit_log: one authoritative row per (booking, visit_no). The unique
--     constraint is the hard idempotency boundary for the whole credit op.
create table if not exists visit_log (
  id            uuid primary key default gen_random_uuid(),
  booking_id    uuid not null references bookings(id) on delete cascade,
  visit_no      smallint not null check (visit_no between 1 and 10),
  attendees     text[] not null default '{}',
  confirmed_by  uuid references users(id),          -- admin who confirmed
  referrer_id   uuid references users(id),
  corporate_id  uuid references users(id),
  referrer_coins  bigint not null default 0,
  corporate_coins bigint not null default 0,
  created_at    timestamptz not null default now(),
  unique (booking_id, visit_no)
);
create index if not exists visit_log_booking_idx on visit_log(booking_id);

-- 7d. Atomic credit function. SECURITY DEFINER so it runs with table-owner
--     rights regardless of caller RLS; we still gate the HTTP route to admins.
--     Returns the credits applied. Raises 'already_credited' on replay.
create or replace function credit_visit(
  p_booking_id uuid,
  p_visit_no   smallint,
  p_attendees  text[],
  p_admin_id   uuid
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_referrer_id   uuid;
  v_corporate_id  uuid;
  v_ref_coins     bigint := 0;
  v_corp_coins    bigint := 0;
  v_ref_bal       bigint;
  v_corp_bal      bigint;
  v_self          boolean;
begin
  if array_length(p_attendees, 1) is null or array_length(p_attendees, 1) < 2 then
    raise exception 'min_attendees' using errcode = 'check_violation';
  end if;

  -- Resolve the referrer (booking client) and the corporate that referred them.
  select b.client_id, u.referred_by_corporate
    into v_referrer_id, v_corporate_id
  from bookings b
  join users u on u.id = b.client_id
  where b.id = p_booking_id;

  if v_referrer_id is null then
    raise exception 'booking_not_found' using errcode = 'no_data_found';
  end if;

  -- Self-referral guard: a corporate must never be its own referrer.
  v_self := (v_corporate_id is not null and v_corporate_id = v_referrer_id);
  if v_self then
    v_corporate_id := null;  -- silently drop the corporate cut, still credit referrer
  end if;

  -- Coin rules (mirror lib/coins.ts): visits 1 & 2 pay; 3+ pay nothing.
  if p_visit_no in (1, 2) then
    v_ref_coins  := 10000;
    v_corp_coins := case when v_corporate_id is not null then 5000 else 0 end;
  end if;

  -- Idempotency boundary: this insert fails on replay (unique booking,visit_no).
  insert into visit_log(booking_id, visit_no, attendees, confirmed_by,
                        referrer_id, corporate_id, referrer_coins, corporate_coins)
  values (p_booking_id, p_visit_no, p_attendees, p_admin_id,
          v_referrer_id, v_corporate_id, v_ref_coins, v_corp_coins);

  -- Credit referrer.
  if v_ref_coins > 0 then
    select coalesce(balance, 0) into v_ref_bal from wallets where user_id = v_referrer_id;
    insert into coin_ledger(user_id, source, delta, balance_after, ref_table, ref_id, notes)
    values (v_referrer_id,
            ('visit_' || p_visit_no)::coin_source,
            v_ref_coins, coalesce(v_ref_bal,0) + v_ref_coins,
            'bookings', p_booking_id,
            'Site visit ' || p_visit_no || ' bonus');
  end if;

  -- Credit corporate.
  if v_corp_coins > 0 then
    select coalesce(balance, 0) into v_corp_bal from wallets where user_id = v_corporate_id;
    insert into coin_ledger(user_id, source, delta, balance_after, ref_table, ref_id, notes)
    values (v_corporate_id,
            ('visit_' || p_visit_no || '_corporate')::coin_source,
            v_corp_coins, coalesce(v_corp_bal,0) + v_corp_coins,
            'bookings', p_booking_id,
            'Referral visit ' || p_visit_no || ' bonus');
  end if;

  update bookings
    set visits_completed = greatest(visits_completed, p_visit_no),
        status = case when status = 'scheduled' then 'visited' else status end,
        updated_at = now()
  where id = p_booking_id;

  return jsonb_build_object(
    'booking_id', p_booking_id,
    'visit_no', p_visit_no,
    'referrer_id', v_referrer_id,
    'referrer_coins', v_ref_coins,
    'corporate_id', v_corporate_id,
    'corporate_coins', v_corp_coins,
    'self_referral_blocked', v_self
  );
exception
  when unique_violation then
    raise exception 'already_credited' using errcode = 'unique_violation';
end;
$$;

revoke all on function credit_visit(uuid, smallint, text[], uuid) from public, anon, authenticated;

notify pgrst, 'reload schema';

-- Done. You can now run the app.
