-- 001_create_profiles.sql
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  university text,
  phone text,
  email text,
  profile_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy if not exists "Public read profiles" on public.profiles for select using (true);
create policy if not exists "Users update own profile" on public.profiles for update using (auth.uid() = id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger if not exists set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name',''))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

DO $$
BEGIN
  BEGIN
    EXECUTE 'DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping drop trigger on auth.users: %', SQLERRM;
  END;
END;
$$;

DO $$
BEGIN
  BEGIN
    EXECUTE 'CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user()';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping create trigger on auth.users: %', SQLERRM;
  END;
END;
$$;
