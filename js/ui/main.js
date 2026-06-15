// ============================================================
// js/ui/main.js
// Handles all shared UI behaviour across every page:
// hero slider, scroll reveal, mobile menu, dropdowns,
// accordion, tabs, header scroll effect
// ============================================================

// ── HERO SLIDER ───────────────────────────────────────────────
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.dot');
  if (!slides.length) return;

  let current = 0;
  let autoplay;

  function goTo(idx) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  }

  function startAutoplay() {
    autoplay = setInterval(() => goTo(current + 1), 5000);
  }

  document.getElementById('heroNext')?.addEventListener('click', () => { clearInterval(autoplay); goTo(current + 1); startAutoplay(); });
  document.getElementById('heroPrev')?.addEventListener('click', () => { clearInterval(autoplay); goTo(current - 1); startAutoplay(); });
  dots.forEach(d => d.addEventListener('click', () => { clearInterval(autoplay); goTo(+d.dataset.idx); startAutoplay(); }));

  // Touch/swipe support
  let touchStartX = 0;
  const heroEl = document.querySelector('.hero');
  if (heroEl) {
    heroEl.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    heroEl.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
    });
  }

  startAutoplay();
}

// ── SCROLL REVEAL ─────────────────────────────────────────────
function initScrollReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('revealed'), i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.reveal:not(.revealed)').forEach(el => observer.observe(el));
}

// ── HEADER SCROLL EFFECT ──────────────────────────────────────
function initHeaderScroll() {
  const header = document.getElementById('siteHeader') || document.getElementById('header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

// ── MOBILE MENU ───────────────────────────────────────────────
function initMobileMenu() {
  const btn     = document.getElementById('menuBtn');
  const nav     = document.getElementById('mainNav');
  const overlay = document.getElementById('mobileOverlay');
  const closeBtn = document.getElementById('mobileCloseBtn');
 if (window.innerWidth <= 768) {

  nav.querySelectorAll('.has-dropdown > a').forEach(link => {
link.addEventListener('click', function(e) {
    console.log('clicked');

    e.preventDefault();

    const parent = this.parentElement;
    const dropdown = parent.querySelector('.dropdown');

    if (!dropdown) return;

    console.log('toggle');

    dropdown.classList.toggle('open');
    parent.classList.toggle('dropdown-active');
});

  });

}
 
  if (!btn || !nav) return;

  function toggle(forceClose = false) {
    const open = forceClose ? false : !nav.classList.contains('open');
    nav.classList.toggle('open', open);
    btn.classList.toggle('open', open);
    overlay?.classList.toggle('show', open);
    document.body.classList.toggle('nav-open', open);
  }

  btn.addEventListener('click', () => toggle());
  overlay?.addEventListener('click', () => toggle(true));
  closeBtn?.addEventListener('click', () => toggle(true));
// Close menu only when dropdown items are clicked
nav.querySelectorAll('.dropdown a').forEach(a => {
  a.addEventListener('click', () => {
    if (window.innerWidth < 768) toggle(true);
  });
});
}

// ── DROPDOWN MENUS (desktop) ──────────────────────────────────
function initDropdowns() {

  if (window.innerWidth <= 768) return;

  document.querySelectorAll('.has-dropdown').forEach(item => {

    if (item.dataset.dropdownInit === 'true') return;
    item.dataset.dropdownInit = 'true';

    const dropdown = item.querySelector('.dropdown');
    if (!dropdown) return;

    let timer;

    item.addEventListener('mouseenter', () => {
      clearTimeout(timer);
      dropdown.classList.add('open');
    });

    item.addEventListener('mouseleave', () => {
      timer = setTimeout(() => {
        dropdown.classList.remove('open');
      }, 150);
    });

  });

}

// ── SEARCH BAR TOGGLE ─────────────────────────────────────────
function initSearchBar() {
  const toggle = document.getElementById('searchToggle');
  const bar = document.getElementById('searchBar');
  const close = document.getElementById('searchClose');
  const input = document.getElementById('searchInput');

  console.log("Search initialized");

  if (!toggle || !bar) {
    console.log("Search elements not found");
    return;
  }

  toggle.onclick = function () {
    console.log("Search clicked");
    bar.classList.toggle('open');
  };

  close?.addEventListener('click', () => {
    bar.classList.remove('open');
  });

  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = input.value.trim();
      if (!q) return;

      window.location.href =
        '/Skinmatters/pages/shop/search.html?q=' +
        encodeURIComponent(q);
    }
  });
}
// ── ACCORDION ─────────────────────────────────────────────────
function initAccordion() {
  document.querySelectorAll('.accordion-head').forEach(head => {
    head.addEventListener('click', () => {
      const item = head.parentElement;
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });
}

// ── PAGE TABS ─────────────────────────────────────────────────
function initPageTabs() {
  document.querySelectorAll('.page-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const group = tab.closest('.page-tabs');
      group?.querySelectorAll('.page-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const panel = tab.dataset.panel;
      if (panel) {
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        document.getElementById(panel)?.classList.add('active');
      }
    });
  });
}

// ── FILTER TABS (category pills) ─────────────────────────────
function initFilterTabs() {
  document.querySelectorAll('.filter-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      tab.closest('.filter-tabs')?.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
}

// ── TOAST ─────────────────────────────────────────────────────
// (also defined in supabase.js as a helper — this is the DOM implementation)
function ensureToast() {
  if (!document.getElementById('toast')) {
    const t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
}

// ── NEWSLETTER FORM ───────────────────────────────────────────
async function subscribeNewsletter(email) {
  if (!email || !email.includes('@')) {
    showToast('Please enter a valid email', 'error');
    return;
  }
  // In production: save to Supabase or integrate with Mailchimp
  // For now just show success
  showToast('Subscribed! Welcome to the SkinMatters family 🌿', 'success');
}

function initNewsletterForms() {
  document.querySelectorAll('.nl-form').forEach(form => {
    const btn   = form.querySelector('button');
    const input = form.querySelector('input[type=email]');
    btn?.addEventListener('click', () => subscribeNewsletter(input?.value.trim()));
    input?.addEventListener('keydown', e => { if (e.key === 'Enter') subscribeNewsletter(input.value.trim()); });
  });
}

// ── BACK TO TOP ───────────────────────────────────────────────
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.style.opacity = window.scrollY > 400 ? '1' : '0';
    btn.style.pointerEvents = window.scrollY > 400 ? 'all' : 'none';
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ── SMOOTH ANCHOR SCROLL ──────────────────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ── INIT ALL UI ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Inject header/footer first
  if (typeof initLayout === 'function') {
    initLayout();
  }

  ensureToast();
  initHeroSlider();
  initScrollReveal();
  initHeaderScroll();
  initMobileMenu();
  initDropdowns();
  setTimeout(() => {
  console.log("Search initialized");
  initSearchBar();
}, 1000);
  initAccordion();
  initPageTabs();
  initFilterTabs();
  initNewsletterForms();
  initBackToTop();
  initSmoothScroll();

  document.querySelectorAll(
    '.product-card, .cat-card, .step, .testimonial, .feature-card, .blog-card, .combo-card'
  ).forEach(el => el.classList.add('reveal'));

  initScrollReveal();
});