// ============================================================
// js/config/paths.js
//
// Detects how deep the current page is and exposes:
//   ROOT  – path back to the project root
//   PAGES – every page's full path, usable from any depth
//
// Load this as the SECOND script tag on every page
// (right after the Supabase CDN, before everything else).
// ============================================================

const ROOT = (() => {
  const p = window.location.pathname;
  // Every page inside pages/ is exactly 2 levels deep
  if (p.includes('/pages/')) return '../../';
  return './';
})();

// Full paths to every page in the project
const PAGES = {
  // ── Root ──────────────────────────────────────────────────
  home: ROOT + 'index.html',
  notFound: ROOT + 'pages/not-found.html',

  // ── Shop ──────────────────────────────────────────────────
  products:       ROOT + 'pages/shop/products.html',
  product:        ROOT + 'pages/shop/product.html',
  cart:           ROOT + 'pages/shop/cart.html',
  checkout:       ROOT + 'pages/shop/checkout.html',
  orderConfirmed: ROOT + 'pages/shop/order-confirmed.html',
  combos:         ROOT + 'pages/shop/combos.html',
  wishlist:       ROOT + 'pages/shop/wishlist.html',
  search:         ROOT + 'pages/shop/search.html',

  // ── Account / Auth ─────────────────────────────────────────
  login:          ROOT + 'pages/account/login.html',
  register:       ROOT + 'pages/account/login.html',   // same page, uses tab switching
  forgotPassword: ROOT + 'pages/account/forgot-password.html',
  account:        ROOT + 'pages/account/account.html',
  track:          ROOT + 'pages/account/track.html',

  // ── Content ───────────────────────────────────────────────
  about:          ROOT + 'pages/content/about.html',
  blog:           ROOT + 'pages/content/blog.html',
  blogPost:       ROOT + 'pages/content/blog-post.html',
  ingredients:    ROOT + 'pages/content/ingredients.html',
  skinQuiz:       ROOT + 'pages/content/skin-quiz.html',

  // ── Support ───────────────────────────────────────────────
  contact:        ROOT + 'pages/support/contact.html',
  faq:            ROOT + 'pages/support/faq.html',
  shipping:       ROOT + 'pages/support/shipping.html',
  returns:        ROOT + 'pages/support/returns.html',

  // ── Legal ─────────────────────────────────────────────────
  privacy:        ROOT + 'pages/legal/privacy.html',
  terms:          ROOT + 'pages/legal/terms.html',
};

// Handy shortcut: navigate to any page key
// Usage: goto('account')  goto('products', 'cat=soap')
function goto(pageKey, query = '') {
  const url = PAGES[pageKey];
  if (!url) { console.warn('Unknown page key:', pageKey); return; }
  window.location.href = query ? url + '?' + query : url;
}

// Append ?redirect=currentPage to a login URL
function loginWithRedirect() {
  window.location.href = PAGES.login + '?redirect=' + encodeURIComponent(window.location.href);
}