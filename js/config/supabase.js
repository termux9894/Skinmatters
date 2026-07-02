// ============================================================
// js/config/supabase.js
// Supabase client initialisation
//
// HOW TO GET YOUR KEYS:
//  1. Go to https://supabase.com → your project
//  2. Settings → API
//  3. Copy "Project URL" and "anon public" key
//  4. Paste them below
// ============================================================

const SUPABASE_URL  = 'https://ttkkxfdmccrbbcnjvysb.supabase.co';  // ← paste here
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0a2t4ZmRtY2NyYmJjbmp2eXNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2Njc5MjksImV4cCI6MjA5MjI0MzkyOX0.KtwUiqxaY6BchJ7bG8SqPG8G-WfLxEb3Sr-gbrpPFtA';                 // ← paste here

// Create and export the Supabase client
// (loaded from CDN in every HTML file's <head>)
window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
window.supabase = window.supabaseClient;

// ── HELPER: Get the currently logged-in user ────────────────
async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ── HELPER: Get user profile from profiles table ────────────
async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) console.error('Profile fetch error:', error.message);
  return data;
}

// ── HELPER: Redirect to login if not authenticated ──────────
async function requireAuth(redirectTo = PAGES.login) {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = redirectTo + '?redirect=' + encodeURIComponent(window.location.pathname);
    return null;
  }
  return user;
}

// ── HELPER: Show a toast notification ──────────────────────
function showToast(msg, type = 'info') {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    document.body.appendChild(t);
  }
  const colors = { info: '#2c2c2c', success: '#3a6b35', error: '#e53e3e' };
  t.style.background = colors[type] || colors.info;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ── HELPER: Format price in Indian Rupees ──────────────────
function formatPrice(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN');
}

// ── HELPER: Format date ─────────────────────────────────────
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}
