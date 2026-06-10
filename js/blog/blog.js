// ============================================================
// js/blog/blog.js
// Handles: Fetch blog posts from Supabase, render cards
// Used by: blog.html, blog-post.html
// ============================================================

// ── FETCH ALL BLOG POSTS ──────────────────────────────────────
async function fetchBlogPosts({ category = null, limit = 20 } = {}) {
  let query = supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, category, author, emoji, image_url, read_minutes, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (category) query = query.eq('category', category);
  if (limit)    query = query.limit(limit);

  const { data, error } = await query;

  if (error) {
    console.error('Blog fetch error:', error.message);
    // Return static fallback
    return STATIC_BLOG_POSTS || [];
  }
  return data || [];
}

// ── FETCH SINGLE POST BY SLUG ──────────────────────────────────
async function fetchBlogPost(slug) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) { console.error(error.message); return null; }
  return data;
}

// ── STATIC FALLBACK (if Supabase not yet configured) ─────────
const STATIC_BLOG_POSTS = [
  { id:1, title:'The Ancient Indian 4-Step Skincare Routine', slug:'ancient-4-step-routine', excerpt:'Discover how Ayurvedic wisdom can transform your skin in 4 simple steps — cleanse, exfoliate, moisturise, nourish.', category:'Skincare', emoji:'🌿', read_minutes:5, published_at:'2025-04-15' },
  { id:2, title:'Why Aloe Vera is the Ultimate Skin Superfood', slug:'aloe-vera-skin-superfood', excerpt:'Aloe vera has been used in Ayurveda for over 5,000 years. Here is everything you need to know.', category:'Ingredients', emoji:'🌿', read_minutes:4, published_at:'2025-04-12' },
  { id:3, title:'5 Signs Your Scalp Needs a Detox', slug:'scalp-detox-signs', excerpt:'Excess oil, dandruff, itchiness — your scalp sends signals. Learn how to read them.', category:'Haircare', emoji:'💆', read_minutes:6, published_at:'2025-04-08' },
  { id:4, title:'Charcoal Soap: Does It Really Work for Acne?', slug:'charcoal-soap-for-acne', excerpt:'We break down the science behind how activated charcoal deep-cleanses pores.', category:'Skincare', emoji:'✨', read_minutes:5, published_at:'2025-04-03' },
  { id:5, title:'DIY Turmeric Face Mask for Radiant Skin', slug:'diy-turmeric-face-mask', excerpt:'This 3-ingredient mask can brighten your complexion in just 15 minutes.', category:'DIY Tips', emoji:'🧪', read_minutes:3, published_at:'2025-03-28' },
  { id:6, title:'Manjistha: The Forgotten Herb for Glowing Skin', slug:'manjistha-glowing-skin', excerpt:'Used in Ayurvedic medicine for centuries, Manjistha root is one of the most powerful herbs for clear skin.', category:'Ingredients', emoji:'🌸', read_minutes:7, published_at:'2025-03-22' },
  { id:7, title:'How Stress Destroys Your Skin — and What to Do', slug:'stress-and-skin', excerpt:'Cortisol triggers inflammation, breaks collagen, and worsens acne. A holistic guide to managing stress-related flare-ups.', category:'Wellness', emoji:'🧘', read_minutes:8, published_at:'2025-03-18' },
  { id:8, title:'Cold-Pressed Coconut Oil vs. Refined', slug:'coconut-oil-guide', excerpt:'Not all coconut oils are equal. Cold-pressed virgin oil retains far more nutrients for your hair.', category:'Haircare', emoji:'🥥', read_minutes:5, published_at:'2025-03-12' },
  { id:9, title:'Beetroot Lip Mask: Get Natural Pink Lips', slug:'beetroot-lip-mask', excerpt:'Mix beetroot powder, honey and shea butter for a lip-softening, tint-adding overnight mask.', category:'DIY Tips', emoji:'🫐', read_minutes:2, published_at:'2025-02-28' },
];

// ── RENDER BLOG CARD ───────────────────────────────────────────
function renderBlogCard(post) {
  const date = formatDate(post.published_at);
  return `
    <div class="blog-card reveal">
      <div class="blog-img">
        ${post.image_url
          ? `<img src="${post.image_url}" alt="${post.title}" style="width:100%;height:100%;object-fit:cover" />`
          : `<span style="font-size:3.5rem">${post.emoji || '📝'}</span>`}
      </div>
      <div class="blog-body">
        <div class="blog-meta">
          <span><i class="fa fa-calendar"></i> ${date}</span>
          <span><i class="fa fa-clock"></i> ${post.read_minutes} min read</span>
        </div>
        <span class="blog-tag">${post.category}</span>
        <h3 style="margin-top:10px">
          <a href="blog-post.html?slug=${post.slug}">${post.title}</a>
        </h3>
        <p>${post.excerpt || ''}</p>
        <a href="blog-post.html?slug=${post.slug}"
          style="font-size:0.83rem;font-weight:500;color:var(--brown)">Read More →</a>
      </div>
    </div>`;
}

// ── INIT: blog.html ────────────────────────────────────────────
async function initBlogPage() {
  const grid = document.getElementById('blogGrid');
  if (!grid) return;

  grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted)">
    <i class="fa fa-spinner fa-spin" style="font-size:1.8rem;display:block;margin-bottom:12px"></i>
    Loading articles…
  </div>`;

  let allPosts = await fetchBlogPosts();

  grid.innerHTML = allPosts.map(renderBlogCard).join('');
  initScrollReveal();

  // Wire category filters
  document.querySelectorAll('.blog-filter-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('.blog-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      const filtered = cat === 'all' ? allPosts : allPosts.filter(p => p.category === cat);
      grid.innerHTML = filtered.length
        ? filtered.map(renderBlogCard).join('')
        : '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted)">No articles in this category yet.</div>';
      initScrollReveal();
    });
  });
}

// ── INIT: blog-post.html ───────────────────────────────────────
async function initBlogPostPage() {
  const params = new URLSearchParams(window.location.search);
  const slug   = params.get('slug');

  if (!slug) { window.location.href = PAGES.blog; return; }

  const post = await fetchBlogPost(slug)
    || STATIC_BLOG_POSTS.find(p => p.slug === slug);

  if (!post) { window.location.href = PAGES.blog; return; }

  document.title = `${post.title} – SkinMatters`;

  const titleEl = document.getElementById('postTitle');
  const metaEl  = document.getElementById('postMeta');
  const bodyEl  = document.getElementById('postBody');
  const coverEl = document.getElementById('postCover');

  if (titleEl) titleEl.textContent = post.title;
  if (metaEl)  metaEl.innerHTML = `
    <span><i class="fa fa-user"></i> ${post.author || 'SkinMatters Team'}</span>
    <span><i class="fa fa-calendar"></i> ${formatDate(post.published_at)}</span>
    <span><i class="fa fa-clock"></i> ${post.read_minutes} min read</span>`;
  if (coverEl) coverEl.innerHTML = post.image_url
    ? `<img src="${post.image_url}" alt="${post.title}" style="width:100%;height:100%;object-fit:cover"/>`
    : `<span style="font-size:6rem">${post.emoji || '📝'}</span>`;
  if (bodyEl) bodyEl.innerHTML = post.content || `
    <p>${post.excerpt}</p>
    <p style="color:var(--text-muted);font-style:italic">Full article content coming soon. Check back later!</p>`;

  // Load sidebar recent posts
  const sidebarPosts = document.getElementById('sidebarPosts');
  if (sidebarPosts) {
    const recent = await fetchBlogPosts({ limit: 4 });
    sidebarPosts.innerHTML = recent
      .filter(p => p.slug !== slug)
      .slice(0, 3)
      .map(p => `
        <div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);cursor:pointer"
          onclick="window.location.href='blog-post.html?slug=${p.slug}'">
          <div style="width:48px;height:48px;border-radius:var(--radius-sm);background:var(--warm-white);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0">${p.emoji || '📝'}</div>
          <div>
            <p style="font-size:0.82rem;font-weight:500;margin-bottom:2px;line-height:1.3">${p.title}</p>
            <span style="font-size:0.72rem;color:var(--text-muted)">${formatDate(p.published_at)}</span>
          </div>
        </div>`).join('');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('blogGrid'))  initBlogPage();
  if (document.getElementById('postTitle')) initBlogPostPage();
});
