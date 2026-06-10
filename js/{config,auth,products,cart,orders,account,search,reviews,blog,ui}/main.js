// ============================================
// SKINMATTERS – Main JS
// ============================================

/* ---------- CART STATE ---------- */
let cart = JSON.parse(localStorage.getItem('sm_cart') || '[]');

function saveCart() {
  localStorage.setItem('sm_cart', JSON.stringify(cart));
  updateCartUI();
}

function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  showToast(`${product.name} added to cart!`);
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
}

function updateCartQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else saveCart();
}

function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  document.querySelectorAll('#cartCount').forEach(el => el.textContent = count);
  const countEl = document.getElementById('cartItemCount');
  if (countEl) countEl.textContent = count;
  const totalEl = document.getElementById('cartTotal');
  if (totalEl) totalEl.textContent = `₹${total.toLocaleString('en-IN')}`;

  const cartBody = document.getElementById('cartBody');
  const cartFooter = document.getElementById('cartFooter');
  if (!cartBody) return;

  if (cart.length === 0) {
    cartBody.innerHTML = `
      <div class="cart-empty">
        <i class="fa fa-shopping-bag"></i>
        <p>Your cart is empty</p>
        <a href=PAGES.products class="btn btn-dark">Start Shopping</a>
      </div>`;
    if (cartFooter) cartFooter.style.display = 'none';
  } else {
    cartBody.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" onerror="this.src='https://placehold.co/80x80/f5f0eb/555?text=Product'" />
        <div class="ci-info">
          <p class="ci-name">${item.name}</p>
          <p class="ci-price">₹${item.price}</p>
          <div class="ci-qty">
            <button onclick="updateCartQty(${item.id}, -1)">−</button>
            <span>${item.qty}</span>
            <button onclick="updateCartQty(${item.id}, 1)">+</button>
          </div>
        </div>
        <button class="ci-remove" onclick="removeFromCart(${item.id})"><i class="fa fa-times"></i></button>
      </div>
    `).join('');
    if (cartFooter) cartFooter.style.display = 'block';
  }
}

/* ---------- TOAST ---------- */
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

/* ---------- RENDER PRODUCTS ---------- */
function renderProducts(filter = 'all') {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  const filtered = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);
  grid.innerHTML = filtered.map(p => `
    <div class="product-card" data-cat="${p.category}">
      <a href="product.html?id=${p.id}" class="product-img-wrap">
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
        <img src="${p.image}" alt="${p.name}" loading="lazy"
          onerror="this.src='https://placehold.co/400x400/f5f0eb/888?text=${encodeURIComponent(p.name)}'" />
      </a>
      <div class="product-info">
        <p class="product-tagline">${p.tagline}</p>
        <h3 class="product-name"><a href="product.html?id=${p.id}">${p.name}</a></h3>
        <div class="product-rating">
          <span class="stars-mini">${'★'.repeat(Math.floor(p.rating))}${p.rating % 1 ? '½' : ''}</span>
          <span class="review-count">(${p.reviews})</span>
        </div>
        <div class="product-price-row">
          <span class="price-now">₹${p.price}</span>
          ${p.originalPrice ? `<span class="price-old">₹${p.originalPrice}</span>
          <span class="price-save">Save ₹${p.originalPrice - p.price}</span>` : ''}
        </div>
        <button class="btn btn-add-cart" onclick="addToCart(${p.id})">
          <i class="fa fa-plus"></i> Add to Cart
        </button>
      </div>
    </div>
  `).join('');
}

/* ---------- HERO SLIDER ---------- */
function initHero() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.dot');
  if (!slides.length) return;
  let current = 0;

  function goTo(idx) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  }

  document.getElementById('heroNext')?.addEventListener('click', () => goTo(current + 1));
  document.getElementById('heroPrev')?.addEventListener('click', () => goTo(current - 1));
  dots.forEach(d => d.addEventListener('click', () => goTo(+d.dataset.idx)));

  setInterval(() => goTo(current + 1), 5000);
}

/* ---------- FILTER TABS ---------- */
function initTabs() {
  document.querySelectorAll('.filter-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderProducts(tab.dataset.filter);
    });
  });
}

/* ---------- HEADER SCROLL ---------- */
function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

/* ---------- MOBILE MENU ---------- */
function initMobileMenu() {
  const btn = document.getElementById('menuBtn');
  const nav = document.getElementById('mainNav');
  const overlay = document.getElementById('mobileOverlay');
  if (!btn || !nav) return;

  function toggle() {
    const open = nav.classList.toggle('open');
    btn.classList.toggle('open', open);
    if (overlay) overlay.classList.toggle('show', open);
    document.body.classList.toggle('nav-open', open);
  }

  btn.addEventListener('click', toggle);
  overlay?.addEventListener('click', toggle);
}

/* ---------- SEARCH ---------- */
function initSearch() {
  const toggle = document.getElementById('searchToggle');
  const bar = document.getElementById('searchBar');
  const close = document.getElementById('searchClose');
  const input = document.getElementById('searchInput');
  if (!toggle || !bar) return;

  toggle.addEventListener('click', () => {
    bar.classList.toggle('open');
    if (bar.classList.contains('open')) input?.focus();
  });
  close?.addEventListener('click', () => bar.classList.remove('open'));
}

/* ---------- CART SIDEBAR ---------- */
function initCartSidebar() {
  const btn = document.querySelector('.cart-btn');
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  const close = document.getElementById('cartClose');
  if (!btn || !sidebar) return;

  function open() {
    sidebar.classList.add('open');
    overlay?.classList.add('show');
    document.body.classList.add('cart-open');
  }
  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay?.classList.remove('show');
    document.body.classList.remove('cart-open');
  }

  btn.addEventListener('click', e => { e.preventDefault(); open(); });
  overlay?.addEventListener('click', closeSidebar);
  close?.addEventListener('click', closeSidebar);
}

/* ---------- DROPDOWN MENUS ---------- */
function initDropdowns() {
  document.querySelectorAll('.has-dropdown').forEach(item => {
    const dropdown = item.querySelector('.dropdown');
    if (!dropdown) return;
    item.addEventListener('mouseenter', () => dropdown.classList.add('open'));
    item.addEventListener('mouseleave', () => dropdown.classList.remove('open'));
  });
}

/* ---------- SCROLL REVEAL ---------- */
function initScrollReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.product-card, .cat-card, .step, .testimonial, .feature-card').forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
  });
}

/* ---------- INIT ---------- */
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  initHero();
  initTabs();
  initHeader();
  initMobileMenu();
  initSearch();
  initCartSidebar();
  initDropdowns();
  initScrollReveal();
  updateCartUI();
});
