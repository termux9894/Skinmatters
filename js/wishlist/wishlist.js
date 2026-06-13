// ============================================================
// js/wishlist/wishlist.js
// Handles: Wishlist add/remove/list
// Syncs with Supabase when logged in
// Falls back to localStorage for guests
// ============================================================

// ── TOGGLE WISHLIST ─────────────────────────────────────────
async function toggleWishlist(productId) {
  const user = await getCurrentUser();

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

    } else {

      await supabase
        .from('wishlists')
        .insert({
          user_id: user.id,
          product_id: productId
        });

      showToast('Added to wishlist ❤️', 'success');
    }

  } else {

    let wishlist = getLocalWishlist();

    const exists = wishlist.includes(productId);

    if (exists) {
      wishlist = wishlist.filter(id => id !== productId);
      showToast('Removed from wishlist ❤️', 'success');
    } else {
      wishlist.push(productId);
      showToast('Added to wishlist ❤️', 'success');
    }

    saveLocalWishlist(wishlist);
  }

  await refreshWishlistCount();
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
}
function addToWishlist(productId) {
  return toggleWishlist(productId);
}