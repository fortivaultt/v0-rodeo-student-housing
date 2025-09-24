-- 002_create_properties.sql
create extension if not exists pgcrypto;

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  address text,
  city text,
  state text,
  country text,
  latitude double precision,
  longitude double precision,
  price_per_month numeric not null,
  price_per_semester numeric,
  price_per_year numeric,
  currency text not null default 'NGN',
  max_occupancy integer not null default 1,
  available_rooms integer not null default 1,
  total_rooms integer not null default 1,
  bathrooms integer not null default 1,
  square_meters integer,
  furnished boolean not null default false,
  utilities_included boolean not null default true,
  wifi_included boolean not null default true,
  parking_available boolean not null default false,
  security_features text[] not null default '{}',
  house_rules text[] not null default '{}',
  nearby_universities text[] not null default '{}',
  distance_to_campus numeric,
  images text[] not null default '{}',
  amenities text[] not null default '{}',
  verification_status text not null default 'pending',
  is_active boolean not null default true,
  featured boolean not null default false,
  rating numeric not null default 0,
  total_reviews integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.properties enable row level security;

create policy if not exists "Public read properties" on public.properties for select using (true);
create policy if not exists "Landlord insert own properties" on public.properties for insert with check (auth.uid() = landlord_id);
create policy if not exists "Landlord update own properties" on public.properties for update using (auth.uid() = landlord_id);

create trigger if not exists set_properties_updated_at
before update on public.properties
for each row execute procedure public.set_updated_at();
