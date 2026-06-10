// ============================================================
// js/auth/auth.js
// Handles: Login, Register, Logout, Session, Google OAuth
// Used by: login.html
// ============================================================

// ── LOGIN WITH EMAIL + PASSWORD ─────────────────────────────
// ── GET CURRENT USER ─────────────────────────────
async function getCurrentUser() {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}
async function loginWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    showToast(error.message, 'error');
    return null;
  }

  showToast('Welcome back! 🌿', 'success');

  // Redirect to previous page or account
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect') || PAGES.account;
  setTimeout(() => window.location.href = redirect, 1000);

  return data.user;
}

// ── REGISTER WITH EMAIL + PASSWORD ─────────────────────────
async function registerWithEmail(firstName, lastName, email, phone, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: `${firstName} ${lastName}`,
        phone
      }
    }
  });

  if (error) {
    showToast(error.message, 'error');
    return null;
  }

  // Update profile with phone
  if (data.user) {
    await supabase.from('profiles').update({ phone }).eq('id', data.user.id);
  }

  showToast('Account created! Check your email to confirm. 🌿', 'success');
  setTimeout(() => window.location.href = PAGES.account, 1200);
  return data.user;
}

// ── LOGIN WITH GOOGLE ───────────────────────────────────────
async function loginWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/pages/account/account.html'
    }
  });
  if (error) showToast(error.message, 'error');
}

// ── LOGOUT ──────────────────────────────────────────────────
async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) { showToast(error.message, 'error'); return; }
  showToast('Logged out. See you soon! 👋', 'info');
  setTimeout(() => window.location.href = PAGES.home, 1000);
}

// ── UPDATE HEADER UI BASED ON AUTH STATE ────────────────────
async function updateAuthUI() {
  const user = await getCurrentUser();
  const accountLink = document.querySelector(
  `a[href="${PAGES.account}"]`
);

  if (user && accountLink) {
    const profile = await getUserProfile(user.id);
    const name = profile?.full_name || user.email.split('@')[0];
    accountLink.title = `Hi ${name}!`;
  }
}

// ── LISTEN FOR AUTH STATE CHANGES ──────────────────────────
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    updateAuthUI();
    // Sync localStorage cart to Supabase on login
    syncLocalCartToSupabase(session.user.id);
    // ── SYNC LOCAL WISHLIST → SUPABASE ─────────────────
async function syncLocalWishlistToSupabase(userId) {

  const localWishlist =
    JSON.parse(localStorage.getItem('sm_wishlist') || '[]');

  if (!localWishlist.length) return;

  for (const item of localWishlist) {

    const { error } = await supabase
      .from('wishlists')
      .upsert(
        {
          user_id: userId,
          product_id: item.id
        },
        {
          onConflict: 'user_id,product_id'
        }
      );

    if (error) {
      console.error(error.message);
    }
  }

  localStorage.removeItem('sm_wishlist');
}
    syncLocalWishlistToSupabase(session.user.id);
  }
  if (event === 'SIGNED_OUT') {
    // Clear local data on logout
    localStorage.removeItem('sm_cart');
    localStorage.removeItem('sm_wishlist');
  }
});

// ── SYNC localStorage CART → SUPABASE ON LOGIN ─────────────
async function syncLocalCartToSupabase(userId) {
  const localCart = JSON.parse(localStorage.getItem('sm_cart') || '[]');
  if (!localCart.length) return;

  for (const item of localCart) {
    const { error } = await supabase.from('cart_items').upsert(
      { user_id: userId, product_id: item.id, quantity: item.qty },
      { onConflict: 'user_id,product_id' }
    );
    if (error) console.error('Cart sync error:', error.message);
  }

  // Clear local cart after sync
  localStorage.removeItem('sm_cart');
}
