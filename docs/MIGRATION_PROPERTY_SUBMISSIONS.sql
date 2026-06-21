-- =====================================================================
--  MIGRATION: public "List your property" submissions.
--  Stores owner-submitted property leads for admin review. Safe to re-run.
-- =====================================================================

create table if not exists property_submissions (
  id            uuid primary key default gen_random_uuid(),
  property_type text not null,                 -- 'Residential' | 'Commercial'
  sub_type      text,                          -- e.g. 'Flat / Apartment'
  owner_name    text not null,
  phone         text not null,
  email         text,
  city          text,
  locality      text,
  config        text,                          -- e.g. '3 BHK + Study'
  area          text,                          -- super/built-up area
  price         text,                          -- expected price (free text)
  details       jsonb not null default '{}'::jsonb,
  status        text not null default 'new',   -- new | contacted | listed | rejected
  created_at    timestamptz not null default now()
);
create index if not exists property_submissions_status_idx on property_submissions(status, created_at desc);

-- RLS: only the service role / admins read these; no public read.
alter table property_submissions enable row level security;
