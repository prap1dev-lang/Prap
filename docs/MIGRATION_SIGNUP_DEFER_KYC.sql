-- ============================================================
-- MIGRATION: Defer KYC to dashboard + creator social profiles
-- Run once in the Supabase SQL editor (idempotent).
--
-- 1. PAN / Aadhaar are no longer collected at signup (moved to the KYC section
--    in the dashboard), so relax their NOT NULL constraints.
-- 2. Add optional creator social-profile columns (Instagram/Facebook/YouTube).
-- ============================================================

-- 1. Allow signup without identity docs — completed later during KYC.
alter table users alter column pan           drop not null;
alter table users alter column aadhaar_hash  drop not null;
alter table users alter column aadhaar_last4 drop not null;

-- 2. Creator social links.
alter table users add column if not exists instagram text;
alter table users add column if not exists facebook  text;
alter table users add column if not exists youtube   text;
