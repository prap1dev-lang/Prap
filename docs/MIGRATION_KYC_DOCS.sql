-- ============================================================
-- MIGRATION: Aadhaar/PAN front & back document kinds
-- Run once in the Supabase SQL editor (idempotent).
-- ============================================================

-- Add front/back variants to the doc_kind enum. The old single 'aadhaar' /
-- 'pan' values are kept for backwards compatibility.
do $$
declare
  v text;
begin
  foreach v in array array['aadhaar_front','aadhaar_back','pan_front','pan_back']
  loop
    if not exists (
      select 1 from pg_enum e
      join pg_type t on t.oid = e.enumtypid
      where t.typname = 'doc_kind' and e.enumlabel = v
    ) then
      execute format('alter type doc_kind add value %L', v);
    end if;
  end loop;
end $$;
