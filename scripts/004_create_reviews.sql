-- Create reviews table
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade not null,
  reviewer_id uuid references auth.users(id) on delete cascade not null,
  booking_id uuid references public.bookings(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  title text,
  comment text not null,
  images text[] default '{}',
  landlord_response text,
  landlord_response_date timestamp with time zone,
  is_verified boolean default false,
  helpful_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.reviews enable row level security;

-- RLS policies for reviews
create policy "reviews_select_all"
  on public.reviews for select
  using (true);

create policy "reviews_insert_own"
  on public.reviews for insert
  with check (auth.uid() = reviewer_id);

create policy "reviews_update_own"
  on public.reviews for update
  using (auth.uid() = reviewer_id);

create policy "reviews_delete_own"
  on public.reviews for delete
  using (auth.uid() = reviewer_id);

-- Create indexes
create index if not exists reviews_property_idx on public.reviews(property_id);
create index if not exists reviews_reviewer_idx on public.reviews(reviewer_id);
create index if not exists reviews_rating_idx on public.reviews(rating);
