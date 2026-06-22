-- =====================================================================
--  MIGRATION: contact / callback queries.
--  Stores every "Request a callback" / enquiry submitted from the public
--  contact form, for admin review. Safe to re-run.
-- =====================================================================

create table if not exists queries (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  phone         text,
  email         text,
  intent        text,                          -- the "I want to…" option
  message       text,
  project_slug  text,                          -- set when enquiring about a project
  status        text not null default 'new',   -- new | contacted | closed
  created_at    timestamptz not null default now()
);
create index if not exists queries_status_idx on queries(status, created_at desc);

-- RLS: only the service role / admins read these; no public read.
alter table queries enable row level security;
