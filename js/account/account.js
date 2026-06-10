// ============================================================
// js/account/account.js
// Handles: Profile, Addresses, Wishlist from Supabase
// Used by: account.html, wishlist.html
// ============================================================

// ── INIT ACCOUNT PAGE ────────────────────────────────────────
async function initAccountPage() {
  const user = await requireAuth();
  if (!user) return;

  const profile = await getUserProfile(user.id);

  // Update hero and sidebar
  const name   = profile?.full_name || user.email.split('@')[0];
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const email  = user.email;

  document.getElementById('heroName')?.setAttribute('data-name', name.split(' ')[0]);
  const heroName = document.getElementById('heroName');
  if (heroName) heroName.textContent = name.split(' ')[0];
  document.getElementById('avatarInitial').textContent   = initials;
  document.getElementById('sidebarName').textContent     = name;
  document.getElementById('sidebarEmail').textContent    = email;
  document.getElementById('addrName').textContent        = name;

  // Pre-fill profile form
  const parts = name.split(' ');
  const pfirst = document.getElementById('pFirst');
  const plast  = document.getElementById('pLast');
  const pemail = document.getElementById('pEmail');
  const pphone = document.getElementById('pPhone');
  const pbday  = document.getElementById('pBday');
  if (pfirst) pfirst.value = parts[0] || '';
  if (plast)  plast.value  = parts.slice(1).join(' ') || '';
  if (pemail) pemail.value = email;
  if (pphone) pphone.value = profile?.phone || '';
  if (pbday && profile?.birthday) pbday.value = profile.birthday;

  // Set referral code
  const refCode = document.getElementById('refCode');
  if (refCode) refCode.textContent = profile?.referral_code || 'SKIN-' + name.split(' ')[0].toUpperCase();

  // Reward points
  const pts = profile?.reward_points || 0;
  document.querySelectorAll('.reward-pts').forEach(el => el.textContent = pts);
  const loyaltyFill = document.getElementById('loyaltyFill');
  if (loyaltyFill) loyaltyFill.style.width = Math.min((pts / 1000) * 100, 100) + '%';

  // Load orders
  const orders = await fetchUserOrders();
  renderOrders(orders);

  // Load addresses
  await loadAddresses(user.id);

  // Load wishlist
  await loadWishlistPreview(user.id);
}

// ── SAVE PROFILE ─────────────────────────────────────────────
async function saveProfile() {
  const user = await getCurrentUser();
  if (!user) return;

  const first = document.getElementById('pFirst')?.value.trim();
  const last  = document.getElementById('pLast')?.value.trim();
  const phone = document.getElementById('pPhone')?.value.trim();
  const bday  = document.getElementById('pBday')?.value;

  const btn = document.getElementById('saveProfileBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: `${first} ${last}`.trim(),
      phone,
      birthday: bday || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id);

  if (btn) { btn.disabled = false; btn.textContent = 'Save Changes'; }

  if (error) { showToast(error.message, 'error'); return; }
  showToast('Profile updated! 🌿', 'success');
}

// ── LOAD ADDRESSES ───────────────────────────────────────────
async function loadAddresses(userId) {
  const { data: addresses, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false });

  const grid = document.getElementById('addressGrid');
  if (!grid) return;

  const cards = (addresses || []).map(addr => `
    <div class="address-card ${addr.is_default ? 'default' : ''}">
      ${addr.is_default ? '<span class="address-default-badge">Default</span>' : ''}
      <h4>${addr.label || 'Home'}</h4>
      <p>${addr.full_name}</p>
      <p>${addr.line1}${addr.line2 ? ', ' + addr.line2 : ''}<br/>
         ${addr.city} – ${addr.pin}<br/>
         ${addr.state}, ${addr.country}</p>
      <p>📞 ${addr.phone}</p>
      <div class="address-actions">
        <a onclick="editAddress('${addr.id}')">Edit</a>
        ${!addr.is_default ? `<a onclick="setDefaultAddress('${addr.id}')">Set Default</a>` : ''}
        <a style="color:#e53e3e" onclick="deleteAddress('${addr.id}')">Delete</a>
      </div>
    </div>`).join('');

  grid.innerHTML = cards + `
    <div class="address-card" style="border:2px dashed var(--border);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;min-height:180px" onclick="showAddAddressForm()">
      <i class="fa fa-plus" style="font-size:1.5rem;color:var(--text-muted);margin-bottom:10px"></i>
      <p style="font-size:0.85rem;color:var(--text-muted)">Add New Address</p>
    </div>`;
}

// ── ADD ADDRESS ───────────────────────────────────────────────
async function addAddress(formData) {
  const user = await getCurrentUser();
  if (!user) return;

  const { error } = await supabase
    .from('addresses')
    .insert({ user_id: user.id, ...formData });

  if (error) { showToast(error.message, 'error'); return; }
  showToast('Address saved!', 'success');
  await loadAddresses(user.id);
}

// ── SET DEFAULT ADDRESS ──────────────────────────────────────
async function setDefaultAddress(addressId) {
  const user = await getCurrentUser();
  if (!user) return;

  // Remove default from all
  await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
  // Set new default
  await supabase.from('addresses').update({ is_default: true }).eq('id', addressId);
  showToast('Default address updated!', 'success');
  await loadAddresses(user.id);
}

// ── DELETE ADDRESS ────────────────────────────────────────────
async function deleteAddress(addressId) {
  if (!confirm('Delete this address?')) return;
  const { error } = await supabase.from('addresses').delete().eq('id', addressId);
  if (error) { showToast(error.message, 'error'); return; }
  showToast('Address deleted');
  const user = await getCurrentUser();
  if (user) await loadAddresses(user.id);
}

// ── LOAD WISHLIST PREVIEW ────────────────────────────────────
async function loadWishlistPreview(userId) {
  const { data, error } = await supabase
    .from('wishlists')
    .select('product:products(id, name, price, image_url)')
    .eq('user_id', userId)
    .limit(4);

  const count = document.getElementById('wishlistCount');
  if (count) count.textContent = data?.length || 0;
}

// ── FULL WISHLIST PAGE ────────────────────────────────────────
async function initWishlistPage() {
  const user = await getCurrentUser();
  const c    = document.getElementById('wishlistContent');
  if (!c) return;

  if (!user) {
    c.innerHTML = `<div class="wishlist-empty">
      <i class="fa fa-heart"></i>
      <h2>Please log in to view your wishlist</h2>
      <a href=PAGES.login class="btn btn-dark" style="margin-top:20px">Login</a>
    </div>`;
    return;
  }

  const { data, error } = await supabase
    .from('wishlists')
    .select('product_id, product:products(id, name, tagline, price, original_price, image_url, badge)')
    .eq('user_id', user.id);

  if (error || !data?.length) {
    c.innerHTML = `<div class="wishlist-empty">
      <i class="fa fa-heart"></i>
      <h2 style="font-family:var(--font-display);font-size:1.6rem;margin-bottom:10px">Your wishlist is empty</h2>
      <p style="color:var(--text-muted);margin-bottom:24px">Save products you love to buy them later.</p>
      <a href=PAGES.products class="btn btn-dark">Explore Products</a>
    </div>`;
    return;
  }

  const items = data.map(d => d.product).filter(Boolean);

  c.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px">
      <h2 style="font-family:var(--font-display);font-size:1.4rem">${items.length} Saved Item${items.length > 1 ? 's' : ''}</h2>
      <button class="btn btn-outline-dark" onclick="moveAllWishlistToCart()">
        <i class="fa fa-shopping-bag"></i>&nbsp; Add All to Cart
      </button>
    </div>
    <div class="wishlist-grid">
      ${items.map(p => `
        <div class="wishlist-product-card">
          <button class="wl-remove" onclick="removeFromWishlist(${p.id})" title="Remove">
            <i class="fa fa-times"></i>
          </button>
          <a href="product.html?id=${p.id}" class="wl-img">
            <img src="${p.image_url || ''}" alt="${p.name}"
              onerror="this.src='https://placehold.co/400x200/f5f0eb/888'" />
          </a>
          <div class="wl-body">
            <h3 class="wl-name"><a href="product.html?id=${p.id}">${p.name}</a></h3>
            <p class="wl-price">${formatPrice(p.price)}
              ${p.original_price ? `<span style="text-decoration:line-through;color:var(--text-muted);font-size:0.85rem;margin-left:6px">${formatPrice(p.original_price)}</span>` : ''}
            </p>
            <button class="btn btn-dark" style="padding:10px;width:100%" onclick="wishlistToCart(${p.id})">
              <i class="fa fa-shopping-bag"></i>&nbsp; Add to Cart
            </button>
          </div>
        </div>`).join('')}
    </div>`;
}

// ── REMOVE FROM WISHLIST ──────────────────────────────────────
async function removeFromWishlist(productId) {
  const user = await getCurrentUser();
  if (!user) return;
  await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', productId);
  showToast('Removed from wishlist');
  await initWishlistPage();
}

// ── WISHLIST ITEM → CART ──────────────────────────────────────
async function wishlistToCart(productId) {
  await addToCart(productId);
  await removeFromWishlist(productId);
}

// ── MOVE ALL WISHLIST → CART ──────────────────────────────────
async function moveAllWishlistToCart() {
  const user = await getCurrentUser();
  if (!user) return;
  const { data } = await supabase.from('wishlists').select('product_id').eq('user_id', user.id);
  for (const item of data || []) await addToCart(item.product_id);
  await supabase.from('wishlists').delete().eq('user_id', user.id);
  showToast('All items added to cart! 🛒', 'success');
  await initWishlistPage();
}

// ── SHOW / HIDE PANELS ────────────────────────────────────────
function showPanel(id) {
  document.querySelectorAll('.account-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.account-nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`panel-${id}`)?.classList.add('active');
  event?.currentTarget?.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
  // Detect which page we're on
  if (document.getElementById('panel-orders')) initAccountPage();
  if (document.getElementById('wishlistContent'))   initWishlistPage();
});
