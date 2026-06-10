// ============================================================
// js/products/product-detail.js
// Handles: Single product page — details, gallery, reviews
// Used by: product.html
// ============================================================

let currentProduct = null;
let currentQty     = 1;

// ── FETCH AND RENDER PRODUCT ─────────────────────────────────
async function initProductDetail() {
  const params = new URLSearchParams(window.location.search);
  const id     = params.get('id');

  if (!id) { window.location.href = PAGES.products; return; }

  const detail = document.getElementById('productDetail');
  if (detail) detail.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:80px">
      <i class="fa fa-spinner fa-spin" style="font-size:2rem;color:var(--text-muted)"></i>
    </div>`;

  currentProduct = await fetchProductById(id);

  if (!currentProduct) {
    if (detail) detail.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:80px">
        <h2>Product not found</h2>
        <a href=PAGES.products class="btn btn-dark" style="margin-top:20px">Browse Products</a>
      </div>`;
    return;
  }

  const p       = currentProduct;
  const image   = p.image_url || p.image || '';
  const origPrice = p.original_price || p.originalPrice;
  const stars   = '★'.repeat(Math.floor(p.rating)) + (p.rating % 1 ? '½' : '');

  // Update page title and breadcrumb
  document.title = `${p.name} – SkinMatters`;
  const breadEl = document.getElementById('breadProduct');
  if (breadEl) breadEl.textContent = p.name;

  if (detail) detail.innerHTML = `
    <div class="product-gallery">
      <div class="main-img">
        <img src="${image}" id="mainImg" alt="${p.name}"
          onerror="this.src='https://placehold.co/500x500/f5f0eb/888?text=${encodeURIComponent(p.name)}'" />
      </div>
      <div class="img-thumbs">
        <div class="thumb active">
          <img src="${image}" onerror="this.src='https://placehold.co/80x80/f5f0eb/888'" />
        </div>
      </div>
    </div>
    <div class="product-content">
      <p class="pd-tag">${p.category_slug || p.category} &nbsp;·&nbsp; ${p.tagline || ''}</p>
      <h1 class="pd-name">${p.name}</h1>
      <div class="pd-rating">
        <span class="pd-stars">${stars}</span>
        <span style="font-weight:600">${p.rating}</span>
        <span style="color:var(--text-muted);font-size:0.85rem">(${p.reviews_count || p.reviews || 0} reviews)</span>
        <a href="#reviews" style="font-size:0.82rem;color:var(--brown);margin-left:8px">Read reviews</a>
      </div>
      <div class="pd-price-row">
        <span class="pd-price">${formatPrice(p.price)}</span>
        ${origPrice ? `<span class="pd-old-price">${formatPrice(origPrice)}</span>
          <span class="pd-save">Save ${formatPrice(origPrice - p.price)}</span>` : ''}
      </div>
      ${p.description ? `<p class="pd-desc">${p.description}</p>` : ''}
      ${p.how_to_use ? `
        <div style="margin-bottom:20px">
          <h4 style="font-size:0.82rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-muted);margin-bottom:8px">How to Use</h4>
          <p style="font-size:0.88rem;color:var(--text-muted);line-height:1.7">${p.how_to_use}</p>
        </div>` : ''}
      ${p.weight_grams ? `<p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:16px">Net weight: ${p.weight_grams}g</p>` : ''}
      <div class="qty-row">
        <label style="font-size:0.85rem;font-weight:500">Quantity</label>
        <div class="qty-ctrl">
          <button onclick="setQty(currentQty - 1)">−</button>
          <span id="qtyDisplay">1</span>
          <button onclick="setQty(currentQty + 1)">+</button>
        </div>
        ${p.stock_quantity <= 10 && p.stock_quantity > 0
          ? `<span style="font-size:0.78rem;color:#e53e3e;font-weight:500">Only ${p.stock_quantity} left!</span>` : ''}
      </div>
      <div class="pd-actions">
        <button class="btn btn-dark" onclick="addToCartAndShow(${p.id})">
          <i class="fa fa-shopping-bag"></i> Add to Cart
        </button>
        <button class="btn btn-outline" id="wishlistBtn" onclick="toggleWishlist(${p.id})">
          <i class="fa fa-heart"></i> Wishlist
        </button>
      </div>
      <div class="pd-features">
        <div class="pd-feature"><i class="fa fa-leaf"></i> 100% Natural</div>
        <div class="pd-feature"><i class="fa fa-truck"></i> Free shipping ₹999+</div>
        <div class="pd-feature"><i class="fa fa-undo"></i> Easy returns</div>
        <div class="pd-feature"><i class="fa fa-shield-alt"></i> Authentic product</div>
      </div>
    </div>`;

  // Load related products
  const cat = p.category_slug || p.category;
  if (cat) {
    const related = await fetchRelatedProducts(cat, p.id, 4);
    const relGrid = document.getElementById('relatedGrid');
    const relSection = document.getElementById('relatedSection');
    if (related.length && relGrid && relSection) {
      relSection.style.display = 'block';
      relGrid.innerHTML = related.map(renderProductCard).join('');
      initScrollReveal();
    }
  }

  // Load reviews
  await loadReviews(p.id);
}

// ── QUANTITY CONTROL ─────────────────────────────────────────
function setQty(n) {
  const max = currentProduct?.stock_quantity || 99;
  currentQty = Math.max(1, Math.min(n, max));
  const display = document.getElementById('qtyDisplay');
  if (display) display.textContent = currentQty;
}

// ── ADD TO CART WITH QTY ─────────────────────────────────────
async function addToCartAndShow(id) {
  for (let i = 0; i < currentQty; i++) await addToCart(id);
}

// ── TOGGLE WISHLIST ──────────────────────────────────────────
async function toggleWishlist(productId) {
  const user = await getCurrentUser();
  if (!user) { window.location.href = PAGES.login; return; }

  const btn = document.getElementById('wishlistBtn');

  // Check if already in wishlist
  const { data: existing } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single();

  if (existing) {
    await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', productId);
    showToast('Removed from wishlist');
    if (btn) btn.innerHTML = '<i class="fa fa-heart"></i> Wishlist';
  } else {
    await supabase.from('wishlists').insert({ user_id: user.id, product_id: productId });
    showToast('Added to wishlist! ❤️', 'success');
    if (btn) btn.innerHTML = '<i class="fa fa-heart" style="color:#e53e3e"></i> Wishlisted';
  }
}

document.addEventListener('DOMContentLoaded', initProductDetail);
