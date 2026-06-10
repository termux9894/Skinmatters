# 🌿 SkinMatters – Fully Organised Website

25 pages · Supabase-ready · All files connected · Clean folder structure

---

## 📁 Full Project Structure

```
skinmatters/
│
├── index.html                     ← Homepage (entry point)
├── 404.html                       ← Custom error page
│
├── pages/
│   ├── shop/
│   │   ├── products.html          ← All products (filter + sort)
│   │   ├── product.html           ← Single product detail + reviews
│   │   ├── cart.html              ← Shopping cart
│   │   ├── checkout.html          ← 3-step checkout
│   │   ├── order-confirmed.html   ← Order thank-you page
│   │   ├── combos.html            ← Combo bundles & gifts
│   │   ├── wishlist.html          ← Saved items
│   │   └── search.html            ← Search results
│   │
│   ├── account/
│   │   ├── login.html             ← Login / Register
│   │   ├── forgot-password.html   ← Password reset (OTP flow)
│   │   ├── account.html           ← My orders, addresses, rewards
│   │   └── track.html             ← Order tracking timeline
│   │
│   ├── content/
│   │   ├── about.html             ← Our Story
│   │   ├── blog.html              ← Blog listing
│   │   ├── blog-post.html         ← Full blog article
│   │   ├── ingredients.html       ← Ingredient explorer
│   │   └── skin-quiz.html         ← Skin type quiz + recommendations
│   │
│   ├── support/
│   │   ├── contact.html           ← Contact form
│   │   ├── faq.html               ← Searchable FAQ accordion
│   │   ├── shipping.html          ← Shipping policy
│   │   └── returns.html           ← Returns & refunds policy
│   │
│   └── legal/
│       ├── privacy.html           ← Privacy policy
│       └── terms.html             ← Terms & conditions
│
├── css/
│   ├── style.css                  ← Main design system
│   └── pages.css                  ← Page-specific styles
│
├── js/
│   ├── config/
│   │   ├── supabase.js            ← ⚠️ PUT YOUR KEYS HERE
│   │   └── paths.js               ← ROOT + PAGES (auto-detects depth)
│   │
│   ├── auth/
│   │   ├── auth.js                ← Login, register, Google, logout
│   │   └── forgot-password.js     ← Password reset flow
│   │
│   ├── products/
│   │   ├── products.js            ← Fetch, filter, sort, render
│   │   └── product-detail.js      ← Single product + wishlist
│   │
│   ├── cart/
│   │   └── cart.js                ← Add/remove, Supabase sync
│   │
│   ├── orders/
│   │   └── orders.js              ← Place order, fetch orders, reorder
│   │
│   ├── account/
│   │   └── account.js             ← Profile, addresses, wishlist
│   │
│   ├── reviews/
│   │   └── reviews.js             ← Submit, fetch, star rating UI
│   │
│   ├── search/
│   │   └── search.js              ← Real-time search + header dropdown
│   │
│   ├── blog/
│   │   └── blog.js                ← Fetch posts, render, filter
│   │
│   └── ui/
│       ├── layout.js              ← Injects header + footer on every page
│       ├── main.js                ← Slider, scroll reveal, mobile menu
│       └── contact.js             ← Contact form → Supabase
│
├── images/                        ← ⚠️ COPY YOUR PRODUCT IMAGES HERE
├── supabase/
│   └── schema.sql                 ← Paste into Supabase SQL editor
├── HOW-TO-CONNECT-SUPABASE.md     ← Step-by-step Supabase setup
└── README.md                      ← This file
```

---

## 🚀 Quick Start (5 steps)

### 1. Add your images
Copy all product `.png` files from your OneDrive `skinmatters` folder → paste into `images/`

### 2. Open in VS Code
Open VS Code → File → Open Folder → select this `skinmatters` folder
Install **Live Server** extension → right-click `index.html` → **Open with Live Server**

### 3. Connect Supabase (when ready)
Follow the full guide in `HOW-TO-CONNECT-SUPABASE.md`
- Run `supabase/schema.sql` in your Supabase SQL editor
- Paste your URL + anon key into `js/config/supabase.js`

### 4. Add products
Edit `js/products-data.js` to add/edit products (static fallback until Supabase is connected)

### 5. Customise brand
- **Colors** → `css/style.css` top `:root` block
- **Brand name** → `js/ui/layout.js`
- **Logo** → replace `🌿` in layout.js

---

## 🔗 How Pages Connect

Every HTML page loads scripts in this order:
```html
<!-- 1. Supabase SDK -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<!-- 2. Your Supabase keys -->
<script src="../../js/config/supabase.js"></script>
<!-- 3. Path resolver (ROOT + PAGES) -->
<script src="../../js/config/paths.js"></script>
<!-- 4. Shared UI -->
<script src="../../js/ui/layout.js"></script>
<script src="../../js/ui/main.js"></script>
<!-- 5. Cart (on every page) -->
<script src="../../js/cart/cart.js"></script>
<!-- 6. Static product fallback -->
<script src="../../js/products-data.js"></script>
<!-- 7. Page-specific scripts -->
<script src="../../js/products/products.js"></script>
```

The `paths.js` file automatically detects where you are and adjusts all links:
```js
const ROOT = '../../';  // auto-detected for pages/ subfolder
const PAGES = {
  home:     ROOT + 'index.html',
  products: ROOT + 'pages/shop/products.html',
  account:  ROOT + 'pages/account/account.html',
  // ... all 25 pages
};
```

---

*Made with 🌿 for SkinMatters Pure Naturals*
