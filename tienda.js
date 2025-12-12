// Obtener ID de la tienda desde URL
const urlParams = new URLSearchParams(window.location.search);
const storeId = urlParams.get('store');

if (!storeId) {
  alert('Tienda no especificada');
  document.body.innerHTML = '<div style="padding: 40px; text-align: center;"><h2>⚠️ Tienda no encontrada</h2></div>';
}

// Cargar datos de la tienda
let storeConfig = {};
let products = [];
let cart = [];

// Referencias DOM
const productsGrid = document.getElementById('productsGrid');
const searchProducts = document.getElementById('searchProducts');
const cartModal = document.getElementById('cartModal');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const checkoutForm = document.getElementById('checkoutForm');
const deliveryType = document.getElementById('deliveryType');
const addressGroup = document.getElementById('addressGroup');
const paymentMethod = document.getElementById('paymentMethod');
const cashAmountGroup = document.getElementById('cashAmountGroup');
const cashAmount = document.getElementById('cashAmount');
const changeAmount = document.getElementById('changeAmount');
const deliveryFeeRow = document.getElementById('deliveryFeeRow');

// Event Listeners
searchProducts.addEventListener('input', filterProducts);
deliveryType.addEventListener('change', handleDeliveryTypeChange);
paymentMethod.addEventListener('change', handlePaymentMethodChange);
cashAmount.addEventListener('input', calculateChange);
checkoutForm.addEventListener('submit', handleCheckout);

// Inicialización
init();

function init() {
  loadStoreData();
  loadProducts();
  renderProducts();
}

function loadStoreData() {
  // Buscar configuración de la tienda específica
  const allLicenses = JSON.parse(localStorage.getItem('ventamaestra_all_licenses')) || [];
  const storeLicense = allLicenses.find(l => l.storeId === storeId);
  
  if (!storeLicense) {
    alert('Tienda no encontrada o inactiva');
    return;
  }
  
  // Cargar configuración desde la tienda
  const storeKey = `ventamaestra_store_config_${storeId}`;
  storeConfig = JSON.parse(localStorage.getItem(storeKey)) || 
                JSON.parse(localStorage.getItem('ventamaestra_store_config')) || {};
  
  // Aplicar configuración visual
  if (storeConfig.color) {
    document.documentElement.style.setProperty('--store-color', storeConfig.color);
  }
  
  // Mostrar información de la tienda
  document.getElementById('storeName').textContent = storeLicense.storeName;
  document.getElementById('storeAddress').textContent = storeLicense.storeAddress || '';
  
  if (storeConfig.logo) {
    const logoImg = document.getElementById('storeLogo');
    logoImg.src = storeConfig.logo;
    logoImg.style.display = 'block';
  }
  
  if (storeConfig.message) {
    document.getElementById('welcomeMessage').innerHTML = `
      <h3>Bienvenido</h3>
      <p>${storeConfig.message}</p>
    `;
  }
  
  // Configurar opciones de entrega y pago
  if (!storeConfig.allowDelivery) {
    deliveryType.querySelector('option[value="delivery"]').remove();
  }
  if (!storeConfig.allowPickup) {
    deliveryType.querySelector('option[value="pickup"]').remove();
  }
  if (!storeConfig.acceptCash) {
    paymentMethod.querySelector('option[value="cash"]').remove();
  }
  if (!storeConfig.acceptCard) {
    paymentMethod.querySelector('option[value="card"]').remove();
  }
}

function loadProducts() {
  // Cargar productos de esta tienda específica
  const productsKey = `ventamaestra_products_${storeId}`;
  products = JSON.parse(localStorage.getItem(productsKey)) || 
             JSON.parse(localStorage.getItem('ventamaestra_products')) || [];
  
  // Filtrar solo productos con stock
  products = products.filter(p => p.stock > 0);
}

function renderProducts() {
  const query = searchProducts.value.toLowerCase();
  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(query) ||
    (p.family && p.family.toLowerCase().includes(query))
  );
  
  if (filtered.length === 0) {
    productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">No hay productos disponibles</p>';
    return;
  }
  
  productsGrid.innerHTML = filtered.map(product => `
    <div class="product-card">
      <div class="product-image">
        ${getProductEmoji(product.family)}
      </div>
      <div class="product-name">${product.name}</div>
      <div style="font-size: 0.85rem; color: #666; margin-bottom: 8px;">
        ${product.family || 'Producto'}
      </div>
      <div class="product-price">$${product.price.toFixed(2)}</div>
      <div style="font-size: 0.85rem; color: #999; margin-bottom: 12px;">
        Stock: ${product.stock} ${product.unitType || 'unidades'}
      </div>
      <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
        Agregar al carrito
      </button>
    </div>
  `).join('');
}

function getProductEmoji(family) {
  const emojis = {
    'Bebidas': '🥤',
    'Lacteos': '🥛',
    'Panaderia': '🍞',
    'Carnes': '🥩',
    'Frutas': '🍎',
    'Verduras': '🥬',
    'Abarrotes': '🏪',
    'Limpieza': '🧹',
    'Botanas': '🍿',
    'Dulces': '🍬'
  };
  return emojis[family] || '📦';
}

function filterProducts() {
  renderProducts();
}

window.addToCart = function(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    if (existingItem.qty < product.stock) {
      existingItem.qty++;
    } else {
      alert('No hay más stock disponible');
      return;
    }
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
      maxStock: product.stock
    });
  }
  
  updateCartCount();
  
  // Animación visual
  const cartButton = document.querySelector('.cart-button');
  cartButton.style.transform = 'scale(1.1)';
  setTimeout(() => {
    cartButton.style.transform = 'scale(1)';
  }, 200);
};

function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = totalItems;
  cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
}

window.openCart = function() {
  if (cart.length === 0) {
    alert('Tu carrito está vacío');
    return;
  }
  
  renderCart();
  cartModal.classList.add('open');
};

window.closeCart = function() {
  cartModal.classList.remove('open');
};

function renderCart() {
  if (cart.length === 0) {
    cartItems.innerHTML = '<p style="text-align: center; padding: 20px; color: #999;">Carrito vacío</p>';
    return;
  }
  
  cartItems.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div style="font-weight: 600; margin-bottom: 4px;">${item.name}</div>
        <div style="color: var(--store-color); font-weight: bold;">$${item.price.toFixed(2)}</div>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="decreaseQty(${index})">-</button>
        <span style="min-width: 30px; text-align: center; font-weight: bold;">${item.qty}</span>
        <button class="qty-btn" onclick="increaseQty(${index})">+</button>
        <button class="qty-btn" onclick="removeFromCart(${index})" style="color: #f44336;">×</button>
      </div>
      <div style="font-weight: bold; min-width: 80px; text-align: right;">
        $${(item.price * item.qty).toFixed(2)}
      </div>
    </div>
  `).join('');
  
  updateTotals();
}

window.increaseQty = function(index) {
  const item = cart[index];
  if (item.qty < item.maxStock) {
    item.qty++;
    renderCart();
  } else {
    alert('No hay más stock disponible');
  }
};

window.decreaseQty = function(index) {
  const item = cart[index];
  if (item.qty > 1) {
    item.qty--;
    renderCart();
  }
};

window.removeFromCart = function(index) {
  cart.splice(index, 1);
  updateCartCount();
  renderCart();
  
  if (cart.length === 0) {
    closeCart();
  }
};

function updateTotals() {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const deliveryFee = deliveryType.value === 'delivery' ? (storeConfig.deliveryFee || 0) : 0;
  const total = subtotal + deliveryFee;
  
  document.getElementById('subtotal').textContent = '$' + subtotal.toFixed(2);
  document.getElementById('deliveryFeeAmount').textContent = '$' + deliveryFee.toFixed(2);
  document.getElementById('totalAmount').textContent = '$' + total.toFixed(2);
  
  deliveryFeeRow.style.display = deliveryType.value === 'delivery' ? 'flex' : 'none';
}

function handleDeliveryTypeChange() {
  if (deliveryType.value === 'delivery') {
    addressGroup.style.display = 'block';
    document.getElementById('customerAddress').required = true;
  } else {
    addressGroup.style.display = 'none';
    document.getElementById('customerAddress').required = false;
  }
  updateTotals();
}

function handlePaymentMethodChange() {
  if (paymentMethod.value === 'cash') {
    cashAmountGroup.style.display = 'block';
  } else {
    cashAmountGroup.style.display = 'none';
    changeAmount.textContent = '';
  }
}

function calculateChange() {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const deliveryFee = deliveryType.value === 'delivery' ? (storeConfig.deliveryFee || 0) : 0;
  const total = subtotal + deliveryFee;
  const paid = parseFloat(cashAmount.value) || 0;
  
  if (paid > total) {
    const change = paid - total;
    changeAmount.textContent = `Cambio: $${change.toFixed(2)}`;
    changeAmount.style.color = '#4caf50';
  } else if (paid > 0) {
    changeAmount.textContent = 'Monto insuficiente';
    changeAmount.style.color = '#f44336';
  } else {
    changeAmount.textContent = '';
  }
}

function handleCheckout(e) {
  e.preventDefault();
  
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  
  if (storeConfig.minOrderAmount && subtotal < storeConfig.minOrderAmount) {
    alert(`El pedido mínimo es de $${storeConfig.minOrderAmount.toFixed(2)}`);
    return;
  }
  
  const deliveryFee = deliveryType.value === 'delivery' ? (storeConfig.deliveryFee || 0) : 0;
  const total = subtotal + deliveryFee;
  
  if (paymentMethod.value === 'cash') {
    const paid = parseFloat(cashAmount.value) || 0;
    if (paid < total) {
      alert('El monto a pagar es insuficiente');
      return;
    }
  }
  
  const order = {
    id: 'WEB-' + Date.now(),
    storeId: storeId,
    date: new Date().toISOString(),
    customer: {
      name: document.getElementById('customerName').value,
      phone: document.getElementById('customerPhone').value,
      address: document.getElementById('customerAddress').value || 'Recoger en tienda'
    },
    items: cart,
    deliveryType: deliveryType.value,
    paymentMethod: paymentMethod.value,
    subtotal: subtotal,
    deliveryFee: deliveryFee,
    total: total,
    notes: document.getElementById('orderNotes').value,
    status: 'Pendiente'
  };
  
  // Guardar pedido en la tienda específica
  const ordersKey = `ventamaestra_online_orders_${storeId}`;
  let orders = JSON.parse(localStorage.getItem(ordersKey)) || [];
  orders.push(order);
  localStorage.setItem(ordersKey, JSON.stringify(orders));
  
  // Limpiar carrito
  cart = [];
  updateCartCount();
  closeCart();
  
  // Mostrar confirmación
  alert(`✅ PEDIDO CONFIRMADO\n\nNúmero: ${order.id}\nTotal: $${total.toFixed(2)}\n\nTe contactaremos pronto para confirmar tu pedido.`);
  
  checkoutForm.reset();
  deliveryType.value = '';
  paymentMethod.value = '';
};
