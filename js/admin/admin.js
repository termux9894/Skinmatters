// ============================================================
// js/admin/admin.js
// Shared across all admin pages:
//   - Auth guard (must be admin to enter)
//   - Sidebar injection
//   - Shared utilities
// ============================================================

// ── ADMIN AUTH GUARD ──────────────────────────────────────────
// Call this at the top of every admin page.
// Redirects to home if not logged in or not admin.
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = ROOT + 'pages/account/login.html?redirect=' +
      encodeURIComponent(window.location.href);
    return null;
  }

  const profile = await getUserProfile(user.id);
  if (!profile?.is_admin) {
    showAdminAlert('Access denied. Admin only.', 'error');
    setTimeout(() => window.location.href = ROOT + 'index.html', 1500);
    return null;
  }

  // Set admin avatar initials
  const name = profile.full_name || user.email;
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const avatarEl = document.getElementById('adminAvatar');
  if (avatarEl) avatarEl.textContent = initials;
  const nameEl = document.getElementById('adminName');
  if (nameEl) nameEl.textContent = name.split(' ')[0];

  return { user, profile };
}

// ── INJECT ADMIN SIDEBAR ──────────────────────────────────────
function injectAdminSidebar(activePage = '') {
  const sidebar = document.getElementById('adminSidebar');
  if (!sidebar) return;

  const BASE = ROOT + 'pages/admin/';

  const links = [
    { section: 'Overview' },
    { href: BASE + 'dashboard.html',  icon: '📊', label: 'Dashboard',  key: 'dashboard'  },

    { section: 'Store' },
    { href: BASE + 'orders.html',     icon: '📦', label: 'Orders',     key: 'orders',    badge: '', badgeId: 'sidebarOrderBadge'  },
    { href: BASE + 'products.html',   icon: '🌿', label: 'Products',   key: 'products'   },
    { href: BASE + 'coupons.html',    icon: '🏷️',  label: 'Coupons',    key: 'coupons'    },
    { href: BASE + 'reviews.html',    icon: '⭐', label: 'Reviews',    key: 'reviews',   badge: '', badgeId: 'sidebarReviewBadge' },

    { section: 'People' },
    { href: BASE + 'customers.html',  icon: '👥', label: 'Customers',  key: 'customers'  },
    { href: BASE + 'messages.html',   icon: '💬', label: 'Messages',   key: 'messages',  badge: '', badgeId: 'sidebarMsgBadge'   },
  ];

  sidebar.innerHTML = `
    <div class="admin-logo">
      <p>Admin Panel</p>
      <h2>Skin<span>Matters</span></h2>
    </div>
    <nav class="admin-nav">
      ${links.map(l => {
        if (l.section) return `<p class="admin-nav-section">${l.section}</p>`;
        const active = activePage === l.key ? 'active' : '';
        const badgeHtml = l.badgeId
          ? `<span class="nav-badge" id="${l.badgeId}" style="display:none">0</span>`
          : '';
        return `<a href="${l.href}" class="${active}">
          <span class="nav-icon">${l.icon}</span>
          ${l.label}
          ${badgeHtml}
        </a>`;
      }).join('')}
    </nav>
    <div class="admin-sidebar-footer">
      <a href="${ROOT}index.html" style="margin-bottom:8px">
        <span>🌐</span> View Live Site
      </a>
      <a href="#" onclick="adminLogout()" style="margin-top:4px">
        <span>🚪</span> Logout
      </a>
    </div>`;

  // Load pending counts for badges
  loadSidebarBadges();
}

// ── SIDEBAR BADGE COUNTS ──────────────────────────────────────
async function loadSidebarBadges() {
  try {
    // Pending orders (placed/confirmed)
    const { count: orderCount } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .in('status', ['placed', 'confirmed']);
    setBadge('sidebarOrderBadge', orderCount);

    // Unread messages
    const { count: msgCount } = await supabase
      .from('contact_messages')
      .select('id', { count: 'exact', head: true })
      .eq('is_read', false);
    setBadge('sidebarMsgBadge', msgCount);

    // Pending reviews (not approved yet)
    const { count: reviewCount } = await supabase
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('is_verified', false);
    setBadge('sidebarReviewBadge', reviewCount);
  } catch (e) {
    console.error('Badge load error:', e.message);
  }
}

function setBadge(id, count) {
  const el = document.getElementById(id);
  if (!el) return;
  if (count > 0) {
    el.textContent = count > 99 ? '99+' : count;
    el.style.display = 'inline-flex';
  } else {
    el.style.display = 'none';
  }
}

// ── ADMIN LOGOUT ──────────────────────────────────────────────
async function adminLogout() {
  await supabase.auth.signOut();
  window.location.href = ROOT + 'index.html';
}

// ── SHOW ALERT ────────────────────────────────────────────────
function showAdminAlert(msg, type = 'success', containerId = 'adminAlert') {
  const el = document.getElementById(containerId);
  if (!el) {
    // Create floating alert
    const div = document.createElement('div');
    div.style.cssText = `position:fixed;top:72px;right:20px;z-index:9999;max-width:360px;`;
    div.innerHTML = `<div class="admin-alert admin-alert-${type}">
      <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
      ${msg}
    </div>`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3500);
    return;
  }
  el.className = `admin-alert admin-alert-${type}`;
  el.innerHTML = `<span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span> ${msg}`;
  el.style.display = 'flex';
  setTimeout(() => el.style.display = 'none', 3500);
}

// ── FORMAT HELPERS ────────────────────────────────────────────
function adminFormatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function adminFormatPrice(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN');
}

function getStatusBadge(status) {
  const map = {
    placed:           '<span class="badge badge-blue">⏳ Placed</span>',
    confirmed:        '<span class="badge badge-blue">✅ Confirmed</span>',
    packing:          '<span class="badge badge-amber">📦 Packing</span>',
    shipped:          '<span class="badge badge-amber">🚚 Shipped</span>',
    out_for_delivery: '<span class="badge badge-amber">🛵 Out for Delivery</span>',
    delivered:        '<span class="badge badge-green">✅ Delivered</span>',
    cancelled:        '<span class="badge badge-red">❌ Cancelled</span>',
    returned:         '<span class="badge badge-red">🔄 Returned</span>',
  };
  return map[status] || `<span class="badge badge-gray">${status}</span>`;
}

// ── CONFIRM DELETE MODAL ──────────────────────────────────────
function confirmDelete(message, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'admin-modal-overlay';
  overlay.innerHTML = `
    <div class="admin-modal" style="max-width:400px;text-align:center">
      <div style="font-size:2.5rem;margin-bottom:12px">⚠️</div>
      <h3 style="margin-bottom:10px">Are you sure?</h3>
      <p style="color:var(--admin-muted);font-size:0.88rem;margin-bottom:24px">${message}</p>
      <div style="display:flex;gap:10px;justify-content:center">
        <button class="admin-btn admin-btn-outline" onclick="this.closest('.admin-modal-overlay').remove()">Cancel</button>
        <button class="admin-btn admin-btn-danger" id="confirmDeleteBtn">Yes, Delete</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
    overlay.remove();
    onConfirm();
  });
}

// ── EXPORT TABLE TO CSV ───────────────────────────────────────
function exportToCSV(data, filename) {
  if (!data.length) { showAdminAlert('No data to export', 'error'); return; }
  const headers = Object.keys(data[0]).join(',');
  const rows    = data.map(row => Object.values(row).map(v => `"${v}"`).join(',')).join('\n');
  const csv     = headers + '\n' + rows;
  const blob    = new Blob([csv], { type: 'text/csv' });
  const url     = URL.createObjectURL(blob);
  const a       = document.createElement('a');
  a.href = url; a.download = filename + '.csv'; a.click();
  URL.revokeObjectURL(url);
}

// ── PAGINATION HELPER ─────────────────────────────────────────
function renderPagination(total, page, perPage, onPageChange, containerId = 'pagination') {
  const el = document.getElementById(containerId);
  if (!el) return;
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) { el.innerHTML = ''; return; }

  let html = `<div style="display:flex;align-items:center;gap:8px;justify-content:center;margin-top:16px;font-size:0.82rem;color:var(--admin-muted)">`;
  html += `<button class="admin-btn admin-btn-outline admin-btn-sm" ${page === 1 ? 'disabled' : ''} onclick="(${onPageChange})(${page - 1})">← Prev</button>`;
  for (let i = 1; i <= totalPages; i++) {
    if (i === page) html += `<button class="admin-btn admin-btn-primary admin-btn-sm">${i}</button>`;
    else html += `<button class="admin-btn admin-btn-outline admin-btn-sm" onclick="(${onPageChange})(${i})">${i}</button>`;
  }
  html += `<button class="admin-btn admin-btn-outline admin-btn-sm" ${page === totalPages ? 'disabled' : ''} onclick="(${onPageChange})(${page + 1})">Next →</button>`;
  html += `<span style="margin-left:8px">${total} total</span></div>`;
  el.innerHTML = html;
}