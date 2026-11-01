-- ByteBuddy dedicated Supabase server. Use ONLY in its independent project.
create table if not exists public.bytebuddy_push_devices (
 device_id uuid primary key,
 secret_hash text not null,
 subscription jsonb not null,
 snapshot jsonb not null default '{}'::jsonb,
 enabled boolean not null default true,
 last_seen_at timestamptz not null default now(),
 last_sent_at timestamptz,
 last_test_at timestamptz,
 next_check_at timestamptz not null default now()+ interval '20 minutes',
 daily_date date,
 daily_count integer not null default 0,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists bytebuddy_push_due_idx on public.bytebuddy_push_devices(next_check_at) where enabled;
alter table public.bytebuddy_push_devices enable row level security;
revoke all on public.bytebuddy_push_devices from public, anon, authenticated;
grant select, insert, update, delete on public.bytebuddy_push_devices to service_role;

-- Generated on first server request by the Edge Function. Never commit the generated credentials.
create table if not exists public.bytebuddy_push_settings (
 id boolean primary key default true check(id),
 vapid_public text not null,
 vapid_private text not null,
 cron_token text not null,
 created_at timestamptz not null default now()
);
alter table public.bytebuddy_push_settings enable row level security;
revoke all on public.bytebuddy_push_settings from public, anon, authenticated;
grant select, insert on public.bytebuddy_push_settings to service_role;
