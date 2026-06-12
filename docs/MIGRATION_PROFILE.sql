-- ============================================================
-- MIGRATION: Editable profile / payout fields on users
-- Run once in the Supabase SQL editor (idempotent).
-- ============================================================

alter table users
  add column if not exists upi_id       text,
  add column if not exists bank_account text,
  add column if not exists bank_ifsc    text;
