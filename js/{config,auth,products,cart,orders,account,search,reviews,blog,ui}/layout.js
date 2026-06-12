// ============================================
// SKINMATTERS – Shared Layout (header + footer)
// Injected into every page via initLayout()
// ============================================

function initLayout() {
  // ---- ANNOUNCEMENT BAR ----
  const annBar = document.getElementById('announcementBar');
  if (annBar) annBar.innerHTML = `
    <div class="announcement-track">
      <span>🌿 Free shipping on orders above ₹999 &nbsp;&nbsp;|&nbsp;&nbsp;
      ✨ Use code <strong>PURE10</strong> for 10% off your 1st order &nbsp;&nbsp;|&nbsp;&nbsp;
      🎁 Free gift on orders above ₹1299 &nbsp;&nbsp;|&nbsp;&nbsp;
      🌿 Free shipping on orders above ₹999 &nbsp;&nbsp;|&nbsp;&nbsp;
      ✨ Use code <strong>PURE10</strong> for 10% off your 1st order</span>
    </div>`;

  // ---- HEADER ----
  const header = document.getElementById('siteHeader');
  if (header) header.innerHTML = `
    <div class="header-inner">
      <button class="mobile-menu-btn" id="menuBtn" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
      <a href=PAGES.home class="logo">
        <span class="logo-leaf">🌿</span>
        <div class="logo-text">
          <span class="logo-main">SkinMatters</span>
          <span class="logo-sub">Pure Naturals</span>
        </div>
      </a>
      <nav class="main-nav" id="mainNav">
        <ul>
          <li class="has-dropdown">
            <a href="#">Best Sellers <i class="fa fa-chevron-down"></i></a>
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
            <a href="#">Face <i class="fa fa-chevron-down"></i></a>
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
            <a href="#">Hair <i class="fa fa-chevron-down"></i></a>
            <div class="dropdown">
              <div class="dropdown-col">
                <h4>Category</h4>
                <a href="${PAGES.products}?cat=oil">Hair Oil</a>
                <a href="${PAGES.products}?cat=pack">Hair Pack</a>
              </div>
            </div>
          </li>
          <li><a href=PAGES.products>All Products</a></li>
          <li><a href=PAGES.combos>Combos</a></li>
          <li><a href=PAGES.skinQuiz>Skin Quiz</a></li>
          <li><a href=PAGES.blog>Blog</a></li>
          <li><a href=PAGES.about>Our Story</a></li>
        </ul>
      </nav>
      <div class="header-actions">
        <button class="icon-btn" id="searchToggle" aria-label="Search" onclick="window.location.href=PAGES.search"><i class="fa fa-search"></i></button>
        <a href=PAGES.wishlist class="icon-btn" aria-label="Wishlist"><i class="fa fa-heart"></i></a>
        <a href=PAGES.account class="icon-btn" aria-label="Account"><i class="fa fa-user"></i></a>
        <a href=PAGES.cart class="icon-btn cart-btn" aria-label="Cart">
          <i class="fa fa-shopping-bag"></i>
          <span class="cart-count" id="cartCount">0</span>
        </a>
      </div>
    </div>
    <div class="search-bar" id="searchBar">
      <div class="search-inner">
        <input type="text" placeholder="Search for soaps, oils, serums…" id="searchInput" />
        <button class="search-close" id="searchClose"><i class="fa fa-times"></i></button>
      </div>
    </div>`;

  // ---- FOOTER ----
  const footer = document.getElementById('siteFooter');
  if (footer) footer.innerHTML = `
    <div class="footer-inner">
      <div class="footer-brand">
        <a href=PAGES.home class="logo footer-logo">
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
        <a href=PAGES.products>All Products</a>
        <a href="${PAGES.products}?cat=soap">Soaps</a>
        <a href="${PAGES.products}?cat=oil">Oils & Serums</a>
        <a href="${PAGES.products}?cat=balm">Balms</a>
        <a href=PAGES.combos>Combos & Gifts</a>
        <a href=PAGES.skinQuiz>✨Skin Quiz</a>
      </div>
      <div class="footer-links">
        <h4>Company</h4>
        <a href=PAGES.about>Our Story</a>
        <a href=PAGES.ingredients>Ingredients</a>
        <a href=PAGES.blog>Blog</a>
        <a href=PAGES.contact>Contact Us</a>
      </div>
      <div class="footer-links">
        <h4>Help</h4>
        <a href=PAGES.faq>FAQs</a>
        <a href=PAGES.shipping>Shipping Policy</a>
        <a href=PAGES.returns>Return Policy</a>
        <a href=PAGES.track>Track Order</a>
        <a href=PAGES.account>My Account</a>
      </div>
      <div class="footer-links">
        <h4>Legal</h4>
        <a href=PAGES.privacy>Privacy Policy</a>
        <a href=PAGES.terms>Terms & Conditions</a>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2025 SkinMatters Pure Naturals. All rights reserved.</p>
      <p>Made with 🌿 in India</p>
    </div>`;

  // ---- CART SIDEBAR ----
  const cartSidebar = document.getElementById('cartSidebarWrap');
  if (cartSidebar) cartSidebar.innerHTML = `
    <div class="cart-sidebar" id="cartSidebar">
      <div class="cart-header">
        <h3>Your Cart (<span id="cartItemCount">0</span>)</h3>
        <button id="cartClose"><i class="fa fa-times"></i></button>
      </div>
      <div class="cart-body" id="cartBody">
        <div class="cart-empty">
          <i class="fa fa-shopping-bag"></i>
          <p>Your cart is empty</p>
          <a href=PAGES.products class="btn btn-dark">Start Shopping</a>
        </div>
      </div>
      <div class="cart-footer" id="cartFooter" style="display:none;">
        <div class="cart-total">
          <span>Total</span>
          <span id="cartTotal">₹0</span>
        </div>
        <a href=PAGES.cart class="btn btn-dark full-width">Proceed to Checkout</a>
      </div>
    </div>
    <div class="cart-overlay" id="cartOverlay"></div>
    <div class="mobile-overlay" id="mobileOverlay"></div>
    <div class="toast" id="toast"></div>`;
}
