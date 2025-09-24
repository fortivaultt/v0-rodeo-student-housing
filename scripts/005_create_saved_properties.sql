-- Create saved properties table (wishlist/favorites)
create table if not exists public.saved_properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, property_id)
);

-- Enable RLS
alter table public.saved_properties enable row level security;

-- RLS policies for saved properties
create policy "saved_properties_select_own"
  on public.saved_properties for select
  using (auth.uid() = user_id);

create policy "saved_properties_insert_own"
  on public.saved_properties for insert
  with check (auth.uid() = user_id);

create policy "saved_properties_delete_own"
  on public.saved_properties for delete
  using (auth.uid() = user_id);

-- Create indexes
create index if not exists saved_properties_user_idx on public.saved_properties(user_id);
create index if not exists saved_properties_property_idx on public.saved_properties(property_id);
