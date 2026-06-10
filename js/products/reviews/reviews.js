// ============================================================
// js/reviews/reviews.js
// Handles: Fetch reviews, submit review, star rating UI
// Used by: product.html
// ============================================================

let selectedRating = 0;

// ── FETCH REVIEWS FOR A PRODUCT ──────────────────────────────
async function fetchReviews(productId) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id, rating, title, content, is_verified, created_at,
      profile:profiles (full_name)
    `)
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) { console.error('Reviews error:', error.message); return []; }
  return data || [];
}

// ── CHECK IF USER ALREADY REVIEWED ───────────────────────────
async function hasUserReviewed(productId) {
  const user = await getCurrentUser();
  if (!user) return false;

  const { data } = await supabase
    .from('reviews')
    .select('id')
    .eq('product_id', productId)
    .eq('user_id', user.id)
    .single();

  return !!data;
}

// ── SUBMIT REVIEW ─────────────────────────────────────────────
async function submitReview(productId) {
  const user = await getCurrentUser();
  if (!user) {
    showToast('Please login to write a review', 'error');
    setTimeout(() => window.location.href = PAGES.login, 1200);
    return;
  }

  if (selectedRating === 0) {
    showToast('Please select a star rating', 'error');
    return;
  }

  const title   = document.getElementById('reviewTitle')?.value.trim();
  const content = document.getElementById('reviewContent')?.value.trim();

  if (!content) {
    showToast('Please write your review', 'error');
    return;
  }

  const btn = document.getElementById('submitReviewBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Submitting…'; }

  const { error } = await supabase
    .from('reviews')
    .insert({
      product_id: productId,
      user_id:    user.id,
      rating:     selectedRating,
      title:      title || null,
      content
    });

  if (btn) { btn.disabled = false; btn.textContent = 'Submit Review'; }

  if (error) {
    if (error.code === '23505') {
      showToast('You have already reviewed this product', 'error');
    } else {
      showToast(error.message, 'error');
    }
    return;
  }

  showToast('Review submitted! Thank you 🌿 (+25 reward points)', 'success');
  selectedRating = 0;

  // Add 25 reward points
  const profile = await getUserProfile(user.id);
  if (profile) {
    await supabase
      .from('profiles')
      .update({ reward_points: (profile.reward_points || 0) + 25 })
      .eq('id', user.id);
  }

  // Reload reviews
  await loadReviews(productId);
}

// ── RENDER STAR PICKER ────────────────────────────────────────
function renderStarPicker(containerId = 'starPicker') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = [1, 2, 3, 4, 5].map(n => `
    <span class="star-pick" data-val="${n}"
      onclick="selectStar(${n})"
      onmouseover="hoverStar(${n})"
      onmouseout="resetStarHover()"
      style="font-size:1.8rem;cursor:pointer;color:var(--border);transition:color 0.15s">★</span>
  `).join('');
}

function selectStar(n) {
  selectedRating = n;
  updateStarUI(n);
}

function hoverStar(n) { updateStarUI(n); }

function resetStarHover() { updateStarUI(selectedRating); }

function updateStarUI(n) {
  document.querySelectorAll('.star-pick').forEach((star, idx) => {
    star.style.color = idx < n ? '#f5a623' : 'var(--border)';
  });
}

// ── RENDER REVIEWS LIST ───────────────────────────────────────
function renderReviewsList(reviews, containerId = 'reviewsList') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!reviews.length) {
    container.innerHTML = `
      <p style="color:var(--text-muted);text-align:center;padding:24px">
        No reviews yet. Be the first to review this product!
      </p>`;
    return;
  }

  // Calculate rating breakdown
  const total = reviews.length;
  const avg   = (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1);
  const breakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct:   Math.round((reviews.filter(r => r.rating === star).length / total) * 100)
  }));

  container.innerHTML = `
    <!-- Rating Summary -->
    <div style="display:grid;grid-template-columns:auto 1fr;gap:32px;align-items:center;margin-bottom:32px;padding:24px;background:var(--warm-white);border-radius:var(--radius)">
      <div style="text-align:center">
        <div style="font-family:var(--font-display);font-size:3.5rem;font-weight:300;color:var(--brown);line-height:1">${avg}</div>
        <div style="color:#f5a623;font-size:1.2rem;margin:4px 0">${'★'.repeat(Math.floor(avg))}</div>
        <div style="font-size:0.78rem;color:var(--text-muted)">${total} review${total !== 1 ? 's' : ''}</div>
      </div>
      <div>
        ${breakdown.map(b => `
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
            <span style="font-size:0.78rem;color:var(--text-muted);width:36px">${b.star} ★</span>
            <div style="flex:1;height:6px;background:var(--border);border-radius:6px;overflow:hidden">
              <div style="height:100%;width:${b.pct}%;background:#f5a623;border-radius:6px"></div>
            </div>
            <span style="font-size:0.75rem;color:var(--text-muted);width:28px">${b.count}</span>
          </div>`).join('')}
      </div>
    </div>

    <!-- Review Cards -->
    ${reviews.map(r => {
      const name   = r.profile?.full_name || 'Anonymous';
      const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
      const stars  = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
      const date   = formatDate(r.created_at);
      return `
        <div style="padding:20px 0;border-bottom:1px solid var(--border)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:8px">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:36px;height:36px;border-radius:50%;background:var(--brown);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:600;flex-shrink:0">${initials}</div>
              <div>
                <p style="font-weight:600;font-size:0.88rem">${name}</p>
                ${r.is_verified ? '<span style="font-size:0.7rem;color:var(--green)">✅ Verified Purchase</span>' : ''}
              </div>
            </div>
            <span style="font-size:0.78rem;color:var(--text-muted)">${date}</span>
          </div>
          <div style="color:#f5a623;margin-bottom:6px">${stars}</div>
          ${r.title ? `<p style="font-weight:600;font-size:0.9rem;margin-bottom:4px">${r.title}</p>` : ''}
          <p style="font-size:0.88rem;color:var(--text-muted);line-height:1.7">${r.content}</p>
        </div>`;
    }).join('')}`;
}

// ── LOAD REVIEWS SECTION (called from product-detail.js) ─────
async function loadReviews(productId) {
  const section = document.getElementById('reviewsSection');
  if (!section) return;

  const reviews = await fetchReviews(productId);
  const alreadyReviewed = await hasUserReviewed(productId);
  const user = await getCurrentUser();

  section.innerHTML = `
    <h2 style="font-family:var(--font-display);font-size:1.8rem;margin-bottom:24px" id="reviews">
      Customer <em>Reviews</em>
    </h2>

    <!-- Write a review -->
    ${user && !alreadyReviewed ? `
    <div style="background:var(--warm-white);border:1px solid var(--border);border-radius:var(--radius);padding:28px;margin-bottom:32px">
      <h3 style="font-family:var(--font-display);font-size:1.2rem;margin-bottom:16px">Write a Review</h3>
      <div style="margin-bottom:14px">
        <label style="font-size:0.8rem;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);display:block;margin-bottom:8px">Your Rating</label>
        <div id="starPicker"></div>
      </div>
      <div class="form-group">
        <label>Review Title (optional)</label>
        <input type="text" id="reviewTitle" placeholder="e.g. Absolutely love this soap!" />
      </div>
      <div class="form-group">
        <label>Your Review</label>
        <textarea id="reviewContent" placeholder="Tell others what you think about this product…" style="min-height:100px"></textarea>
      </div>
      <button id="submitReviewBtn" class="btn btn-dark" onclick="submitReview(${productId})">
        Submit Review
      </button>
    </div>` : !user ? `
    <div style="text-align:center;padding:20px;background:var(--warm-white);border:1px solid var(--border);border-radius:var(--radius);margin-bottom:28px">
      <p style="color:var(--text-muted);margin-bottom:12px">Login to write a review and earn 25 reward points!</p>
      <a href=PAGES.login class="btn btn-dark" style="padding:10px 24px">Login to Review</a>
    </div>` : `
    <div style="background:rgba(58,107,53,0.06);border-radius:var(--radius-sm);padding:14px 18px;margin-bottom:24px;font-size:0.85rem;color:var(--green)">
      ✅ You have already reviewed this product. Thank you!
    </div>`}

    <!-- Reviews list -->
    <div id="reviewsList"></div>`;

  renderStarPicker('starPicker');
  renderReviewsList(reviews, 'reviewsList');
}
