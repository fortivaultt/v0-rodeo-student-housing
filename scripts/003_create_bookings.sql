-- Create bookings table
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade not null,
  tenant_id uuid references auth.users(id) on delete cascade not null,
  landlord_id uuid references auth.users(id) on delete cascade not null,
  check_in_date date not null,
  check_out_date date not null,
  total_amount decimal(10, 2) not null,
  currency text default 'NGN' not null,
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'partially_paid', 'refunded', 'failed')),
  booking_status text default 'pending' check (booking_status in ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_method text check (payment_method in ('paystack', 'flutterwave', 'bank_transfer', 'cash')),
  payment_reference text,
  installment_plan boolean default false,
  installments_paid integer default 0,
  total_installments integer default 1,
  special_requests text,
  cancellation_reason text,
  cancelled_at timestamp with time zone,
  confirmed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.bookings enable row level security;

-- RLS policies for bookings
create policy "bookings_select_tenant"
  on public.bookings for select
  using (auth.uid() = tenant_id);

create policy "bookings_select_landlord"
  on public.bookings for select
  using (auth.uid() = landlord_id);

create policy "bookings_insert_tenant"
  on public.bookings for insert
  with check (auth.uid() = tenant_id);

create policy "bookings_update_tenant"
  on public.bookings for update
  using (auth.uid() = tenant_id);

create policy "bookings_update_landlord"
  on public.bookings for update
  using (auth.uid() = landlord_id);

-- Create indexes
create index if not exists bookings_tenant_idx on public.bookings(tenant_id);
create index if not exists bookings_landlord_idx on public.bookings(landlord_id);
create index if not exists bookings_property_idx on public.bookings(property_id);
create index if not exists bookings_dates_idx on public.bookings(check_in_date, check_out_date);
