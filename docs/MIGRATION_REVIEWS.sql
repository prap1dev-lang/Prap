-- Customer reviews for projects.
-- Admins add reviews from the admin panel; they display on the public project
-- page. Run this in the Supabase SQL editor.

create table if not exists public.project_reviews (
  id          uuid primary key default gen_random_uuid(),
  project_slug text not null,
  author_name  text not null,
  rating       int  not null check (rating between 1 and 5),
  body         text not null,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);

create index if not exists project_reviews_slug_idx
  on public.project_reviews (project_slug, created_at desc);

-- RLS: public can read published reviews; writes go through the service role
-- (admin server actions), so no public insert policy is needed.
alter table public.project_reviews enable row level security;

drop policy if exists "public read published reviews" on public.project_reviews;
create policy "public read published reviews"
  on public.project_reviews for select
  using (is_published = true);
