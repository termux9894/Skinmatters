// ============================================================
// js/ui/layout.js
// Injects shared header + footer into every page.
// Also loads Supabase CDN and all JS modules in correct order.
// ============================================================

// ── LOAD SCRIPTS IN ORDER ─────────────────────────────────────
// Call this at the very top of each HTML page's <head>
// OR just include the <script> tags in the order shown in
// the HOW TO USE section below.
//
// HOW TO USE — add these scripts to every HTML page:
//
//  <!-- 1. Supabase CDN (must be first) -->
//  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
//
//  <!-- 2. Config (initialises supabase client + helpers) -->
//  <script src="${ROOT}js/config/supabase.js"></script>
//
//  <!-- 3. Shared UI -->
//  <script src="${ROOT}js/ui/layout.js"></script>
//  <script src="${ROOT}js/ui/main.js"></script>
//
//  <!-- 4. Cart (needed on all pages) -->
//  <script src="${ROOT}js/cart/cart.js"></script>
//
//  <!-- 5. Page-specific scripts (only on relevant pages) -->
//  <!-- products.html:      <script src="${ROOT}js/products/products.js"></script> -->
//  <!-- product.html:       <script src="${ROOT}js/products/products.js"></script>
//                           <script src="${ROOT}js/products/product-detail.js"></script>
//                           <script src="${ROOT}js/reviews/reviews.js"></script> -->
//  <!-- login.html:         <script src="${ROOT}js/auth/auth.js"></script> -->
//  <!-- forgot-password:    <script src="${ROOT}js/auth/forgot-password.js"></script> -->
//  <!-- account.html:       <script src="${ROOT}js/orders/orders.js"></script>
//                           <script src="${ROOT}js/account/account.js"></script> -->
//  <!-- wishlist.html:      <script src="${ROOT}js/account/account.js"></script> -->
//  <!-- cart.html:          <script src="${ROOT}js/orders/orders.js"></script> -->
//  <!-- checkout.html:      <script src="${ROOT}js/orders/orders.js"></script> -->
//  <!-- search.html:        <script src="${ROOT}js/products/products.js"></script>
//                           <script src="${ROOT}js/search/search.js"></script> -->
//  <!-- blog.html:          <script src="${ROOT}js/blog/blog.js"></script> -->
//  <!-- blog-post.html:     <script src="${ROOT}js/blog/blog.js"></script> -->
//  <!-- contact.html:       <script src="${ROOT}js/ui/contact.js"></script> -->
//
//  <!-- 6. Static product fallback (used when Supabase not configured) -->
//  <script src="${ROOT}js/products-data.js"></script>

// ── INJECT HEADER ─────────────────────────────────────────────
function initLayout() {
  // Prevent double-initialization when pages call initLayout() multiple times
  if (window.__sm_layout_initialized) return;
  window.__sm_layout_initialized = true;
  const announcementBar = document.getElementById('announcementBar');
  if (announcementBar) {
    announcementBar.innerHTML = `
      <div class="announcement-track">
        <span>🌿 Free shipping on orders above ₹999 &nbsp;&nbsp;|&nbsp;&nbsp;
        ✨ Use code <strong>PURE10</strong> for 10% off your 1st order &nbsp;&nbsp;|&nbsp;&nbsp;
        🎁 Free gift on orders above ₹1299 &nbsp;&nbsp;|&nbsp;&nbsp;
        🌿 Free shipping on orders above ₹999 &nbsp;&nbsp;|&nbsp;&nbsp;
        ✨ Use code <strong>PURE10</strong> for 10% off your 1st order</span>
      </div>`;
  }

  const header = document.getElementById('siteHeader');
  if (header) {

    header.innerHTML = `
      <div class="header-inner">
        <button class="mobile-menu-btn" id="menuBtn" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
        <a href="${PAGES.home}" class="logo">
          <span class="logo-leaf">🌿</span>
          <div class="logo-text">
            <span class="logo-main">SkinMatters</span>
            <span class="logo-sub">Pure Naturals</span>
          </div>
        </a>
        <nav class="main-nav" id="mainNav">
          <ul>
            <li class="has-dropdown">
             <a href="${PAGES.products}">Best Sellers <i class="fa fa-chevron-down"></i></a>
              <div class="dropdown">
                <div class="dropdown-col">
                  <h4>Skincare</h4>
                  <a href="${PAGES.products}?cat=soap">Handmade Soaps</a>
                  <a href="${PAGES.products}?cat=balm">Lip Balms</a>
                  <a href="${PAGES.products}?cat=pack">Face Packs</a>
                </div>
                <div class="dropdown-col">
                  <h4>Haircare</h4>
                  <a href="${PAGES.products}?cat=oil">Hair Oil</a>
                  <a href="${PAGES.products}?cat=pack">Hair Pack</a>
                </div>
              </div>
            </li>
            <li class="has-dropdown">
             <a href="${PAGES.products}?cat=soap">Face <i class="fa fa-chevron-down"></i></a>
              <div class="dropdown">
                <div class="dropdown-col">
                  <h4>Category</h4>
                  <a href="${PAGES.products}?cat=soap">Face Soaps</a>
                  <a href="${PAGES.products}?cat=pack">Face Packs</a>
                  <a href="${PAGES.products}?cat=oil">Serums</a>
                  <a href="${PAGES.products}?cat=balm">Lip Care</a>
                </div>
              </div>
            </li>
            <li class="has-dropdown">
              <a href="${PAGES.products}?cat=oil">Hair <i class="fa fa-chevron-down"></i></a>
              <div class="dropdown">
                <div class="dropdown-col">
                  <h4>Category</h4>
                  <a href="${PAGES.products}?cat=oil">Hair Oil</a>
                  <a href="${PAGES.products}?cat=pack">Hair Pack</a>
                </div>
              </div>
            </li>
            <li><a href="${PAGES.products}">All Products</a></li>
            <li><a href="${PAGES.combos}">Combos</a></li>
            <li><a href="${PAGES.skinQuiz}">Skin Quiz</a></li>
            <li><a href="${PAGES.blog}">Blog</a></li>
            <li><a href="${PAGES.about}">Our Story</a></li>
          </ul>
        </nav>
        <div class="header-actions">
          <button class="icon-btn" id="searchToggle" aria-label="Search">
            <i class="fa fa-search"></i>
          </button>
          <a href="${PAGES.wishlist}" class="icon-btn" aria-label="Wishlist">
  <i class="fa fa-heart"></i>
  <span class="wishlist-count" id="wishlistCount" style="display:none">0</span>
</a>
          <a href="${PAGES.account}" class="icon-btn" aria-label="Account" id="accountLink">
            <i class="fa fa-user"></i>
          </a>
          <a href="${PAGES.cart}" class="icon-btn cart-btn" aria-label="Cart">
            <i class="fa fa-shopping-bag"></i>
            <span class="cart-count" id="cartCount" style="display:none">0</span>
          </a>
        </div>
      </div>
      <div class="search-bar" id="searchBar">
        <div class="search-inner">
          <input type="text" placeholder="Search for soaps, oils, serums…" id="searchInput"/>
          <button class="search-close" id="searchClose"><i class="fa fa-times"></i></button>
        </div>
      </div>`;
  }

  // ── INJECT FOOTER ──────────────────────────────────────────
  const footer = document.getElementById('siteFooter');
  if (footer) {
    footer.innerHTML = `
      <div class="footer-inner">
        <div class="footer-brand">
          <a href="${PAGES.home}" class="logo footer-logo">
            <span class="logo-leaf">🌿</span>
            <div class="logo-text">
              <span class="logo-main">SkinMatters</span>
              <span class="logo-sub">Pure Naturals</span>
            </div>
          </a>
          <p>Handcrafted natural skincare made with love and traditional wisdom from India.</p>
          <div class="social-links">
            <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
            <a href="#" aria-label="Facebook"><i class="fab fa-facebook"></i></a>
            <a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
            <a href="#" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
          </div>
        </div>
        <div class="footer-links">
          <h4>Shop</h4>
          <a href="${PAGES.products}">All Products</a>
          <a href="${PAGES.products}?cat=soap">Soaps</a>
          <a href="${PAGES.products}?cat=oil">Oils & Serums</a>
          <a href="${PAGES.products}?cat=balm">Balms</a>
          <a href="${PAGES.combos}">Combos & Gifts</a>
          <a href="${PAGES.skinQuiz}">✨Skin Quiz</a>
        </div>
        <div class="footer-links">
          <h4>Company</h4>
          <a href="${PAGES.about}">Our Story</a>
          <a href="${PAGES.ingredients}">Ingredients</a>
          <a href="${PAGES.blog}">Blog</a>
          <a href="${PAGES.contact}">Contact Us</a>
        </div>
        <div class="footer-links">
          <h4>Help</h4>
          <a href="${PAGES.faq}">FAQs</a>
          <a href="${PAGES.shipping}">Shipping Policy</a>
          <a href="${PAGES.returns}">Return Policy</a>
          <a href="${PAGES.track}">Track Order</a>
          <a href="${PAGES.account}">My Account</a>
        </div>
        <div class="footer-links">
          <h4>Legal</h4>
          <a href="${PAGES.privacy}">Privacy Policy</a>
          <a href="${PAGES.terms}">Terms & Conditions</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2025 SkinMatters Pure Naturals. All rights reserved.</p>
        <p>Made with 🌿 in India</p>
      </div>`;
  }

  // ── INJECT CART SIDEBAR ────────────────────────────────────
  const cartWrap = document.getElementById('cartSidebarWrap');
  if (cartWrap) {
    cartWrap.innerHTML = `
      <div class="cart-sidebar" id="cartSidebar">
        <div class="cart-header">
          <h3>Your Cart (<span id="cartItemCount">0</span>)</h3>
          <button id="cartClose"><i class="fa fa-times"></i></button>
        </div>
        <div class="cart-body" id="cartBody">
          <div class="cart-empty">
            <i class="fa fa-shopping-bag"></i>
            <p>Your cart is empty</p>
            <a href="${PAGES.products}" class="btn btn-dark">Start Shopping</a>
          </div>
        </div>
        <div class="cart-footer" id="cartFooter" style="display:none">
          <div class="cart-total">
            <span>Total</span>
            <span id="cartTotal">₹0</span>
          </div>
          <a href="${PAGES.checkout}" class="btn btn-dark full-width">Proceed to Checkout</a>
        </div>
      </div>
      <div class="cart-overlay" id="cartOverlay"></div>
      <div class="mobile-overlay" id="mobileOverlay"></div>
      <div class="toast" id="toast"></div>`;
  }

    // Initialise cart count
    if (typeof initCart === 'function') initCart();

    // Ensure wishlist script is present and initialise
    if (typeof initWishlist === 'function') {
      initWishlist();
    } else {
      // Dynamically load wishlist script if page didn't include it
      try {
        const s = document.createElement('script');
        s.src = (typeof ROOT !== 'undefined' ? ROOT : '') + 'js/wishlist/wishlist.js';
        s.onload = () => { if (typeof initWishlist === 'function') initWishlist(); };
        document.head.appendChild(s);
      } catch (e) { /* ignore */ }
    }
}

window.initLayout = initLayout;
document.addEventListener('DOMContentLoaded', () => {
  initLayout();

  if (typeof initSearchBar === 'function') {
    initSearchBar();
  }
});