-- Enable required extensions
create extension if not exists pgcrypto;

set search_path to public;

-- Profiles table mirrors auth.users and stores public metadata
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  university text,
  phone text,
  profile_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Properties listed by landlords (users)
create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  property_type text not null check (property_type in ('hostel','apartment','shared_room','private_room','studio')),
  address text not null,
  city text not null,
  state text not null,
  country text not null,
  latitude double precision,
  longitude double precision,
  price_per_month numeric not null check (price_per_month >= 0),
  price_per_semester numeric,
  price_per_year numeric,
  currency text not null,
  max_occupancy integer not null check (max_occupancy > 0),
  available_rooms integer not null default 0 check (available_rooms >= 0),
  total_rooms integer not null default 0 check (total_rooms >= 0),
  bathrooms integer not null default 1 check (bathrooms > 0),
  square_meters integer,
  furnished boolean not null default false,
  utilities_included boolean not null default false,
  wifi_included boolean not null default false,
  parking_available boolean not null default false,
  security_features text[] not null default '{}',
  house_rules text[] not null default '{}',
  nearby_universities text[] not null default '{}',
  distance_to_campus numeric,
  images text[] not null default '{}',
  amenities text[] not null default '{}',
  verification_status text not null default 'pending' check (verification_status in ('pending','verified','rejected')),
  is_active boolean not null default true,
  featured boolean not null default false,
  rating numeric not null default 0,
  total_reviews integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Bookings by tenants for properties
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  tenant_id uuid not null references auth.users(id) on delete cascade,
  check_in_date date not null,
  check_out_date date not null,
  duration integer not null check (duration > 0),
  guests integer not null check (guests > 0),
  total_amount numeric not null check (total_amount >= 0),
  payment_provider text,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','completed')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','paid','refunded','partial')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Reviews for properties
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  booking_id uuid references bookings(id) on delete set null,
  rating integer not null check (rating >= 1 and rating <= 5),
  title text,
  comment text not null,
  images text[] not null default '{}',
  landlord_response text,
  landlord_response_date timestamptz,
  is_verified boolean not null default false,
  helpful_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Saved properties (wishlists)
create table if not exists saved_properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, property_id)
);

-- Notifications to users
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- updated_at trigger helper
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Attach updated_at triggers
create trigger trg_profiles_updated_at
before update on profiles
for each row execute function set_updated_at();

create trigger trg_properties_updated_at
before update on properties
for each row execute function set_updated_at();

create trigger trg_bookings_updated_at
before update on bookings
for each row execute function set_updated_at();

create trigger trg_reviews_updated_at
before update on reviews
for each row execute function set_updated_at();

-- Create profile on new auth user
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, full_name, university)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'university', null)
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, profiles.full_name),
    university = coalesce(excluded.university, profiles.university),
    updated_at = now();
  return new;
end;
$$;

-- Ensure trigger exists on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Compatibility for existing schemas (ensure required columns exist)
alter table if exists properties add column if not exists property_type text;
alter table if exists properties add column if not exists city text;
alter table if exists properties add column if not exists price_per_month numeric;
alter table if exists properties add column if not exists verification_status text default 'pending';
alter table if exists properties add column if not exists is_active boolean default true;
alter table if exists properties add column if not exists landlord_id uuid;
alter table if exists properties add column if not exists images text[] default '{}';
alter table if exists properties add column if not exists currency text default 'NGN';
alter table if exists properties add column if not exists created_at timestamptz default now();

-- Row Level Security
alter table profiles enable row level security;
alter table properties enable row level security;
alter table bookings enable row level security;
alter table reviews enable row level security;
alter table saved_properties enable row level security;
alter table notifications enable row level security;

-- Profiles policies
drop policy if exists profiles_select_all on profiles;
create policy profiles_select_all on profiles
  for select using (true);

drop policy if exists profiles_update_self on profiles;
create policy profiles_update_self on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Properties policies
drop policy if exists properties_public_read on properties;
create policy properties_public_read on properties
  for select using (
    (is_active = true and verification_status = 'verified') or landlord_id = auth.uid()
  );

drop policy if exists properties_insert_owner on properties;
create policy properties_insert_owner on properties
  for insert with check (landlord_id = auth.uid());

drop policy if exists properties_update_owner on properties;
create policy properties_update_owner on properties
  for update using (landlord_id = auth.uid()) with check (landlord_id = auth.uid());

drop policy if exists properties_delete_owner on properties;
create policy properties_delete_owner on properties
  for delete using (landlord_id = auth.uid());

-- Bookings policies
drop policy if exists bookings_select_tenant_or_landlord on bookings;
create policy bookings_select_tenant_or_landlord on bookings
  for select using (
    tenant_id = auth.uid() or exists (
      select 1 from properties p where p.id = bookings.property_id and p.landlord_id = auth.uid()
    )
  );

drop policy if exists bookings_insert_tenant on bookings;
create policy bookings_insert_tenant on bookings
  for insert with check (tenant_id = auth.uid());

drop policy if exists bookings_update_tenant_or_landlord on bookings;
create policy bookings_update_tenant_or_landlord on bookings
  for update using (
    tenant_id = auth.uid() or exists (
      select 1 from properties p where p.id = bookings.property_id and p.landlord_id = auth.uid()
    )
  );

drop policy if exists bookings_delete_tenant on bookings;
create policy bookings_delete_tenant on bookings
  for delete using (tenant_id = auth.uid());

-- Reviews policies
drop policy if exists reviews_select_all on reviews;
create policy reviews_select_all on reviews
  for select using (true);

drop policy if exists reviews_insert_self on reviews;
create policy reviews_insert_self on reviews
  for insert with check (reviewer_id = auth.uid());

drop policy if exists reviews_update_owner_or_landlord on reviews;
create policy reviews_update_owner_or_landlord on reviews
  for update using (
    reviewer_id = auth.uid() or exists (
      select 1 from properties p where p.id = reviews.property_id and p.landlord_id = auth.uid()
    )
  );

drop policy if exists reviews_delete_owner on reviews;
create policy reviews_delete_owner on reviews
  for delete using (reviewer_id = auth.uid());

-- Saved properties policies
drop policy if exists saved_props_select_self on saved_properties;
create policy saved_props_select_self on saved_properties
  for select using (user_id = auth.uid());

drop policy if exists saved_props_cud_self on saved_properties;
create policy saved_props_cud_self on saved_properties
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Notifications policies
drop policy if exists notifications_select_self on notifications;
create policy notifications_select_self on notifications
  for select using (user_id = auth.uid());

drop policy if exists notifications_cud_self on notifications;
create policy notifications_cud_self on notifications
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Indexes for performance (guarded by column existence)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='city') THEN
    CREATE INDEX IF NOT EXISTS idx_properties_city ON properties (city);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='property_type') THEN
    CREATE INDEX IF NOT EXISTS idx_properties_type ON properties (property_type);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='price_per_month') THEN
    CREATE INDEX IF NOT EXISTS idx_properties_price_per_month ON properties (price_per_month);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='landlord_id') THEN
    CREATE INDEX IF NOT EXISTS idx_properties_landlord ON properties (landlord_id);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='tenant_id') THEN
    CREATE INDEX IF NOT EXISTS idx_bookings_tenant ON bookings (tenant_id);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='property_id') THEN
    CREATE INDEX IF NOT EXISTS idx_reviews_property ON reviews (property_id);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='saved_properties' AND column_name='user_id') THEN
    CREATE INDEX IF NOT EXISTS idx_saved_properties_user ON saved_properties (user_id);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='user_id') THEN
    CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications (user_id, read);
  END IF;
END $$;
