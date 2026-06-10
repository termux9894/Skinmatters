// ============================================================
// js/auth/forgot-password.js
// Handles: Password reset via Supabase magic link / OTP
// Used by: forgot-password.html
// ============================================================

// ── STEP 1: SEND RESET EMAIL ────────────────────────────────
async function sendResetEmail() {
  const email = document.getElementById('resetEmail')?.value.trim();
  if (!email || !email.includes('@')) {
    showToast('Please enter a valid email address', 'error');
    return;
  }

  const btn = document.getElementById('sendOtpBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/forgot-password.html?step=reset'
  });

  if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa fa-paper-plane"></i>&nbsp; Send OTP'; }

  if (error) {
    showToast(error.message, 'error');
    return;
  }

  // Update the OTP description
  const desc = document.getElementById('otpDesc');
  if (desc) desc.textContent = `We've sent a reset link to ${email}. Click it to set a new password.`;

  showToast('Reset email sent! Check your inbox 📧', 'success');
  goResetStep(2);
}

// ── STEP 3: UPDATE PASSWORD (after clicking reset link) ─────
async function updatePassword() {
  const pw   = document.getElementById('newPw')?.value;
  const conf = document.getElementById('confPw')?.value;

  if (!pw || pw.length < 8) {
    showToast('Password must be at least 8 characters', 'error');
    return;
  }
  if (pw !== conf) {
    showToast('Passwords do not match', 'error');
    return;
  }

  const btn = document.getElementById('resetPwBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }

  const { error } = await supabase.auth.updateUser({ password: pw });

  if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa fa-check"></i>&nbsp; Reset Password'; }

  if (error) {
    showToast(error.message, 'error');
    return;
  }

  showToast('Password updated successfully! 🌿', 'success');
  setTimeout(() => window.location.href = PAGES.login, 1500);
}

// ── STEP NAVIGATION ─────────────────────────────────────────
function goResetStep(n) {
  [1, 2, 3].forEach(i => {
    document.getElementById(`rp${i}`)?.classList.toggle('active', i === n);
    const dot = document.getElementById(`d${i}`);
    if (!dot) return;
    dot.classList.remove('active', 'done');
    if (i === n) dot.classList.add('active');
    if (i < n)  dot.classList.add('done');
  });
}

// ── INIT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Check if arriving from reset link (Supabase adds #access_token to URL)
  const hash = window.location.hash;
  if (hash.includes('type=recovery') || new URLSearchParams(window.location.search).get('step') === 'reset') {
    goResetStep(3);
  }

  // Wire buttons
  document.getElementById('sendOtpBtn')?.addEventListener('click', sendResetEmail);
  document.getElementById('resetPwBtn')?.addEventListener('click', updatePassword);

  // Enter key
  document.getElementById('resetEmail')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendResetEmail();
  });
});
