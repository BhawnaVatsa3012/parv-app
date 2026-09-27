-- Parv monetization: subscriptions table + RLS
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('razorpay', 'dodo')),
  provider_subscription_id text not null,
  status text not null check (status in ('active', 'on_hold', 'cancelled', 'expired')),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_subscription_id)
);

create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);

alter table public.subscriptions enable row level security;

-- Browser (anon/authenticated) can only ever read its own row(s).
create policy "read own subscription"
  on public.subscriptions
  for select
  using (auth.uid() = user_id);

-- No insert/update/delete policies for anon/authenticated: only the
-- service-role key (used exclusively in webhook handlers, never shipped
-- to the client) bypasses RLS and can write to this table.

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();
