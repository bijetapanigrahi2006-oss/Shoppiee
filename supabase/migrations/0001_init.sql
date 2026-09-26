-- Shoppiee initial schema. Run this once in Supabase → SQL Editor.
-- Every table is protected by Row Level Security: users only see their own rows.

-- ───────────── profiles ─────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_style text default 'adventurer',
  avatar_seed text,
  avatar_url text,             -- set when the user uploads their own photo
  display_prefs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create a profile row automatically on signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_seed)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)), new.id::text);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ───────────── shopping lists ─────────────
create table if not exists public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  emoji text default '🛍️',
  category text,
  source text not null default 'user' check (source in ('user', 'ai')),
  created_at timestamptz not null default now()
);

create table if not exists public.list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.shopping_lists (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text,             -- catalog product id (null for free-text items)
  title text not null,
  snapshot jsonb,              -- name/image/price at time of adding
  done boolean not null default false,
  created_at timestamptz not null default now()
);

-- ───────────── wishlist ─────────────
create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null,
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ───────────── cart ─────────────
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null,
  store text not null,
  price_snapshot numeric not null,
  url text not null,
  qty int not null default 1 check (qty > 0),
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id, product_id, store)
);

-- ───────────── guided checkout ─────────────
create table if not exists public.checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stores jsonb not null,       -- [{store, status: pending|ordered|skipped, orderId}]
  total numeric not null,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- ───────────── orders (as confirmed by the user) ─────────────
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  checkout_id uuid references public.checkout_sessions (id) on delete set null,
  store text not null,
  store_order_id text,
  items jsonb not null,        -- [{productId, name, image, price, qty}]
  amount numeric not null,
  placed_at timestamptz not null default now(),
  expected_delivery date,
  status text not null default 'placed'
    check (status in ('placed', 'shipped', 'delivered', 'cancel_requested', 'cancelled', 'return_requested', 'returned')),
  store_order_url text,
  updated_at timestamptz not null default now()
);

-- ───────────── history ─────────────
create table if not exists public.search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  query text not null,
  kind text not null default 'search' check (kind in ('search', 'assistant', 'link', 'image')),
  created_at timestamptz not null default now()
);

create table if not exists public.viewed_products (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null,
  snapshot jsonb not null,
  viewed_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ───────────── price alerts (notifications arrive in Phase 2) ─────────────
create table if not exists public.price_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null,
  target_price numeric not null,
  snapshot jsonb not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ───────────── indexes ─────────────
create index if not exists idx_lists_user on public.shopping_lists (user_id);
create index if not exists idx_list_items_list on public.list_items (list_id);
create index if not exists idx_cart_user on public.cart_items (user_id);
create index if not exists idx_orders_user on public.orders (user_id, placed_at desc);
create index if not exists idx_search_user on public.search_history (user_id, created_at desc);
create index if not exists idx_viewed_user on public.viewed_products (user_id, viewed_at desc);

-- ───────────── Row Level Security ─────────────
alter table public.profiles enable row level security;
alter table public.shopping_lists enable row level security;
alter table public.list_items enable row level security;
alter table public.wishlist enable row level security;
alter table public.cart_items enable row level security;
alter table public.checkout_sessions enable row level security;
alter table public.orders enable row level security;
alter table public.search_history enable row level security;
alter table public.viewed_products enable row level security;
alter table public.price_alerts enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

do $$
declare t text;
begin
  foreach t in array array['shopping_lists','list_items','wishlist','cart_items','checkout_sessions','orders','search_history','viewed_products','price_alerts']
  loop
    execute format('drop policy if exists "own rows" on public.%I', t);
    execute format(
      'create policy "own rows" on public.%I for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
  end loop;
end $$;

-- ───────────── Storage buckets ─────────────
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true), ('screenshots', 'screenshots', false)
on conflict (id) do nothing;

-- Users can manage files only inside a folder named after their user id.
drop policy if exists "avatar read" on storage.objects;
create policy "avatar read" on storage.objects for select using (bucket_id = 'avatars');

drop policy if exists "own files write" on storage.objects;
create policy "own files write" on storage.objects for insert to authenticated
  with check (bucket_id in ('avatars', 'screenshots') and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "own files update" on storage.objects;
create policy "own files update" on storage.objects for update to authenticated
  using (bucket_id in ('avatars', 'screenshots') and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "own files delete" on storage.objects;
create policy "own files delete" on storage.objects for delete to authenticated
  using (bucket_id in ('avatars', 'screenshots') and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "own screenshots read" on storage.objects;
create policy "own screenshots read" on storage.objects for select to authenticated
  using (bucket_id = 'screenshots' and (storage.foldername(name))[1] = (select auth.uid())::text);
