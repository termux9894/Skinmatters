-- ============================================================
-- SKINMATTERS – Supabase Database Schema
-- Paste this entire file into:
-- Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- ── ENABLE UUID EXTENSION ──────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── 1. PROFILES (extends Supabase auth.users) ──────────────
create table if not exists public.profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  full_name     text,
  phone         text,
  avatar_url    text,
  birthday      date,
  referral_code text unique default upper(substr(md5(random()::text), 1, 8)),
  reward_points integer default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can view own profile"    on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── 2. CATEGORIES ──────────────────────────────────────────
create table if not exists public.categories (
  id          serial primary key,
  name        text not null,
  slug        text not null unique,
  description text,
  image_url   text,
  sort_order  integer default 0
);
insert into public.categories (name, slug, sort_order) values
  ('Soaps',        'soap',  1),
  ('Oils & Serums','oil',   2),
  ('Balms',        'balm',  3),
  ('Face & Hair Packs','pack', 4)
on conflict (slug) do nothing;

-- ── 3. PRODUCTS ────────────────────────────────────────────
create table if not exists public.products (
  id             serial primary key,
  name           text not null,
  tagline        text,
  slug           text unique,
  category_slug  text references public.categories(slug),
  price          numeric(10,2) not null,
  original_price numeric(10,2),
  image_url      text,
  badge          text,
  rating         numeric(3,2) default 0,
  reviews_count  integer default 0,
  description    text,
  ingredients    text,
  how_to_use     text,
  weight_grams   integer,
  stock_quantity integer default 100,
  is_active      boolean default true,
  is_featured    boolean default false,
  created_at     timestamptz default now()
);
alter table public.products enable row level security;
create policy "Anyone can view active products" on public.products for select using (is_active = true);

-- Seed products
insert into public.products (name, tagline, slug, category_slug, price, original_price, image_url, badge, rating, reviews_count, description) values
  ('Aloe Vera Soap',                    'Soothe & Glow',          'aloe-vera-soap',          'soap', 180, 220, 'images/Aloe vera Soap.png',                         'Best Seller', 4.8, 312, 'Cold-processed with pure aloe vera gel and neem leaf extract. Ideal for acne-prone and sensitive skin.'),
  ('Charcoal Soap',                     'Deep Cleanse',           'charcoal-soap',            'soap', 190, 240, 'images/charcoal 1.png',                              'Trending',    4.9, 510, 'Activated charcoal draws out toxins and unclogs pores for a visibly clearer complexion.'),
  ('Avarampoo Soap',                    'Brightening Formula',    'avarampoo-soap',           'soap', 160, 200, 'images/Avarampoo Soap.png',                          'Traditional', 4.7, 198, 'Traditional South Indian flower soap. Brightens skin and evens out complexion naturally.'),
  ('Kuppaimeni Soap',                   'Herbal Healing',         'kuppaimeni-soap',          'soap', 150, 190, 'images/Kuppaimeni Soap.png',                         'Herbal',      4.6, 145, 'Made with Indian acalypha – a powerful Siddha herb known for treating skin disorders.'),
  ('Manjistha & Athimathuram Soap',     'Anti-Pigmentation',      'manjistha-soap',           'soap', 175, 210, 'images/Manjistha and Athimathuram Soap.png',         'Ayurvedic',   4.8, 223, 'Manjistha purifies blood and skin; Athimathuram reduces pigmentation for radiant skin.'),
  ('Multhaanimetti Soap',               'Clay Cleanse',           'multhaanimetti-soap',      'soap', 155, 195, 'images/Multhanimetti soap.png',                      'Pure Clay',   4.5, 167, 'Multani Mitti absorbs excess oil and reduces acne marks naturally.'),
  ('Almond Milk & Rice Flour Soap',     'Nourish & Soften',       'almond-milk-soap',         'soap', 200, 250, 'images/Almond milk and rice flour Soap.png',         'Luxe',        4.9, 287, 'Creamy bar with almond milk and rice flour. Exfoliates gently while deeply moisturising.'),
  ('Sandalwood Soap',                   'Calming & Healing',      'sandalwood-soap',          'soap', 185, 225, 'images/Sandalwood',                                  'Classic',     4.7, 342, 'Pure sandalwood powder with rose water. Calms irritated skin and gives a soft, even tone.'),
  ('Beetroot Balm',                     'Natural Lip Tint',       'beetroot-balm',            'balm', 120, 150, 'images/beetroot balm.png',                           'Viral',       5.0, 621, 'Beetroot-tinted lip balm with shea butter and vitamin E.'),
  ('Coco Balm',                         'Deep Moisture',          'coco-balm',                'balm', 110, 140, 'images/coco balm.png',                               'Moisturising',4.8, 189, 'Pure coconut oil balm for lips, cuticles, and anywhere that needs intense hydration.'),
  ('Hair Growth Oil',                   'Strengthen & Grow',      'hair-growth-oil',          'oil',  350, 420, 'images/hair oil 1.png',                              'Top Pick',    4.9, 445, 'A blend of 15 herbs in cold-pressed castor and coconut base.'),
  ('Face Serum',                        'Glow Booster',           'face-serum',               'oil',  490, 600, 'images/face serum 2.png',                            'New',         4.7, 123, 'Vitamin C and rosehip serum. Reduces dark spots, evens skin tone, and adds a healthy glow.'),
  ('Herbal Face Pack',                  'Deep Clay Mask',         'herbal-face-pack',         'pack', 220, 280, 'images/face pack 1.png',                             'Detox',       4.6, 256, 'Multani mitti, turmeric and sandalwood powder. Weekly pack for deep cleansing and glow.'),
  ('Herbal Hair Pack',                  'Protein Treatment',      'herbal-hair-pack',         'pack', 260, 320, 'images/hair pack 1.png',                             'Deep Nourish',4.8, 198, 'Amla, shikakai and egg-protein formula. Restores shine and treats damaged hair.')
on conflict (slug) do nothing;

-- ── 4. ADDRESSES ───────────────────────────────────────────
create table if not exists public.addresses (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  label       text default 'Home',
  full_name   text not null,
  phone       text not null,
  line1       text not null,
  line2       text,
  city        text not null,
  state       text not null,
  pin         text not null,
  country     text default 'India',
  is_default  boolean default false,
  created_at  timestamptz default now()
);
alter table public.addresses enable row level security;
create policy "Users manage own addresses" on public.addresses for all using (auth.uid() = user_id);

-- ── 5. CART ITEMS (persistent cart) ────────────────────────
create table if not exists public.cart_items (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  product_id  integer references public.products(id) on delete cascade not null,
  quantity    integer default 1 check (quantity > 0),
  created_at  timestamptz default now(),
  unique(user_id, product_id)
);
alter table public.cart_items enable row level security;
create policy "Users manage own cart" on public.cart_items for all using (auth.uid() = user_id);

-- ── 6. WISHLISTS ───────────────────────────────────────────
create table if not exists public.wishlists (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  product_id  integer references public.products(id) on delete cascade not null,
  created_at  timestamptz default now(),
  unique(user_id, product_id)
);
alter table public.wishlists enable row level security;
create policy "Users manage own wishlist" on public.wishlists for all using (auth.uid() = user_id);

-- ── 7. COUPONS ─────────────────────────────────────────────
create table if not exists public.coupons (
  id             serial primary key,
  code           text not null unique,
  discount_type  text check (discount_type in ('percent','fixed')) default 'percent',
  discount_value numeric(10,2) not null,
  min_order      numeric(10,2) default 0,
  max_uses       integer,
  used_count     integer default 0,
  is_active      boolean default true,
  expires_at     timestamptz
);
insert into public.coupons (code, discount_type, discount_value, min_order, is_active) values
  ('PURE10',   'percent', 10, 0,    true),
  ('WELCOME50','fixed',   50, 499,  true),
  ('HAIR20',   'percent', 20, 299,  true)
on conflict (code) do nothing;

-- ── 8. ORDERS ──────────────────────────────────────────────
create table if not exists public.orders (
  id               uuid default uuid_generate_v4() primary key,
  order_number     text unique default 'SM-' || to_char(now(),'YYYY') || '-' || lpad(floor(random()*9000+1000)::text, 4, '0'),
  user_id          uuid references auth.users(id),
  status           text default 'placed' check (status in ('placed','confirmed','packing','shipped','out_for_delivery','delivered','cancelled','returned')),
  subtotal         numeric(10,2) not null,
  discount         numeric(10,2) default 0,
  shipping_charge  numeric(10,2) default 0,
  total            numeric(10,2) not null,
  coupon_code      text,
  payment_method   text,
  payment_status   text default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  shipping_address jsonb,
  tracking_number  text,
  courier          text,
  notes            text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);
alter table public.orders enable row level security;
create policy "Users view own orders"   on public.orders for select using (auth.uid() = user_id);
create policy "Users create orders"     on public.orders for insert with check (auth.uid() = user_id);

-- ── 9. ORDER ITEMS ─────────────────────────────────────────
create table if not exists public.order_items (
  id          uuid default uuid_generate_v4() primary key,
  order_id    uuid references public.orders(id) on delete cascade not null,
  product_id  integer references public.products(id),
  product_name text not null,
  quantity    integer not null,
  unit_price  numeric(10,2) not null,
  total_price numeric(10,2) not null
);
alter table public.order_items enable row level security;
create policy "Users view own order items" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "Users create order items" on public.order_items for insert
  with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

-- ── 10. REVIEWS ────────────────────────────────────────────
create table if not exists public.reviews (
  id          uuid default uuid_generate_v4() primary key,
  product_id  integer references public.products(id) on delete cascade not null,
  user_id     uuid references auth.users(id) on delete cascade not null,
  rating      integer check (rating between 1 and 5) not null,
  title       text,
  content     text,
  is_verified boolean default false,
  created_at  timestamptz default now(),
  unique(user_id, product_id)
);
alter table public.reviews enable row level security;
create policy "Anyone can read reviews"    on public.reviews for select using (true);
create policy "Users write own reviews"    on public.reviews for insert with check (auth.uid() = user_id);
create policy "Users update own reviews"   on public.reviews for update using (auth.uid() = user_id);

-- Auto-update product rating when review added
create or replace function update_product_rating()
returns trigger language plpgsql as $$
begin
  update public.products set
    rating = (select round(avg(rating)::numeric, 2) from public.reviews where product_id = new.product_id),
    reviews_count = (select count(*) from public.reviews where product_id = new.product_id)
  where id = new.product_id;
  return new;
end;
$$;
drop trigger if exists on_review_change on public.reviews;
create trigger on_review_change after insert or update on public.reviews
  for each row execute function update_product_rating();

-- ── 11. BLOG POSTS ─────────────────────────────────────────
create table if not exists public.blog_posts (
  id           serial primary key,
  title        text not null,
  slug         text not null unique,
  excerpt      text,
  content      text,
  category     text,
  author       text default 'SkinMatters Team',
  image_url    text,
  emoji        text,
  read_minutes integer default 5,
  is_published boolean default true,
  published_at timestamptz default now()
);
alter table public.blog_posts enable row level security;
create policy "Anyone can read published posts" on public.blog_posts for select using (is_published = true);

insert into public.blog_posts (title, slug, excerpt, category, emoji, read_minutes) values
  ('The Ancient Indian 4-Step Skincare Routine',    'ancient-4-step-routine',      'Discover how Ayurvedic wisdom can transform your skin in 4 simple steps.',          'Skincare',    '🌿', 5),
  ('Why Aloe Vera is the Ultimate Skin Superfood',  'aloe-vera-skin-superfood',    'Aloe vera has been used in Ayurveda for over 5,000 years. Here is everything to know.','Ingredients', '🌿', 4),
  ('5 Signs Your Scalp Needs a Detox',              'scalp-detox-signs',           'Excess oil, dandruff, itchiness — your scalp sends signals. Learn to read them.',    'Haircare',    '💆', 6),
  ('Charcoal Soap: Does It Really Work for Acne?',  'charcoal-soap-for-acne',      'We break down the science behind how charcoal deep-cleanses pores.',                 'Skincare',    '✨', 5),
  ('DIY Turmeric Face Mask for Radiant Skin',       'diy-turmeric-face-mask',      'This 3-ingredient mask can brighten your complexion in just 15 minutes.',             'DIY Tips',    '🧪', 3)
on conflict (slug) do nothing;

-- ── 12. CONTACT MESSAGES ───────────────────────────────────
create table if not exists public.contact_messages (
  id         uuid default uuid_generate_v4() primary key,
  name       text not null,
  email      text not null,
  phone      text,
  subject    text,
  message    text not null,
  is_read    boolean default false,
  created_at timestamptz default now()
);
-- Public can insert, only admins read (via service role)
alter table public.contact_messages enable row level security;
create policy "Anyone can submit contact" on public.contact_messages for insert with check (true);

-- ============================================================
-- Done! Your SkinMatters database is set up.
-- Next: copy your Supabase URL and anon key into js/config/supabase.js
-- ============================================================
