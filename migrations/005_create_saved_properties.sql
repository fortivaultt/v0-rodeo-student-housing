-- 005_create_saved_properties.sql
create table if not exists public.saved_properties (
  user_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, property_id)
);

alter table public.saved_properties enable row level security;

create policy if not exists "Users manage own saved properties - select" on public.saved_properties
for select using (auth.uid() = user_id);

create policy if not exists "Users manage own saved properties - insert" on public.saved_properties
for insert with check (auth.uid() = user_id);

create policy if not exists "Users manage own saved properties - delete" on public.saved_properties
for delete using (auth.uid() = user_id);
