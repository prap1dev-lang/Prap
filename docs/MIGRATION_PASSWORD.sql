-- ============================================================
-- MIGRATION: account password tracking
-- Run once in the Supabase SQL editor (idempotent).
--
-- The actual password lives in Supabase Auth (auth.users.encrypted_password,
-- bcrypt). We ONLY track whether one is set, for the admin panel — the
-- plaintext is never stored anywhere.
-- ============================================================

alter table users
  add column if not exists has_password   boolean not null default false,
  add column if not exists password_set_at timestamptz;
