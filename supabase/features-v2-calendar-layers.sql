-- Parv features v2: which calendar layers a user wants to see.
-- null  = no choice made yet (the app keeps showing the Hindu Panchang, as before).
-- '{}'  = the user chose no extra layers.
-- Ids are validated by the app (lib/layers.js); the table only caps the size.
-- Row-level security already covers this column: parv_profiles has the
-- "own rows" select/insert/update/delete policies from features-v1.sql.

alter table public.parv_profiles
  add column if not exists calendar_layers text[] default null
  check (calendar_layers is null or cardinality(calendar_layers) <= 8);
