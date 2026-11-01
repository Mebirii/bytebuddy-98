-- ByteBuddy Push: intended for its own dedicated Supabase project.
create table if not exists public.bytebuddy_push_devices (
  device_id uuid primary key,
  secret_hash text not null,
  subscription jsonb not null,
  snapshot jsonb not null default '{}'::jsonb,
  enabled boolean not null default true,
  last_seen_at timestamptz not null default now(),
  last_sent_at timestamptz,
  last_test_at timestamptz,
  next_check_at timestamptz not null default now() + interval '20 minutes',
  daily_date date,
  daily_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists bytebuddy_push_due_idx
  on public.bytebuddy_push_devices (next_check_at) where enabled;
alter table public.bytebuddy_push_devices enable row level security;
-- No anon/authenticated access; only the Edge Function service-role can read/write.
revoke all on table public.bytebuddy_push_devices from public, anon, authenticated;
grant all on table public.bytebuddy_push_devices to service_role;
