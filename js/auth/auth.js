// ============================================================
// js/auth/auth.js
// Complete Authentication System using Supabase
// Handles: Login, Register, Logout, Session, Google OAuth
// Used by: login.html, account.html, layout.js
// ============================================================

// ── GET CURRENT USER ─────────────────────────────────────────
async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ── LOGIN WITH EMAIL + PASSWORD ─────────────────────────────
async function loginWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    showToast(error.message, 'error');
    return null;
  }

  // Save user to localStorage with all details
  await saveUserToLocal(data.user);

  showToast('Welcome back! 🌿', 'success');

  // Update account icon in header
  updateAccountIcon();

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
        phone,
        avatar_url: ''
      }
    }
  });

  if (error) {
    showToast(error.message, 'error');
    return null;
  }

  // Update profile with phone
  if (data.user) {
    await supabase.from('profiles').update({
      full_name: `${firstName} ${lastName}`,
      phone,
      avatar_url: ''
    }).eq('id', data.user.id);
  }

  // Save user to localStorage so account page can show their name
  if (data.user) {
    await saveUserToLocal(data.user);
  }

  showToast('Account created! Check your email to confirm. 🌿', 'success');

  // Update account icon
  updateAccountIcon();

  setTimeout(() => window.location.href = PAGES.account, 1200);
  return data.user;
}

// ── LOGIN WITH GOOGLE ───────────────────────────────────────
async function loginWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/pages/account/account.html',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  });
  if (error) {
    showToast(error.message, 'error');
  }
}

// ── LOGOUT ──────────────────────────────────────────────────
async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) { showToast(error.message, 'error'); return; }

  // Clear all local data
  localStorage.removeItem('sm_user');
  localStorage.removeItem('sm_cart');
  localStorage.removeItem('sm_wishlist');

  showToast('Logged out. See you soon! 👋', 'info');

  // Update account icon back to login link
  updateAccountIcon();

  // Redirect to login page after logout
  setTimeout(() => window.location.href = PAGES.login, 1000);
}

// ── SAVE USER TO LOCALSTORAGE ───────────────────────────────
async function saveUserToLocal(user) {
  if (!user) {
    localStorage.removeItem('sm_user');
    return;
  }

  // Get profile picture from Google auth if available
  let avatarUrl = user.user_metadata?.avatar_url || '';
  let displayName = user.user_metadata?.full_name || '';
  let phone = user.user_metadata?.phone || '';

  // Try to get more details from profiles table
  if (!displayName) {
    const profile = await getUserProfile(user.id);
    if (profile) {
      displayName = profile.full_name || displayName;
      phone = profile.phone || phone;
      avatarUrl = profile.avatar_url || avatarUrl;
    }
  }

  // Fallback to email username if no name
  if (!displayName) {
    displayName = user.email?.split('@')[0] || 'User';
  }

  const userData = {
    id: user.id,
    name: displayName,
    email: user.email || '',
    phone: phone,
    avatar_url: avatarUrl,
    loggedIn: true,
    lastLogin: new Date().toISOString()
  };

  localStorage.setItem('sm_user', JSON.stringify(userData));

  // Update account icon in header immediately
  updateAccountIcon();

  return userData;
}

// ── LOAD USER FROM LOCALSTORAGE ─────────────────────────────
function loadUserFromLocal() {
  try {
    const stored = localStorage.getItem('sm_user');
    if (!stored) return null;
    const user = JSON.parse(stored);
    if (user && user.loggedIn) return user;
    return null;
  } catch (e) {
    return null;
  }
}

// ── CHECK IF USER IS LOGGED IN ──────────────────────────────
function isLoggedIn() {
  const user = loadUserFromLocal();
  return user !== null;
}

// ── GET USER INITIALS ───────────────────────────────────────
function getUserInitials(user) {
  if (!user || !user.name) return 'G';
  return user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

// ── UPDATE ACCOUNT ICON IN HEADER ──────────────────────────
function updateAccountIcon() {
  const user = loadUserFromLocal();
  const accountLink = document.getElementById('accountLink');

  if (!accountLink) return;

  if (user) {
    // Update the href to point to account page
    accountLink.href = PAGES.account;

    // Update the icon to show user's initials or profile image
    if (user.avatar_url) {
      const img = accountLink.querySelector('img') || document.createElement('img');
      img.src = user.avatar_url;
      img.alt = user.name;
      img.style.cssText = 'width:22px;height:22px;border-radius:50%;object-fit:cover;';
      if (!accountLink.querySelector('img')) {
        accountLink.innerHTML = '';
        accountLink.appendChild(img);
      }
    } else {
      // Remove any profile image, restore the user icon
      const existingImg = accountLink.querySelector('img');
      if (existingImg) {
        existingImg.remove();
      }
      // Ensure the icon is a user icon
      const icon = accountLink.querySelector('i');
      if (!icon) {
        accountLink.innerHTML = '<i class="fa fa-user"></i>';
      }
    }

    // Set title tooltip
    accountLink.title = `Hi ${user.name}!`;

    // Update mobile login box
    const mobileBox = document.getElementById('mobileLoginBox');
    if (mobileBox) {
      mobileBox.href = PAGES.account;
      const title = document.getElementById('mobileLoginTitle');
      const sub = document.getElementById('mobileLoginSub');
      if (title) title.textContent = user.name;
      if (sub) sub.textContent = user.email;
    }

    // Update bottom nav account link
    const bnAccount = document.getElementById('bnAccount');
    if (bnAccount) {
      bnAccount.href = PAGES.account;
      const icon = bnAccount.querySelector('i');
      if (icon) icon.className = 'fa fa-user-check';
      const span = bnAccount.querySelector('span');
      if (span) span.textContent = user.name.split(' ')[0];
    }
  } else {
    // Not logged in → point to login page
    accountLink.href = PAGES.login;
    accountLink.title = 'Login / Register';

    // Restore default user icon
    const existingImg = accountLink.querySelector('img');
    if (existingImg) existingImg.remove();
    const icon = accountLink.querySelector('i');
    if (!icon) {
      accountLink.innerHTML = '<i class="fa fa-user"></i>';
    }

    // Reset mobile login box
    const mobileBox = document.getElementById('mobileLoginBox');
    if (mobileBox) {
      mobileBox.href = PAGES.login;
      const title = document.getElementById('mobileLoginTitle');
      const sub = document.getElementById('mobileLoginSub');
      if (title) title.textContent = 'Login / Register';
      if (sub) sub.textContent = 'To access rewards, orders & account';
    }

    // Reset bottom nav account link
    const bnAccount = document.getElementById('bnAccount');
    if (bnAccount) {
      const icon = bnAccount.querySelector('i');
      if (icon) icon.className = 'fa fa-user';
      const span = bnAccount.querySelector('span');
      if (span) span.textContent = 'Account';
      bnAccount.href = PAGES.login;
    }
  }
}

// ── GET USER PROFILE FROM PROFILES TABLE ────────────────────
async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) console.error('Profile fetch error:', error.message);
  return data;
}

// ── UPDATE HEADER UI BASED ON AUTH STATE ────────────────────
async function updateAuthUI() {
  const user = await getCurrentUser();
  if (user) {
    await saveUserToLocal(user);
  }
  updateAccountIcon();
}

// ── REDIRECT TO LOGIN IF NOT AUTHENTICATED ───────────────────
async function requireAuth(redirectTo = null) {
  const user = loadUserFromLocal();
  if (user) return user;

  // Try Supabase session as fallback
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await saveUserToLocal(session.user);
      return loadUserFromLocal();
    }
  } catch (e) {
    // No session
  }

  // Not logged in → redirect to login
  const target = redirectTo || window.location.href;
  window.location.href = PAGES.login + '?redirect=' + encodeURIComponent(target);
  return null;
}

// ── LISTEN FOR AUTH STATE CHANGES ──────────────────────────
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN') {
    if (session?.user) {
      await saveUserToLocal(session.user);
    }
    updateAccountIcon();

    // Sync localStorage cart to Supabase on login
    if (session?.user?.id) {
      syncLocalCartToSupabase(session.user.id);
      syncLocalWishlistToSupabase(session.user.id);
    }
  }

  if (event === 'SIGNED_OUT') {
    // Clear all local data on logout
    localStorage.removeItem('sm_user');
    localStorage.removeItem('sm_cart');
    localStorage.removeItem('sm_wishlist');
    updateAccountIcon();
  }

  if (event === 'TOKEN_REFRESHED') {
    // Session was refreshed, update local data
    if (session?.user) {
      await saveUserToLocal(session.user);
    }
  }
});

// ── SYNC LOCAL WISHLIST → SUPABASE ON LOGIN ─────────────────
async function syncLocalWishlistToSupabase(userId) {
  const localWishlist = JSON.parse(localStorage.getItem('sm_wishlist') || '[]');
  if (!localWishlist.length) return;

  for (const item of localWishlist) {
    const { error } = await supabase
      .from('wishlists')
      .upsert(
        { user_id: userId, product_id: item.id },
        { onConflict: 'user_id,product_id' }
      );
    if (error) console.error(error.message);
  }

  localStorage.removeItem('sm_wishlist');
}

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

// ── INITIALISE AUTH ON PAGE LOAD ────────────────────────────
// Call this on every page to set up the correct account icon
async function initAuth() {
  // Check localStorage first for fast display
  const localUser = loadUserFromLocal();
  if (localUser) {
    updateAccountIcon();
  }

  // Then verify with Supabase and update if needed
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await saveUserToLocal(session.user);
    } else if (localUser) {
      // Local says logged in but Supabase says no → clear stale data
      localStorage.removeItem('sm_user');
      updateAccountIcon();
    }
  } catch (e) {
    // Session check failed, keep local state
  }
}

// Make functions globally available
window.getCurrentUser = getCurrentUser;
window.loginWithEmail = loginWithEmail;
window.registerWithEmail = registerWithEmail;
window.loginWithGoogle = loginWithGoogle;
window.logout = logout;
window.saveUserToLocal = saveUserToLocal;
window.loadUserFromLocal = loadUserFromLocal;
window.isLoggedIn = isLoggedIn;
window.getUserInitials = getUserInitials;
window.updateAccountIcon = updateAccountIcon;
window.requireAuth = requireAuth;
window.initAuth = initAuth;