-- =====================================================================
--  PRAP — Property Referral Award Platform
--  PostgreSQL schema for Supabase. Run in order.
--  Conventions:
--   * All timestamps in UTC (TIMESTAMPTZ).
--   * Money in paise / coin (BIGINT) to avoid FP errors.
--   * Aadhaar is NEVER stored plaintext — only SHA-256 hash + last 4 digits.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- 1. USERS ----------
create type user_role  as enum ('broker', 'corporate', 'referrer', 'admin');
create type kyc_status as enum ('pending', 'verified', 'rejected');

create table users (
  id              uuid primary key default gen_random_uuid(),
  role            user_role  not null,
  name            text       not null,
  phone           text       not null unique,
  email           text       unique,
  pan             text       not null check (pan ~ '^[A-Z]{5}[0-9]{4}[A-Z]$'),
  aadhaar_hash    text       not null,          -- SHA-256 of full Aadhaar
  aadhaar_last4   char(4)    not null,
  rera_number     text,                          -- brokers only
  photo_url       text,
  kyc_status      kyc_status not null default 'pending',
  rera_verified_at timestamptz,
  referred_by_corporate uuid references users(id), -- if role='referrer'
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index users_role_idx on users(role);

-- ---------- 2. REFERRAL CODES (Corporates) ----------
create table referral_codes (
  id           uuid primary key default gen_random_uuid(),
  corporate_id uuid not null references users(id) on delete cascade,
  code         text not null unique,
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);
create index referral_codes_corp_idx on referral_codes(corporate_id);

-- ---------- 3. PROJECTS ----------
create type project_status as enum ('new_launch', 'under_construction', 'ready_to_move');

create table projects (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  builder       text not null,
  city          text not null,
  sector        text not null,
  rera_number   text not null unique,
  configurations text[] not null,
  starting_price_inr bigint not null,
  max_price_inr      bigint not null,
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
create index projects_city_idx on projects(city);

-- ---------- 4. BOOKINGS (with Aadhaar lock-in) ----------
create type booking_status as enum ('scheduled', 'visited', 'cancelled', 'no_show', 'booked');

create table bookings (
  id                 uuid primary key default gen_random_uuid(),
  project_id         uuid not null references projects(id) on delete restrict,
  broker_id          uuid references users(id),                 -- nullable: direct referrer booking
  client_id          uuid not null references users(id),
  client_aadhaar_hash text not null,                            -- SHA-256 of client's Aadhaar
  visits_completed   smallint not null default 0,
  scheduled_at       timestamptz not null,
  status             booking_status not null default 'scheduled',
  first_milestone_paid_at timestamptz,                          -- UNLOCKS coin redemption when set
  total_property_price_inr bigint,                              -- captured at booking
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  -- THE LOCK-IN RULE: one (project, client_aadhaar) pair can only exist once.
  unique (project_id, client_aadhaar_hash)
);
create index bookings_broker_idx on bookings(broker_id);
create index bookings_client_idx on bookings(client_id);

-- ---------- 5. BOOKING FAMILY MEMBERS ----------
create table booking_family_members (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null references bookings(id) on delete cascade,
  name        text not null,
  aadhaar_last4 char(4) not null
);
create index bfm_booking_idx on booking_family_members(booking_id);

-- Enforce: minimum 2 family members per booking via DB-level trigger.
create or replace function enforce_min_family_members()
returns trigger language plpgsql as $$
begin
  if (select count(*) from booking_family_members where booking_id = new.booking_id) < 2 then
    raise exception 'A booking must include at least 2 family members';
  end if;
  return new;
end; $$;
-- Trigger should run when *visits* are marked completed (see visits table below).

-- ---------- 6. WALLETS ----------
create table wallets (
  user_id           uuid primary key references users(id) on delete cascade,
  balance           bigint not null default 0,
  lifetime_earned   bigint not null default 0,
  lifetime_redeemed bigint not null default 0,
  updated_at        timestamptz not null default now()
);

-- ---------- 7. COIN LEDGER (append-only, source of truth) ----------
create type coin_source as enum (
  'onboarding',
  'visit_1', 'visit_2',                          -- referrer credits
  'visit_1_corporate', 'visit_2_corporate',      -- corporate credits
  'investment_bonus',
  'milestone_discount',                          -- spent as discount
  'redemption',                                  -- debit to bank/UPI
  'hold', 'release',                             -- reservation lifecycle
  'admin_adjustment'
);

create table coin_ledger (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete restrict,
  source        coin_source not null,
  delta         bigint not null,                 -- signed: + credit, - debit
  balance_after bigint not null,
  ref_table     text,                            -- e.g. 'bookings', 'payments'
  ref_id        uuid,
  notes         text,
  at            timestamptz not null default now()
);
create index ledger_user_idx on coin_ledger(user_id, at desc);

-- Trigger: keep wallets in sync with ledger.
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

create trigger trg_sync_wallet
after insert on coin_ledger
for each row execute function sync_wallet_from_ledger();

-- ---------- 8. PAYMENTS (real money — milestones) ----------
create type payment_status as enum ('created', 'captured', 'failed', 'refunded');

create table payments (
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
create index payments_booking_idx on payments(booking_id);

-- ---------- 9. PAYOUT REQUESTS (Coin Redemptions) ----------
create type payout_status as enum ('queued', 'processing', 'paid', 'failed', 'cancelled');
create type payout_method as enum ('upi', 'bank');

create table payout_requests (
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
create index payouts_user_idx on payout_requests(user_id);

-- ---------- 10. KYC DOCS (object storage refs) ----------
create type doc_kind as enum ('aadhaar', 'pan', 'photo', 'rera_cert');

create table kyc_docs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  kind        doc_kind not null,
  storage_key text not null,
  verified    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ---------- 11. OTP REQUESTS ----------
create table otp_requests (
  id          uuid primary key default gen_random_uuid(),
  phone       text not null,
  otp_hash    text not null,                 -- bcrypt
  expires_at  timestamptz not null,
  consumed_at timestamptz,
  attempts    smallint not null default 0,
  created_at  timestamptz not null default now()
);
create index otp_phone_idx on otp_requests(phone, created_at desc);

-- ---------- 12. AUDIT LOG ----------
create table audit_log (
  id        uuid primary key default gen_random_uuid(),
  actor_id  uuid references users(id),
  action    text not null,
  payload   jsonb,
  at        timestamptz not null default now()
);

-- ---------- ROW LEVEL SECURITY (Supabase) ----------
alter table users enable row level security;
alter table bookings enable row level security;
alter table coin_ledger enable row level security;
alter table payments enable row level security;
alter table payout_requests enable row level security;
alter table kyc_docs enable row level security;

-- Example RLS: users can read only their own row; admins read all.
create policy users_self_read on users for select
  using (auth.uid() = id or exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin'));

create policy ledger_self_read on coin_ledger for select
  using (user_id = auth.uid() or exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin'));

create policy bookings_party_read on bookings for select
  using (broker_id = auth.uid() or client_id = auth.uid()
         or exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin'));
