-- ============================================================
-- MIGRATION: Email suppression list (unsubscribes / hard bounces)
-- Run once in the Supabase SQL editor (idempotent).
--
-- Powers the List-Unsubscribe one-click endpoint and lets the mailer skip
-- addresses that opted out of marketing email. Transactional mail (receipts,
-- password resets, payout confirmations) is sent regardless and is NOT gated
-- on this table.
-- ============================================================

create table if not exists email_optouts (
  email       text primary key,
  reason      text,                       -- 'unsubscribe' | 'bounce' | 'complaint'
  created_at  timestamptz not null default now()
);
