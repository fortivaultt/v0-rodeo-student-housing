-- Create properties table
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text not null,
  property_type text not null check (property_type in ('hostel', 'apartment', 'shared_room', 'private_room', 'studio')),
  address text not null,
  city text not null,
  state text not null,
  country text default 'Nigeria' not null,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  price_per_month decimal(10, 2) not null,
  price_per_semester decimal(10, 2),
  price_per_year decimal(10, 2),
  currency text default 'NGN' not null,
  max_occupancy integer not null default 1,
  available_rooms integer not null default 1,
  total_rooms integer not null default 1,
  bathrooms integer not null default 1,
  square_meters decimal(8, 2),
  furnished boolean default false,
  utilities_included boolean default false,
  wifi_included boolean default false,
  parking_available boolean default false,
  security_features text[],
  house_rules text[],
  nearby_universities text[],
  distance_to_campus decimal(5, 2), -- in kilometers
  images text[] not null default '{}',
  amenities text[] default '{}',
  verification_status text default 'pending' check (verification_status in ('pending', 'verified', 'rejected')),
  is_active boolean default true,
  featured boolean default false,
  rating decimal(3, 2) default 0.0,
  total_reviews integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.properties enable row level security;

-- RLS policies for properties
create policy "properties_select_all"
  on public.properties for select
  using (is_active = true and verification_status = 'verified');

create policy "properties_select_own"
  on public.properties for select
  using (auth.uid() = landlord_id);

create policy "properties_insert_own"
  on public.properties for insert
  with check (auth.uid() = landlord_id);

create policy "properties_update_own"
  on public.properties for update
  using (auth.uid() = landlord_id);

create policy "properties_delete_own"
  on public.properties for delete
  using (auth.uid() = landlord_id);

-- Create indexes for better performance
create index if not exists properties_city_idx on public.properties(city);
create index if not exists properties_property_type_idx on public.properties(property_type);
create index if not exists properties_price_idx on public.properties(price_per_month);
create index if not exists properties_rating_idx on public.properties(rating);
create index if not exists properties_location_idx on public.properties(latitude, longitude);
