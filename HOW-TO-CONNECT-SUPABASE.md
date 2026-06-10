# 🔌 How to Connect Supabase to SkinMatters

Follow these steps in order. Takes about 10 minutes.

---

## Step 1 – Create a Supabase Project

1. Go to **https://supabase.com** and sign up (free)
2. Click **New Project**
3. Give it a name: `skinmatters`
4. Set a strong database password (save it somewhere safe)
5. Choose region: **South Asia (Mumbai)** for fastest speed in India
6. Click **Create New Project** and wait ~2 minutes

---

## Step 2 – Set Up the Database

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Open the file `supabase/schema.sql` from this project
4. Copy the **entire contents** and paste into the SQL editor
5. Click **Run** (green button)
6. You should see "Success. No rows returned" — that means it worked!

This creates all your tables:
- `profiles` — customer accounts
- `products` — your product catalogue
- `categories` — soap, oil, balm, pack
- `cart_items` — persistent shopping cart
- `wishlists` — saved products
- `orders` + `order_items` — orders and what's in them
- `addresses` — delivery addresses
- `reviews` — product reviews
- `blog_posts` — blog articles
- `coupons` — discount codes
- `contact_messages` — contact form submissions

---

## Step 3 – Get Your API Keys

1. In Supabase, go to **Settings** (gear icon) → **API**
2. Copy two values:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **anon public** key — a long string starting with `eyJ...`

---

## Step 4 – Add Keys to the Website

Open `js/config/supabase.js` and replace the placeholders:

```js
const SUPABASE_URL  = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON = 'YOUR_ANON_PUBLIC_KEY';
```

Paste your actual values:

```js
const SUPABASE_URL  = 'https://abcdefgh.supabase.co';    // ← yours
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6...'; // ← yours
```

---

## Step 5 – Add the Supabase CDN to Every HTML Page

Every HTML file needs these `<script>` tags in the `<head>` **before** your other scripts:

```html
<!-- Supabase SDK (load first) -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- Your config -->
<script src="js/config/supabase.js"></script>
```

---

## Step 6 – Script Loading Order for Each Page

Each page needs scripts in this exact order:

### Every page needs:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/config/supabase.js"></script>
<script src="js/ui/layout.js"></script>
<script src="js/ui/main.js"></script>
<script src="js/cart/cart.js"></script>
<script src="js/products-data.js"></script>  <!-- fallback data -->
```

### Page-specific additions:

| Page | Extra scripts |
|------|--------------|
| `index.html` | `js/products/products.js` |
| `products.html` | `js/products/products.js` |
| `product.html` | `js/products/products.js` `js/products/product-detail.js` `js/reviews/reviews.js` |
| `login.html` | `js/auth/auth.js` |
| `forgot-password.html` | `js/auth/forgot-password.js` |
| `account.html` | `js/orders/orders.js` `js/account/account.js` |
| `wishlist.html` | `js/account/account.js` |
| `cart.html` | `js/orders/orders.js` |
| `checkout.html` | `js/orders/orders.js` |
| `order-confirmed.html` | *(no extras)* |
| `search.html` | `js/products/products.js` `js/search/search.js` |
| `blog.html` | `js/blog/blog.js` |
| `blog-post.html` | `js/blog/blog.js` |
| `contact.html` | `js/ui/contact.js` |
| `track.html` | `js/orders/orders.js` |

---

## Step 7 – Enable Google Login (optional)

1. Supabase → **Authentication** → **Providers** → **Google**
2. Enable it and add your Google OAuth credentials
3. Set redirect URL: `https://yourdomain.com/account.html`

---

## Step 8 – Add Your Products

Products are already seeded from `schema.sql`. To add more:

**Option A — Supabase Dashboard:**
1. Supabase → **Table Editor** → `products`
2. Click **Insert Row** and fill in the fields

**Option B — SQL:**
```sql
INSERT INTO products (name, tagline, slug, category_slug, price, original_price, image_url, badge, description)
VALUES ('Rose Water Toner', 'Hydrate & Refresh', 'rose-water-toner', 'oil', 299, 350, 'images/rose-toner.png', 'New', 'Pure rose water toner for all skin types.');
```

---

## Step 9 – Storage for Product Images (optional)

To host images in Supabase instead of the `images/` folder:

1. Supabase → **Storage** → **New Bucket** → name it `product-images` → make it **Public**
2. Upload your `.png` files
3. Get the public URL: `https://YOUR_PROJECT.supabase.co/storage/v1/object/public/product-images/filename.png`
4. Update `image_url` in the products table to use these URLs

---

## Step 10 – Test Everything

Open VS Code → Live Server → open `index.html`

Test these flows:
- [ ] Register a new account
- [ ] Add a product to cart
- [ ] Go to checkout
- [ ] Check Supabase → Table Editor → `orders` (your order should appear)
- [ ] Check `profiles` table (your profile should be there)

---

## 🆘 Common Issues

**"supabase is not defined"**
→ Make sure the Supabase CDN `<script>` tag is BEFORE `js/config/supabase.js`

**Products not loading**
→ Check that you ran `schema.sql` in Supabase SQL editor
→ Products fallback to static data if Supabase isn't connected

**Login not working**
→ Check Supabase → Authentication → Settings → confirm emails are not required for local testing
→ Or turn off "Confirm email" in Supabase Auth settings during development

**RLS policy errors**
→ Make sure you ran the full schema.sql — it sets up all Row Level Security policies

---

*Need help? Contact: hello@skinmatters.in*
