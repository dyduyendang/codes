// sync-pending.js
// Provides syncPendingOrders() which tries to POST pending orders stored in localStorage to /api/orders

async function syncPendingOrders() {
  try {
    const raw = localStorage.getItem('pendingOrders');
    if (!raw) return;
    const pending = JSON.parse(raw);
    if (!Array.isArray(pending) || pending.length === 0) return;

    const remaining = [];
    for (let ord of pending) {
      try {
        const payload = {
          customer: {
            first_name: ord.firstName || ord.customer?.first_name || '',
            last_name: ord.lastName || ord.customer?.last_name || '',
            email: ord.email || ord.customer?.email || '',
            phone: ord.phone || ord.customer?.phone || ''
          },
          shipping_address: {
            name: (ord.firstName || ord.customer?.first_name || '') + ' ' + (ord.lastName || ord.customer?.last_name || ''),
            phone: ord.phone || ord.shipping_address?.phone || ord.customer?.phone || '',
            line1: ord.address || ord.shipping_address?.line1 || '',
            city: ord.city || ord.shipping_address?.city || '',
            district: ord.district || ord.shipping_address?.district || ''
          },
          items: (ord.items || []).map(i => ({ product_sku: i.id || i.sku || '', product_name: i.title || i.product_name || '', unit_price: i.price || i.unit_price || 0, quantity: i.qty || i.quantity || 1, image: i.img || i.image })),
          subtotal: (ord.items || []).reduce((s,it) => s + ((it.price||0)*(it.qty||1)), 0),
          shipping_fee: ord.shipping_fee || 0,
          discount: ord.discount || 0,
          tax: ord.tax || 0,
          total_amount: ord.total_amount || (ord.items || []).reduce((s,it) => s + ((it.price||0)*(it.qty||1)), 0),
          payment_method: ord.paymentMethod || ord.payment_method || 'cod',
          note: ord.note || ''
        };

        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Server returned ' + res.status);
        console.info('Pending order synced to server');
      } catch (err) {
        console.warn('Failed to sync one pending order, will retry later', err);
        remaining.push(ord);
      }
    }

    if (remaining.length > 0) {
      localStorage.setItem('pendingOrders', JSON.stringify(remaining));
    } else {
      localStorage.removeItem('pendingOrders');
    }
  } catch (err) {
    console.error('syncPendingOrders failed', err);
  }
}

// Periodic retry every 60s
setInterval(function() {
  if (typeof syncPendingOrders === 'function') syncPendingOrders();
}, 60000);
