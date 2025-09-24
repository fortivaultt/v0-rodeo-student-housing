-- 006_create_notifications.sql
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy if not exists "Users can read own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy if not exists "Users can update own notifications" on public.notifications for update using (auth.uid() = user_id);
-- No insert policy so clients cannot insert; service role bypasses RLS for server-originated notifications.
