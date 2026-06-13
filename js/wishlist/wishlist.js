// ============================================================
// js/wishlist/wishlist.js
// Handles: Wishlist add/remove/list
// Syncs with Supabase when logged in
// Falls back to localStorage for guests
// ============================================================

// ── TOGGLE WISHLIST ─────────────────────────────────────────
async function toggleWishlist(productId) {
  const user = await getCurrentUser();
  let newState;

  if (user) {
    const { data: existing } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('wishlists')
        .delete()
        .eq('id', existing.id);
      showToast('Removed from wishlist ❤️', 'success');
      newState = false;
    } else {
      await supabase
        .from('wishlists')
        .insert({
          user_id: user.id,
          product_id: productId
        });
      showToast('Added to wishlist ❤️', 'success');
      newState = true;
    }

  } else {
    let wishlist = getLocalWishlist();
    const exists = wishlist.includes(productId);

    if (exists) {
      wishlist = wishlist.filter(id => id !== productId);
      showToast('Removed from wishlist ❤️', 'success');
      newState = false;
    } else {
      wishlist.push(productId);
      showToast('Added to wishlist ❤️', 'success');
      newState = true;
    }

    saveLocalWishlist(wishlist);
  }

  updateWishlistButtons(productId, newState);
  await refreshWishlistCount();
}

function updateWishlistButtons(productId, isWishlisted) {
  const selectors = [
    `button.wishlist-btn[data-product-id="${productId}"]`,
    '#wishlistBtn'
  ].join(',');

  document.querySelectorAll(selectors).forEach(btn => {
    const icon = btn.querySelector('i.fa-heart');
    if (icon) {
      if (isWishlisted) {
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
        icon.style.color = '#e53e3e';
      } else {
        icon.classList.remove('fa-solid');
        icon.classList.add('fa-regular');
        icon.style.color = '';
      }
    }

    if (btn.id === 'wishlistBtn') {
      btn.innerHTML = isWishlisted
        ? '<i class="fa fa-heart" style="color:#e53e3e"></i> Wishlisted'
        : '<i class="fa fa-heart"></i> Wishlist';
    }
  });
}

// ── CHECK IF PRODUCT IS IN WISHLIST ─────────────────────────
async function isWishlisted(productId) {

  const user = await getCurrentUser();

  if (user) {

    const { data } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .maybeSingle();

    return !!data;

  }

  return getLocalWishlist().includes(productId);
}

// ── GET WISHLIST ITEMS ──────────────────────────────────────
async function getWishlistItems() {

  const user = await getCurrentUser();

  if (user) {

    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        product:products (
          id,
          name,
          price,
          image_url,
          rating,
          reviews_count,
          badge
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error(error.message);
      return [];
    }

    return (data || []).map(item => item.product);
  }

  const ids = getLocalWishlist();
  if (typeof PRODUCTS === 'undefined') return ids.map(id => ({ id }));
  return PRODUCTS.filter(p => ids.includes(p.id));
}

// ── REMOVE FROM WISHLIST ────────────────────────────────────
async function removeFromWishlist(productId) {

  const user = await getCurrentUser();

  if (user) {

    await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

  } else {

    saveLocalWishlist(
      getLocalWishlist().filter(id => id !== productId)
    );
  }

  await refreshWishlistCount();
}

// ── WISHLIST COUNT ──────────────────────────────────────────
async function getWishlistCount() {

  const items = await getWishlistItems();
  return items.length;
}

// ── REFRESH COUNT BADGE ─────────────────────────────────────
async function refreshWishlistCount() {

  const count = await getWishlistCount();

  document
    .querySelectorAll('#wishlistCount, .wishlist-count')
    .forEach(el => {

      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';

    });
}

// ── LOCAL STORAGE HELPERS ───────────────────────────────────
function getLocalWishlist() {

  return JSON.parse(
    localStorage.getItem('sm_wishlist') || '[]'
  );
}

function saveLocalWishlist(data) {

  localStorage.setItem(
    'sm_wishlist',
    JSON.stringify(data)
  );
}
function testWishlist() {
  let wishlist = getLocalWishlist();
  wishlist.push(1);
  saveLocalWishlist(wishlist);
  console.log(localStorage.getItem('sm_wishlist'));
}
// ── INIT ────────────────────────────────────────────────────
async function initWishlist() {
  await refreshWishlistCount();
  await syncWishlistButtons();
}

async function syncWishlistButtons() {
  const user = await getCurrentUser();
  let ids = [];

  if (user) {
    const items = await getWishlistItems();
    ids = items.map(item => item?.id).filter(Boolean);
  } else {
    ids = getLocalWishlist();
  }

  ids.forEach(id => updateWishlistButtons(id, true));
}

function addToWishlist(productId) {
  return toggleWishlist(productId);
}