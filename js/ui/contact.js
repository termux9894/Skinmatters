async function submitContactForm() {
  const name = document.getElementById('cName')?.value.trim();
  const email = document.getElementById('cEmail')?.value.trim();
  const phone = document.getElementById('cPhone')?.value.trim();
  const subject = document.getElementById('cSubject')?.value;
  const message = document.getElementById('cMessage')?.value.trim();

  if (!name || !email || !message) {
    alert('Please fill in all required fields');
    return;
  }

  try {
    const { error } = await supabase
      .from('contact_messages')
      .insert([
        {
          name,
          email,
          phone: phone || null,
          subject: subject || null,
          message
        }
      ]);

    if (error) throw error;

    // SUCCESS
    document.getElementById('contactForm').style.display = 'none';
    document.getElementById('successMsg').style.display = 'block';

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('contactSubmitBtn');

  if (btn) {
    btn.addEventListener('click', submitContactForm);
  }
});