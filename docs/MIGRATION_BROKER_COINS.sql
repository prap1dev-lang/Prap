-- =====================================================================
--  MIGRATION: broker coin programme.
--  Adds the new ledger sources and broker client-slot tracking.
--
--  NOTE: `ALTER TYPE ... ADD VALUE` cannot run inside a transaction block.
--  Run each ADD VALUE on its own. `IF NOT EXISTS` makes re-runs safe.
-- =====================================================================

alter type coin_source add value if not exists 'broker_view_bonus';
alter type coin_source add value if not exists 'broker_deal_close';

-- Broker client-slot tracking.
--   broker_slots_total : total client slots granted (starts at 5, +5 per 5 deals)
--   broker_slots_used  : slots consumed by crediting a client property view
--   broker_deals_closed: lifetime closed deals (drives slot refills)
alter table users add column if not exists broker_slots_total   int not null default 5;
alter table users add column if not exists broker_slots_used     int not null default 0;
alter table users add column if not exists broker_deals_closed   int not null default 0;
