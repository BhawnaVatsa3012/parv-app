-- Parv exit survey: one optional answer when a member cancels.
-- Run once in the Supabase SQL editor. Safe to re-run.
-- The app works without this table (the survey answer is simply dropped),
-- so it can be applied at any time.

create table if not exists public.parv_cancel_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text check (reason in ('too_expensive','not_using','missing_content','found_alternative','other')),
  comment text check (char_length(comment) <= 300),
  created_at timestamptz not null default now(),
  check (reason is not null or comment is not null)
);

create index if not exists parv_cancel_feedback_user_idx on public.parv_cancel_feedback(user_id);

alter table public.parv_cancel_feedback enable row level security;

-- Signed-in users can add their own row. There is deliberately NO select,
-- update or delete policy: nobody can read answers through the app's API
-- (read them in the Supabase dashboard / with the service role).
drop policy if exists "insert own cancel feedback" on public.parv_cancel_feedback;
create policy "insert own cancel feedback"
  on public.parv_cancel_feedback
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- Belt and braces: anon gets nothing; authenticated gets insert only.
revoke all on public.parv_cancel_feedback from anon, authenticated;
grant insert on public.parv_cancel_feedback to authenticated;
