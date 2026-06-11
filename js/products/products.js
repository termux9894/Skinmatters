// ============================================================
// js/products/products.js
// Handles: Fetch products, render grid, filter, sort
// Used by: products.html, index.html
// ============================================================

let allProducts = [];  // cached after first fetch

// ── FETCH ALL PRODUCTS ──────────────────────────────────────
async function fetchProducts({ category = null, featured = false, limit = null } = {}) {
  let query = window.supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('id');

  if (category)  query = query.eq('category_slug', category);
  if (featured)  query = query.eq('is_featured', true);
  if (limit)     query = query.limit(limit);

  const { data, error } = await query;

  if (error) {
    console.error('Products fetch error:', error.message);
    // Fallback to static data if Supabase not configured
    return typeof PRODUCTS !== 'undefined' ? PRODUCTS : [];
  }

  allProducts = data;
  return data;
}

// ── FETCH SINGLE PRODUCT BY ID ──────────────────────────────
async function fetchProductById(id) {
  const { data, error } = await window.supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Product fetch error:', error.message);
    // Fallback
    return typeof PRODUCTS !== 'undefined' ? PRODUCTS.find(p => p.id === +id) : null;
  }

  return data;
}

// ── FETCH RELATED PRODUCTS ──────────────────────────────────
async function fetchRelatedProducts(categorySlug, excludeId, limit = 4) {
  const { data, error } = await window.supabase
    .from('products')
    .select('*')
    .eq('category_slug', categorySlug)
    .eq('is_active', true)
    .neq('id', excludeId)
    .limit(limit);

  if (error) { console.error(error.message); return []; }
  return data;
}

// ── SEARCH PRODUCTS ─────────────────────────────────────────
async function searchProducts(query) {
  const q = query.toLowerCase();

  // Use cached products if available, else fetch
  const products = allProducts.length ? allProducts : await fetchProducts();

  return products.filter(p =>
    p.name?.toLowerCase().includes(q) ||
    p.description?.toLowerCase().includes(q) ||
    p.tagline?.toLowerCase().includes(q) ||
    p.category_slug?.toLowerCase().includes(q)
  );
}

// ── RENDER PRODUCT CARD ─────────────────────────────────────
function renderProductCard(p) {
  // Support both Supabase fields and static PRODUCTS fields
  const id        = p.id;
  const name      = p.name;
  const tagline   = p.tagline;
  const price     = p.price;
  const origPrice = p.original_price || p.originalPrice;

  // Fix image path
  let image = p.image_url || p.image || '';

const isProductsPage =
  window.location.pathname.includes('/pages/shop/');

if (image.startsWith('images/')) {
  image = isProductsPage
    ? `../../${image}`
    : `./${image}`;
}

console.log("FINAL IMAGE:", image);

  const badge       = p.badge || '';
  const rating      = parseFloat(p.rating) || 0;
  const reviewCount = p.reviews_count || p.reviews || 0;
  const stars       = '★'.repeat(Math.floor(rating)) + (rating % 1 ? '½' : '');
  const productLink =
  window.location.pathname.includes('/pages/shop/')
    ? `product.html?id=${id}`
    : `pages/shop/product.html?id=${id}`;

  return `
    <div class="product-card reveal" data-id="${id}">
      <a href="${productLink}" class="product-img-wrap">
        ${badge ? `<span class="product-badge">${badge}</span>` : ''}
        <img src="${image}" alt="${name}" loading="lazy"
          onerror="this.src='https://placehold.co/400x400/f5f0eb/888?text=${encodeURIComponent(name)}'" />
      </a>
      <div class="product-info">
        <p class="product-tagline">${tagline || ''}</p>
        <h3 class="product-name">
          <a href="${productLink}">${name}</a>
        </h3>
        <div class="product-rating">
          <span class="stars-mini">${stars}</span>
          <span class="review-count">(${reviewCount})</span>
        </div>
        <div class="product-price-row">
          <span class="price-now">${formatPrice(price)}</span>
          ${origPrice ? `
            <span class="price-old">${formatPrice(origPrice)}</span>
            <span class="price-save">
              Save ${formatPrice(origPrice - price)}
            </span>
          ` : ''}
        </div>
        <button class="btn btn-add-cart" onclick="addToCart(${id})">
          <i class="fa fa-plus"></i> Add to Cart
        </button>
        <button class="wishlist-btn"
        onclick="toggleWishlist(${id})">
    <i class="fa-regular fa-heart"></i>
</button>
      </div>
    </div>`;
}

// ── RENDER PRODUCTS INTO A GRID ─────────────────────────────
function renderProductsGrid(products, containerId = 'productsGrid') {
  const grid = document.getElementById(containerId);
  if (!grid) return;

  if (!products.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-muted)">
        <i class="fa fa-search" style="font-size:2rem;display:block;margin-bottom:12px;color:var(--border)"></i>
        No products found. <a href="./pages/shop/products.html" style="color:var(--brown)">View all products</a>
      </div>`;
    return;
  }

  grid.innerHTML = products.map(renderProductCard).join('');
  initScrollReveal();
}

// ── SORT PRODUCTS ───────────────────────────────────────────
function sortProducts(products, sortBy) {
  const sorted = [...products];
  switch (sortBy) {
    case 'price-asc':  return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc': return sorted.sort((a, b) => b.price - a.price);
    case 'rating':     return sorted.sort((a, b) => b.rating - a.rating);
    case 'newest':     return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    default:           return sorted;
  }
}

// ── FILTER PRODUCTS ─────────────────────────────────────────
function filterProducts(products, { categories = [], maxPrice = Infinity, minRating = 0 } = {}) {
  return products.filter(p => {
    const cat   = p.category_slug || p.category;
    const price = parseFloat(p.price);
    const rating = parseFloat(p.rating);
    const catOk   = categories.length === 0 || categories.includes(cat);
    const priceOk = price <= maxPrice;
    const ratingOk = rating >= minRating;
    return catOk && priceOk && ratingOk;
  });
}

// ── INIT: products.html ─────────────────────────────────────
async function initProductsPage() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  // Show loading state
  grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted)">
    <i class="fa fa-spinner fa-spin" style="font-size:2rem;display:block;margin-bottom:12px"></i>Loading products…
  </div>`;

  // Read category from URL
  const params = new URLSearchParams(window.location.search);
  const catParam = params.get('cat');

  let products = await fetchProducts({ category: catParam || null });

  // Update count
  const countEl = document.getElementById('productCount');
  if (countEl) countEl.textContent = `Showing ${products.length} products`;

  renderProductsGrid(products);

  // Wire up filter tabs
  document.querySelectorAll('.filter-tabs .tab').forEach(tab => {
    if (catParam && tab.dataset.filter === catParam) tab.classList.add('active');
    tab.addEventListener('click', async () => {
      document.querySelectorAll('.filter-tabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      const filtered = filter === 'all' ? products : filterProducts(products, { categories: [filter] });
      renderProductsGrid(filtered);
      if (countEl) countEl.textContent = `Showing ${filtered.length} products`;
    });
  });

  // Wire up sort
  document.getElementById('sortSelect')?.addEventListener('change', function () {
    const sorted = sortProducts(products, this.value);
    renderProductsGrid(sorted);
  });

  // Wire up sidebar price range
  document.getElementById('priceRange')?.addEventListener('input', function () {
    const max = parseInt(this.value);
    document.getElementById('priceMax').textContent = `₹${max}`;
    const checkedCats = [...document.querySelectorAll('.sidebar input[type=checkbox]:checked')].map(c => c.value);
    const filtered = filterProducts(products, { categories: checkedCats, maxPrice: max });
    renderProductsGrid(filtered);
  });

  // Wire up sidebar category checkboxes
  document.querySelectorAll('.sidebar input[type=checkbox]').forEach(cb => {
    cb.addEventListener('change', () => {
      const cats = [...document.querySelectorAll('.sidebar input[type=checkbox]:checked')].map(c => c.value);
      const max  = parseInt(document.getElementById('priceRange')?.value || 600);
      renderProductsGrid(filterProducts(products, { categories: cats, maxPrice: max }));
    });
  });
}

// ── INIT: Homepage best sellers ─────────────────────────────
async function initHomepageBestSellers() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  const products = await fetchProducts({ limit: 8 });
  renderProductsGrid(products);

  // Wire tabs
  document.querySelectorAll('.filter-tabs .tab').forEach(tab => {
    tab.addEventListener('click', async () => {
      document.querySelectorAll('.filter-tabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const f = tab.dataset.filter;
      const filtered = f === 'all' ? products : filterProducts(products, { categories: [f] });
      renderProductsGrid(filtered);
    });
  });
  document.addEventListener('DOMContentLoaded', () => {
  initProductsPage();
});
}
