-- 003_create_bookings.sql
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  tenant_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending', -- pending, confirmed, cancelled, completed
  check_in_date date,
  check_out_date date,
  duration text not null, -- daily, weekly, monthly
  guests integer not null default 1,
  total_amount numeric not null,
  payment_provider text,
  payment_status text default 'unpaid',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

create policy if not exists "Tenants insert own bookings" on public.bookings for insert with check (auth.uid() = tenant_id);
create policy if not exists "Tenant or landlord can view booking" on public.bookings for select
  using (
    auth.uid() = tenant_id OR
    exists (
      select 1 from public.properties p
      where p.id = bookings.property_id and p.landlord_id = auth.uid()
    )
  );

create policy if not exists "Tenant or landlord can update booking" on public.bookings for update
  using (
    auth.uid() = tenant_id OR
    exists (
      select 1 from public.properties p
      where p.id = bookings.property_id and p.landlord_id = auth.uid()
    )
  );

create trigger if not exists set_bookings_updated_at
before update on public.bookings
for each row execute procedure public.set_updated_at();
