// ============================================================
// js/search/search.js
// Handles: Real-time product search via Supabase
// Used by: search.html, and header search bar
// ============================================================

let searchTimeout = null;

// ── SEARCH PRODUCTS IN SUPABASE ───────────────────────────────
async function supabaseSearch(query) {
  if (!query || query.length < 2) return [];

  const { data, error } = await supabase
    .from('products')
    .select('id, name, tagline, price, original_price, image_url, badge, category_slug, rating, reviews_count')
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,tagline.ilike.%${query}%,description.ilike.%${query}%,category_slug.ilike.%${query}%`)
    .limit(20);

  if (error) {
    console.error('Search error:', error.message);
    // Fallback: search static data
    if (typeof PRODUCTS !== 'undefined') {
      const lq = query.toLowerCase();
      return PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(lq) ||
        p.description?.toLowerCase().includes(lq) ||
        p.category?.toLowerCase().includes(lq)
      );
    }
    return [];
  }

  return data || [];
}

// ── SEARCH BLOG POSTS ──────────────────────────────────────────
async function searchBlogPosts(query) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, category, emoji, published_at')
    .eq('is_published', true)
    .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,category.ilike.%${query}%`)
    .limit(5);

  if (error) { console.error(error.message); return []; }
  return data || [];
}

// ── HIGHLIGHT MATCHING TEXT ───────────────────────────────────
function highlight(text, query) {
  if (!query || !text) return text || '';
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${escaped})`, 'gi'),
    '<mark style="background:rgba(107,66,38,0.15);border-radius:3px;padding:0 2px">$1</mark>'
  );
}

// ── RENDER SEARCH RESULTS ─────────────────────────────────────
function renderSearchResults(products, blogs, query, containerId = 'searchResults') {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Hide default state
  const defaultState = document.getElementById('defaultState');
  if (defaultState) defaultState.style.display = 'none';

  if (!products.length && !blogs.length) {
    container.innerHTML = `
      <div style="text-align:center;padding:80px 20px">
        <i class="fa fa-search" style="font-size:3rem;display:block;margin-bottom:16px;color:var(--border)"></i>
        <h2 style="font-family:var(--font-display);font-size:1.8rem;margin-bottom:8px">
          No results for "<em>${query}</em>"
        </h2>
        <p style="color:var(--text-muted);margin-bottom:24px">
          Try different keywords, or browse all products.
        </p>
        <a href=PAGES.products class="btn btn-dark">Browse All Products</a>
      </div>`;
    return;
  }

  let html = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px">
      <p style="color:var(--text-muted);font-size:0.88rem">
        Found <strong>${products.length} product${products.length !== 1 ? 's' : ''}</strong>
        ${blogs.length ? ` and <strong>${blogs.length} article${blogs.length !== 1 ? 's' : ''}</strong>` : ''}
        for "<strong>${query}</strong>"
      </p>
      <select class="sort-select" onchange="sortSearchResults(this.value)">
        <option value="default">Most relevant</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="rating">Top Rated</option>
      </select>
    </div>`;

  if (products.length) {
    html += `<div class="products-grid" id="searchProductGrid">` +
      products.map(p => {
        const price    = parseFloat(p.price);
        const origPrice = p.original_price ? parseFloat(p.original_price) : null;
        const image    = p.image_url || p.image || '';
        const rating   = parseFloat(p.rating) || 0;
        const stars    = '★'.repeat(Math.floor(rating));
        const reviews  = p.reviews_count || p.reviews || 0;

        return `
          <div class="product-card reveal">
            <a href="product.html?id=${p.id}" class="product-img-wrap">
              ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
              <img src="${image}" alt="${p.name}" loading="lazy"
                onerror="this.src='https://placehold.co/400x400/f5f0eb/888?text=${encodeURIComponent(p.name)}'"/>
            </a>
            <div class="product-info">
              <p class="product-tagline">${p.tagline || ''}</p>
              <h3 class="product-name">
                <a href="product.html?id=${p.id}">${highlight(p.name, query)}</a>
              </h3>
              <div class="product-rating">
                <span class="stars-mini" style="color:#f5a623">${stars}</span>
                <span class="review-count">(${reviews})</span>
              </div>
              <div class="product-price-row">
                <span class="price-now">${formatPrice(price)}</span>
                ${origPrice ? `<span class="price-old">${formatPrice(origPrice)}</span>` : ''}
              </div>
              <button class="btn btn-add-cart" onclick="addToCart(${p.id})">
                <i class="fa fa-plus"></i> Add to Cart
              </button>
            </div>
          </div>`;
      }).join('') + `</div>`;
  }

  if (blogs.length) {
    html += `
      <div style="margin-top:48px;border-top:1px solid var(--border);padding-top:40px">
        <h2 style="font-family:var(--font-display);font-size:1.4rem;margin-bottom:20px">📝 Related Articles</h2>
        ${blogs.map(b => `
          <div style="display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid var(--border);cursor:pointer;transition:var(--transition)"
            onclick="window.location.href='blog-post.html?slug=${b.slug}'">
            <div style="width:44px;height:44px;border-radius:var(--radius-sm);background:var(--warm-white);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0">
              ${b.emoji || '📝'}
            </div>
            <div style="flex:1">
              <h4 style="font-size:0.9rem;font-weight:500;margin-bottom:3px">${highlight(b.title, query)}</h4>
              <span style="font-size:0.78rem;color:var(--text-muted)">${b.category} · ${formatDate(b.published_at)}</span>
            </div>
            <i class="fa fa-chevron-right" style="color:var(--text-muted);font-size:0.8rem;flex-shrink:0"></i>
          </div>`).join('')}
      </div>`;
  }

  container.innerHTML = html;
  initScrollReveal();
}

// ── SORT CURRENT SEARCH RESULTS ───────────────────────────────
let _lastSearchProducts = [];

function sortSearchResults(val) {
  const sorted = [..._lastSearchProducts];
  if (val === 'price-asc')  sorted.sort((a, b) => a.price - b.price);
  if (val === 'price-desc') sorted.sort((a, b) => b.price - a.price);
  if (val === 'rating')     sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const grid = document.getElementById('searchProductGrid');
  if (grid) {
    const query = document.getElementById('mainSearch')?.value || '';
    grid.innerHTML = sorted.map(p => {
      const image = p.image_url || p.image || '';
      return `<div class="product-card">
        <a href="product.html?id=${p.id}" class="product-img-wrap">
          <img src="${image}" alt="${p.name}" onerror="this.src='https://placehold.co/400x400/f5f0eb/888'"/>
        </a>
        <div class="product-info">
          <h3 class="product-name"><a href="product.html?id=${p.id}">${p.name}</a></h3>
          <div class="product-price-row"><span class="price-now">${formatPrice(p.price)}</span></div>
          <button class="btn btn-add-cart" onclick="addToCart(${p.id})">Add to Cart</button>
        </div>
      </div>`;
    }).join('');
  }
}

// ── HEADER INSTANT SEARCH DROPDOWN ───────────────────────────
function initHeaderSearch() {
  const input = document.getElementById('searchInput');
  if (!input) return;

  let dropdown = document.getElementById('searchDropdown');
  if (!dropdown) {
    dropdown = document.createElement('div');
    dropdown.id = 'searchDropdown';
    dropdown.style.cssText = `
      position:absolute;top:100%;left:0;right:0;background:#fff;
      border:1px solid var(--border);border-top:none;border-radius:0 0 var(--radius) var(--radius);
      box-shadow:var(--shadow);max-height:400px;overflow-y:auto;z-index:1001;display:none;
    `;
    input.parentElement.style.position = 'relative';
    input.parentElement.appendChild(dropdown);
  }

  input.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    const q = input.value.trim();
    if (q.length < 2) { dropdown.style.display = 'none'; return; }

    searchTimeout = setTimeout(async () => {
      const results = await supabaseSearch(q);
      if (!results.length) { dropdown.style.display = 'none'; return; }

      dropdown.innerHTML = results.slice(0, 6).map(p => {
        const image = p.image_url || p.image || '';
        return `<a href="product.html?id=${p.id}" style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--border);text-decoration:none;color:var(--text);transition:background 0.15s" onmouseover="this.style.background='var(--warm-white)'" onmouseout="this.style.background='#fff'">
          <img src="${image}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;background:var(--cream)" onerror="this.src='https://placehold.co/40x40/f5f0eb/888'"/>
          <div style="flex:1">
            <p style="font-size:0.85rem;font-weight:500;margin-bottom:2px">${highlight(p.name, q)}</p>
            <p style="font-size:0.75rem;color:var(--text-muted)">${formatPrice(p.price)}</p>
          </div>
        </a>`;
      }).join('') +
      `<a href="search.html?q=${encodeURIComponent(q)}" style="display:block;text-align:center;padding:12px;font-size:0.82rem;color:var(--brown);font-weight:500;background:var(--warm-white)">
        See all results for "${q}" →
      </a>`;

      dropdown.style.display = 'block';
    }, 300);
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = input.value.trim();
      if (q) window.location.href = PAGES.search + `?q=${encodeURIComponent(q)}`;
      dropdown.style.display = 'none';
    }
    if (e.key === 'Escape') dropdown.style.display = 'none';
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('#searchBar')) dropdown.style.display = 'none';
  });
}

// ── INIT: search.html ─────────────────────────────────────────
async function initSearchPage() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');

  if (q) {
    const input = document.getElementById('mainSearch');
    if (input) input.value = q;

    // Show loading
    const container = document.getElementById('searchResults');
    if (container) container.innerHTML = `
      <div style="text-align:center;padding:60px;color:var(--text-muted)">
        <i class="fa fa-spinner fa-spin" style="font-size:2rem;display:block;margin-bottom:12px"></i>
        Searching for "${q}"…
      </div>`;

    const [products, blogs] = await Promise.all([
      supabaseSearch(q),
      searchBlogPosts(q)
    ]);

    _lastSearchProducts = products;
    renderSearchResults(products, blogs, q);
  } else {
    // Load popular products as default
    const popular = await fetchProducts({ limit: 4 });
    const grid = document.getElementById('popularGrid');
    if (grid) grid.innerHTML = popular.map(renderProductCard).join('');
    initScrollReveal();
  }

  // Wire up search bar
  document.getElementById('mainSearch')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = document.getElementById('mainSearch').value.trim();
      if (q) {
        history.pushState({}, '', `?q=${encodeURIComponent(q)}`);
        initSearchPage();
      }
    }
  });

  document.getElementById('searchBtn')?.addEventListener('click', () => {
    const q = document.getElementById('mainSearch')?.value.trim();
    if (q) {
      history.pushState({}, '', `?q=${encodeURIComponent(q)}`);
      initSearchPage();
    }
  });

  // Quick tag clicks
  document.querySelectorAll('.pop-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const q = tag.dataset.q || tag.textContent.trim();
      const input = document.getElementById('mainSearch');
      if (input) input.value = q;
      history.pushState({}, '', `?q=${encodeURIComponent(q)}`);
      initSearchPage();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('searchResults')) initSearchPage();
});
