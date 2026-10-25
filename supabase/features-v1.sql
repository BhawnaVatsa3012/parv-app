-- Parv features v1: profile (city, name, family), checklists, family traditions.
-- Every table: each signed-in user can only read and write their own rows (RLS).

create table if not exists public.parv_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text check (char_length(name) <= 80),
  city_id text check (char_length(city_id) <= 60),
  city_name text check (char_length(city_name) <= 80),
  state text check (char_length(state) <= 60),
  country text check (char_length(country) <= 60),
  lat double precision check (lat between -90 and 90),
  lon double precision check (lon between -180 and 180),
  tz text check (char_length(tz) <= 60),
  community text check (char_length(community) <= 120),
  languages text check (char_length(languages) <= 120),
  followed text[] not null default '{}',
  nudge_email boolean not null default false,
  daily_email boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.parv_checklists (
  user_id uuid not null references auth.users(id) on delete cascade,
  festival_id text not null check (char_length(festival_id) <= 40),
  year int not null check (year between 2024 and 2100),
  done text[] not null default '{}',
  custom jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, festival_id, year)
);

create table if not exists public.parv_family_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  festival_id text not null check (char_length(festival_id) <= 40),
  ritual_index int not null default 0,
  step_index int,
  note text not null check (char_length(note) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists parv_family_notes_user_idx on public.parv_family_notes(user_id, festival_id);

create table if not exists public.parv_family_rituals (
  user_id uuid not null references auth.users(id) on delete cascade,
  festival_id text not null check (char_length(festival_id) <= 40),
  ritual_index int not null default 0,
  steps jsonb not null,
  samagri jsonb not null default '[]'::jsonb,
  approved_at timestamptz not null default now(),
  primary key (user_id, festival_id, ritual_index)
);

-- Nudge log so each reminder is emailed only once.
create table if not exists public.parv_nudges_sent (
  user_id uuid not null references auth.users(id) on delete cascade,
  festival_id text not null,
  year int not null,
  days_before int not null,
  sent_at timestamptz not null default now(),
  primary key (user_id, festival_id, year, days_before)
);

alter table public.parv_profiles enable row level security;
alter table public.parv_checklists enable row level security;
alter table public.parv_family_notes enable row level security;
alter table public.parv_family_rituals enable row level security;
alter table public.parv_nudges_sent enable row level security;

do $$
declare t text;
begin
  foreach t in array array['parv_profiles','parv_checklists','parv_family_notes','parv_family_rituals'] loop
    execute format('drop policy if exists "own rows select" on public.%I', t);
    execute format('drop policy if exists "own rows insert" on public.%I', t);
    execute format('drop policy if exists "own rows update" on public.%I', t);
    execute format('drop policy if exists "own rows delete" on public.%I', t);
    execute format('create policy "own rows select" on public.%I for select to authenticated using ((select auth.uid()) = user_id)', t);
    execute format('create policy "own rows insert" on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)', t);
    execute format('create policy "own rows update" on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
    execute format('create policy "own rows delete" on public.%I for delete to authenticated using ((select auth.uid()) = user_id)', t);
  end loop;
end $$;
-- parv_nudges_sent has no policies: only the server (service role, in the cron job) touches it.

drop trigger if exists parv_profiles_set_updated_at on public.parv_profiles;
create trigger parv_profiles_set_updated_at before update on public.parv_profiles
  for each row execute function public.set_updated_at();
drop trigger if exists parv_checklists_set_updated_at on public.parv_checklists;
create trigger parv_checklists_set_updated_at before update on public.parv_checklists
  for each row execute function public.set_updated_at();
