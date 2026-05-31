-- =====================================================================
--  Migration: Surepass KYC verification fields
--  Run AFTER docs/DATABASE_SCHEMA.sql. Idempotent.
-- =====================================================================

-- 1. Add per-user verification flags + raw response JSONB.
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

-- 2. Surepass call audit (one row per API call — debug / dispute trail).
create table if not exists kyc_verifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references users(id) on delete cascade,
  kind        text not null,                  -- 'pan' | 'aadhaar_otp' | 'rera_agent' | 'rera_project' | 'bank' | 'upi'
  input       jsonb not null,                 -- minimal redacted input (e.g. PAN, masked Aadhaar)
  ok          boolean not null,
  provider    text not null default 'surepass',
  response    jsonb,                          -- raw response body (already returned by provider)
  error       text,
  at          timestamptz not null default now()
);
create index if not exists kyc_verifications_user_idx on kyc_verifications(user_id, at desc);

-- 3. Ephemeral Aadhaar OTP session (we never persist Aadhaar; only Surepass client_id + expiry).
create table if not exists aadhaar_otp_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  client_id   text not null,                  -- Surepass session id
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '10 minutes',
  consumed    boolean not null default false
);
create index if not exists aadhaar_otp_user_idx on aadhaar_otp_sessions(user_id, created_at desc);

-- 4. Convenience view: who's fully verified?
create or replace view user_kyc_completeness as
select
  u.id,
  u.role,
  u.pan_verified,
  u.aadhaar_verified,
  u.rera_verified,
  (u.pan_verified
    and u.aadhaar_verified
    and (u.role <> 'broker' or u.rera_verified)) as fully_verified
from users u;
