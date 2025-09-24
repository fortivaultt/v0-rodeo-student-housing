-- 004_create_reviews.sql
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
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

alter table public.reviews enable row level security;

create policy if not exists "Public read reviews" on public.reviews for select using (true);
create policy if not exists "Users insert own reviews" on public.reviews for insert with check (
  auth.uid() = reviewer_id AND (
    booking_id is null OR exists (
      select 1 from public.bookings b where b.id = booking_id and b.tenant_id = auth.uid()
    )
  )
);
create policy if not exists "Users update own reviews" on public.reviews for update using (auth.uid() = reviewer_id);
create policy if not exists "Landlord can respond to reviews" on public.reviews for update using (
  exists (
    select 1 from public.properties p where p.id = reviews.property_id and p.landlord_id = auth.uid()
  )
);

create trigger if not exists set_reviews_updated_at
before update on public.reviews
for each row execute procedure public.set_updated_at();

create or replace function public.update_property_rating(p_property_id uuid)
returns void as $$
begin
  update public.properties pr
  set rating = coalesce((select avg(r.rating)::numeric from public.reviews r where r.property_id = p_property_id), 0),
      total_reviews = (select count(*) from public.reviews r where r.property_id = p_property_id),
      updated_at = now()
  where pr.id = p_property_id;
end;
$$ language plpgsql security definer;

create or replace function public.reviews_after_change()
returns trigger as $$
begin
  perform public.update_property_rating(coalesce(new.property_id, old.property_id));
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists reviews_after_insert on public.reviews;
drop trigger if exists reviews_after_update on public.reviews;
drop trigger if exists reviews_after_delete on public.reviews;
create trigger reviews_after_insert after insert on public.reviews for each row execute procedure public.reviews_after_change();
create trigger reviews_after_update after update on public.reviews for each row execute procedure public.reviews_after_change();
create trigger reviews_after_delete after delete on public.reviews for each row execute procedure public.reviews_after_change();
