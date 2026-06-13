// ============================================================
// js/cart/cart.js
// Handles: Add, remove, update cart — syncs with Supabase
//          Falls back to localStorage when not logged in
// Used by: All pages (via layout.js)
// ============================================================

// ── ADD TO CART ─────────────────────────────────────────────
async function addToCart(productId) {
  const user = await getCurrentUser();

  if (user) {
    // Logged in → use Supabase cart
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single();

    if (existing) {
      await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + 1 })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('cart_items')
        .insert({ user_id: user.id, product_id: productId, quantity: 1 });
    }
  } else {
    // Guest → use localStorage
    let cart = getLocalCart();
    const existing = cart.find(i => i.id === productId);
    if (existing) {
      existing.qty += 1;
    } else {
      // Find product data (from static PRODUCTS or fetch)
      const product = typeof PRODUCTS !== 'undefined'
        ? PRODUCTS.find(p => p.id === productId)
        : allProducts.find(p => p.id === productId);
      if (product) cart.push({ id: productId, qty: 1, ...product });
    }
    saveLocalCart(cart);
  }

  // Update UI count
  await refreshCartCount();

  // Get product name for toast
  const product = typeof PRODUCTS !== 'undefined'
    ? PRODUCTS.find(p => p.id === productId)
    : null;
  showToast(`${product?.name || 'Item'} added to cart! 🛒`, 'success');
}

// ── REMOVE FROM CART ─────────────────────────────────────────
async function removeFromCart(productId) {
  const user = await getCurrentUser();

  if (user) {
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);
  } else {
    saveLocalCart(getLocalCart().filter(i => i.id !== productId));
  }

  await refreshCartCount();
  await renderCartUI(); // Re-render wherever cart is shown
}

// ── UPDATE QUANTITY ──────────────────────────────────────────
async function updateCartQty(productId, delta) {
  const user = await getCurrentUser();

  if (user) {
    const { data: item } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single();

    if (!item) return;
    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      await removeFromCart(productId);
    } else {
      await supabase
        .from('cart_items')
        .update({ quantity: newQty })
        .eq('id', item.id);
      await refreshCartCount();
      await renderCartUI();
    }
  } else {
    let cart = getLocalCart();
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(i => i.id !== productId);
    saveLocalCart(cart);
    await refreshCartCount();
    await renderCartUI();
  }
}

// ── FETCH CART ITEMS ─────────────────────────────────────────
async function getCartItems() {
  const user = await getCurrentUser();

  if (user) {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        product:products (
          id, name, price, original_price, image_url, category_slug
        )
      `)
      .eq('user_id', user.id);

    if (error) { console.error(error.message); return []; }

    return (data || []).map(item => {
      const fallbackProduct = typeof PRODUCTS !== 'undefined'
        ? PRODUCTS.find(p => p.id === item.product.id)
        : null;

      return {
      id:    item.product.id,
      name:  item.product.name,
      price: parseFloat(item.product.price),
      image: item.product.image_url || fallbackProduct?.image || '',
      qty:   item.quantity
      };
    });
  } else {
    return getLocalCart();
  }
}

function getCartImageSrc(image) {
  if (!image) return '';
  if (/^(https?:)?\/\//.test(image) || image.startsWith('data:')) return image;
  if (image.startsWith('../../') || image.startsWith('../')) return image;

  // Build a site-root absolute path so images resolve correctly from any page.
  // Example: /Skinmatters/images/xyz.png
  const parts = window.location.pathname.split('/').filter(Boolean);
  const siteRoot = parts.length ? `/${parts[0]}` : '';

  if (image.startsWith('images/')) return `${siteRoot}/${image}`;
  if (image.startsWith('/images/')) return `${siteRoot}${image}`;

  return image;
}

// ── GET CART COUNT ───────────────────────────────────────────
async function getCartCount() {
  const items = await getCartItems();
  return items.reduce((sum, i) => sum + (i.qty || i.quantity || 1), 0);
}

// ── REFRESH CART COUNT BADGE ─────────────────────────────────
async function refreshCartCount() {
  const count = await getCartCount();
  document.querySelectorAll('#cartCount, .cart-count').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

// ── RENDER CART SIDEBAR ──────────────────────────────────────
async function renderCartUI() {
  const cartBody   = document.getElementById('cartBody');
  const cartFooter = document.getElementById('cartFooter');
  const countEl    = document.getElementById('cartItemCount');

  if (!cartBody) return;

  const items = await getCartItems();
  const total = items.reduce((s, i) => s + i.price * (i.qty || 1), 0);
  const count = items.reduce((s, i) => s + (i.qty || 1), 0);

  if (countEl) countEl.textContent = count;
  document.querySelectorAll('#cartTotal').forEach(el => el.textContent = formatPrice(total));

  if (!items.length) {
    cartBody.innerHTML = `
      <div class="cart-empty">
        <i class="fa fa-shopping-bag"></i>
        <p>Your cart is empty</p>
        <a href=PAGES.products class="btn btn-dark">Start Shopping</a>
      </div>`;
    if (cartFooter) cartFooter.style.display = 'none';
    return;
  }

    cartBody.innerHTML = items.map(item => `
    <div class="cart-item">
      <img src="${getCartImageSrc(item.image)}" alt="${item.name}"
        onerror="this.src='https://placehold.co/80x80/f5f0eb/888'" />
      <div class="ci-info">
        <p class="ci-name">${item.name}</p>
        <p class="ci-price">${formatPrice(item.price)}</p>
        <div class="ci-qty">
          <button onclick="updateCartQty(${item.id}, -1)">−</button>
          <span>${item.qty || 1}</span>
          <button onclick="updateCartQty(${item.id}, 1)">+</button>
        </div>
      </div>
      <button class="ci-remove" onclick="removeFromCart(${item.id})">
        <i class="fa fa-times"></i>
      </button>
    </div>`).join('');

  if (cartFooter) cartFooter.style.display = 'block';
}

// ── CLEAR ENTIRE CART ────────────────────────────────────────
async function clearCart() {
  const user = await getCurrentUser();
  if (user) {
    await supabase.from('cart_items').delete().eq('user_id', user.id);
  } else {
    saveLocalCart([]);
  }
  await refreshCartCount();
}

// ── LOCAL STORAGE HELPERS (for guests) ───────────────────────
function getLocalCart() {
  return JSON.parse(localStorage.getItem('sm_cart') || '[]');
}

function saveLocalCart(cart) {
  localStorage.setItem('sm_cart', JSON.stringify(cart));
}

// ── INIT: Called from layout.js on every page ────────────────
async function initCart() {
  await refreshCartCount();

  // Cart sidebar toggle
  document.getElementById('cartClose')?.addEventListener('click', closeCartSidebar);
  document.getElementById('cartOverlay')?.addEventListener('click', closeCartSidebar);

  document.querySelector('.cart-btn')?.addEventListener('click', async (e) => {
    e.preventDefault();
    await renderCartUI();
    openCartSidebar();
  });
}

function openCartSidebar() {
  document.getElementById('cartSidebar')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('show');
  document.body.classList.add('cart-open');
}

function closeCartSidebar() {
  document.getElementById('cartSidebar')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('show');
  document.body.classList.remove('cart-open');
}
