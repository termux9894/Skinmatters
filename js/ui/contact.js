// ============================================================
// js/ui/contact.js
// Handles: Contact form submission to Supabase
// Used by: contact.html
// ============================================================

async function submitContactForm() {
  const name    = document.getElementById('cName')?.value.trim();
  const email   = document.getElementById('cEmail')?.value.trim();
  const phone   = document.getElementById('cPhone')?.value.trim();
  const subject = document.getElementById('cSubject')?.value;
  const message = document.getElementById('cMessage')?.value.trim();

  if (!name || !email || !message) {
    showToast('Please fill in all required fields', 'error');
    return;
  }
  if (!email.includes('@')) {
    showToast('Please enter a valid email address', 'error');
    return;
  }

  const btn = document.getElementById('contactSubmitBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Sending…'; }

  const { error } = await supabase
    .from('contact_messages')
    .insert({ name, email, phone: phone || null, subject: subject || null, message });

  if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa fa-paper-plane"></i>&nbsp; Send Message'; }

  if (error) {
    showToast('Something went wrong. Please try WhatsApp instead.', 'error');
    console.error(error.message);
    return;
  }

  // Show success state
  document.getElementById('contactFormWrap').style.display = 'none';
  document.getElementById('successMsg').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('contactSubmitBtn')?.addEventListener('click', submitContactForm);
});
