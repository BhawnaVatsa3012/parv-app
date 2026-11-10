-- Razorpay webhook ordering guard: timestamp of the newest event applied to
-- a subscription row. Nullable on purpose: existing rows (including the
-- manual owner grant) stay valid with NULL, and a NULL row accepts any event.
alter table public.subscriptions
  add column if not exists last_event_at timestamptz;
