// ============================================================
// js/orders/orders.js
// Handles: Place order, fetch orders, order detail
// Used by: checkout.html, account.html, track.html
// ============================================================

// ── VALIDATE COUPON ──────────────────────────────────────────
async function validateCoupon(code, subtotal) {
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single();

  if (error || !coupon) return { valid: false, message: 'Invalid coupon code' };

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date())
    return { valid: false, message: 'This coupon has expired' };

  if (coupon.max_uses && coupon.used_count >= coupon.max_uses)
    return { valid: false, message: 'This coupon has reached its usage limit' };

  if (subtotal < coupon.min_order)
    return { valid: false, message: `Minimum order of ${formatPrice(coupon.min_order)} required` };

  const discount = coupon.discount_type === 'percent'
    ? Math.round(subtotal * coupon.discount_value / 100)
    : coupon.discount_value;

  return { valid: true, discount, coupon, message: `${coupon.discount_value}${coupon.discount_type === 'percent' ? '%' : '₹'} discount applied!` };
}

// ── PLACE ORDER ──────────────────────────────────────────────
async function placeOrder({ addressData, deliveryMethod, paymentMethod, couponCode }) {
  const user = await getCurrentUser();
  if (!user) { window.location.href = PAGES.login; return; }

  const cartItems = await getCartItems();
  if (!cartItems.length) { showToast('Your cart is empty', 'error'); return; }

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const baseShipping = subtotal >= 999 ? 0 : 79;
  const extraShipping = deliveryMethod === 'express' ? 99 : deliveryMethod === 'cod' ? 30 : 0;
  const shippingCharge = baseShipping + extraShipping;

  // Validate coupon
  let discount = 0;
  if (couponCode) {
    const result = await validateCoupon(couponCode, subtotal);
    if (result.valid) {
      discount = result.discount;
      // Increment coupon usage
      await supabase.rpc('increment_coupon_usage', { coupon_code: couponCode }).catch(() => {});
    } else {
      showToast(result.message, 'error');
      return;
    }
  }

  const total = subtotal - discount + shippingCharge;

  const btn = document.getElementById('placeOrderBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Placing Order…'; }

  try {
    // 1. Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id:          user.id,
        status:           'placed',
        subtotal,
        discount,
        shipping_charge:  shippingCharge,
        total,
        coupon_code:      couponCode || null,
        payment_method:   paymentMethod,
        payment_status:   paymentMethod === 'cod' ? 'pending' : 'paid',
        shipping_address: addressData
      })
      .select()
      .single();

    if (orderError) throw new Error(orderError.message);

    // 2. Insert order items
    const orderItems = cartItems.map(item => ({
      order_id:     order.id,
      product_id:   item.id,
      product_name: item.name,
      quantity:     item.qty,
      unit_price:   item.price,
      total_price:  item.price * item.qty
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw new Error(itemsError.message);

    // 3. Add reward points (10 pts per ₹100 spent)
    const pointsEarned = Math.floor(total / 100) * 10;
    await supabase
      .from('profiles')
      .update({ reward_points: supabase.rpc('increment', { x: pointsEarned }) })
      .eq('id', user.id)
      .catch(() => {});

    // 4. Clear cart
    await clearCart();

    // 5. Redirect to confirmation
    window.location.href = PAGES.orderConfirmed + `?order=${order.order_number}`;

  } catch (err) {
    console.error('Order error:', err.message);
    showToast('Something went wrong. Please try again.', 'error');
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa fa-lock"></i>&nbsp; Place Order'; }
  }
}

// ── FETCH USER ORDERS ────────────────────────────────────────
async function fetchUserOrders() {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id, order_number, status, total, created_at, payment_method,
      order_items (
        product_name, quantity, unit_price,
        product:products (id, name, image_url)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) { console.error(error.message); return []; }
  return data || [];
}

// ── TRACK ORDER BY NUMBER ────────────────────────────────────
async function trackOrder(orderNumber, email) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *, 
      order_items (
        product_name, quantity, unit_price,
        product:products (id, name, image_url)
      )
    `)
    .eq('order_number', orderNumber.replace('#', '').toUpperCase())
    .single();

  if (error || !data) return null;
  return data;
}

// ── RENDER ORDERS IN ACCOUNT PAGE ───────────────────────────
function renderOrders(orders, containerId = 'ordersContainer') {
  const c = document.getElementById(containerId);
  if (!c) return;

  if (!orders.length) {
    c.innerHTML = `<p style="color:var(--text-muted)">No orders yet. <a href=PAGES.products style="color:var(--brown)">Start shopping!</a></p>`;
    return;
  }

  const STATUS_MAP = {
    placed:            { label: '⏳ Placed',           cls: 'status-processing' },
    confirmed:         { label: '✅ Confirmed',         cls: 'status-delivered'  },
    packing:           { label: '📦 Packing',           cls: 'status-processing' },
    shipped:           { label: '🚚 Shipped',           cls: 'status-shipped'    },
    out_for_delivery:  { label: '🛵 Out for Delivery',  cls: 'status-shipped'    },
    delivered:         { label: '✅ Delivered',         cls: 'status-delivered'  },
    cancelled:         { label: '❌ Cancelled',         cls: 'status-processing' },
    returned:          { label: '🔄 Returned',          cls: 'status-processing' },
  };

  c.innerHTML = orders.map(order => {
    const st     = STATUS_MAP[order.status] || { label: order.status, cls: '' };
    const thumbs = (order.order_items || []).slice(0, 4).map(item => {
      const img = item.product?.image_url || '';
      return `<div class="order-thumb">
        <img src="${img}" alt="${item.product_name}"
          onerror="this.src='https://placehold.co/60x60/f5f0eb/888'" />
      </div>`;
    }).join('');

    return `
      <div class="order-card">
        <div class="order-header">
          <div>
            <span class="order-id">${order.order_number}</span>
            &nbsp;&nbsp;
            <span class="order-date">${formatDate(order.created_at)}</span>
          </div>
          <span class="order-status ${st.cls}">${st.label}</span>
        </div>
        <div class="order-items">${thumbs}</div>
        <div class="order-footer">
          <span class="order-total">${formatPrice(order.total)}</span>
          <div style="display:flex;gap:10px">
            <a href="track.html?order=${order.order_number}" class="btn btn-outline-dark" style="padding:8px 20px;font-size:0.8rem">Track</a>
            <button class="btn btn-dark" style="padding:8px 20px;font-size:0.8rem" onclick="reorder('${order.id}')">Reorder</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

// ── REORDER ──────────────────────────────────────────────────
async function reorder(orderId) {
  const { data, error } = await supabase
    .from('order_items')
    .select('product_id, quantity')
    .eq('order_id', orderId);

  if (error || !data) { showToast('Could not reorder. Try again.', 'error'); return; }

  for (const item of data) {
    for (let i = 0; i < item.quantity; i++) {
      await addToCart(item.product_id);
    }
  }
  showToast('Items added to cart! 🛒', 'success');
}
