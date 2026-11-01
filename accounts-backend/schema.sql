-- BYTEBUDDY '98 · V0.13 · Dedicated database setup.
-- Apply ONLY to a new, dedicated ByteBuddy Supabase project.
-- Player profile and save data; client-uploaded stats are NOT ranked-authoritative.

create table if not exists public.trainer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  handle text not null unique
    check (handle ~ '^[a-z][a-z0-9_]{2,19}$' and handle = lower(handle)),
  display_name text not null check (char_length(display_name) between 3 and 28),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trainer_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null
    check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 200000),
  revision integer not null default 1 check (revision between 1 and 2147483646),
  updated_at timestamptz not null default now()
);
create index if not exists trainer_profiles_handle_idx
  on public.trainer_profiles(handle);

-- The owner controls their own account and cloud save only.
alter table public.trainer_profiles enable row level security;
alter table public.trainer_saves enable row level security;

revoke all on public.trainer_profiles from anon;
revoke all on public.trainer_saves from anon;
grant select, insert, update, delete on public.trainer_profiles to authenticated;
grant select, insert, update, delete on public.trainer_saves to authenticated;

create policy "trainer_profiles_select_self" on public.trainer_profiles
for select to authenticated using (user_id = (select auth.uid()));

create policy "trainer_profiles_insert_self" on public.trainer_profiles
for insert to authenticated with check (user_id = (select auth.uid()));

create policy "trainer_profiles_update_self" on public.trainer_profiles
for update to authenticated using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "trainer_saves_select_self" on public.trainer_saves
for select to authenticated using (user_id = (select auth.uid()));

create policy "trainer_saves_insert_self" on public.trainer_saves
for insert to authenticated with check (user_id = (select auth.uid()));

create policy "trainer_saves_update_self" on public.trainer_saves
for update to authenticated using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

-- Server-assigned timestamps, not editable by app data.
create or replace function public.bytebuddy_touch_updated_at()
returns trigger language plpgsql security invoker
set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke execute on function public.bytebuddy_touch_updated_at() from public, anon;
grant execute on function public.bytebuddy_touch_updated_at() to authenticated;

create trigger trainer_profiles_set_updated_at
before update on public.trainer_profiles
for each row execute function public.bytebuddy_touch_updated_at();

create trigger trainer_saves_set_updated_at
before update on public.trainer_saves
for each row execute function public.bytebuddy_touch_updated_at();

-- Public ranked competitive progress is intentionally NOT in these tables.
-- Server-side validation and separate authoritative models must come first.
