// Obtener ID de tienda actual desde la licencia
let currentStoreId = '';
let allOrders = [];
let filteredOrders = [];

// Referencias DOM
const ordersGrid = document.getElementById('ordersGrid');
const searchOrder = document.getElementById('searchOrder');
const filterStatus = document.getElementById('filterStatus');
const filterDelivery = document.getElementById('filterDelivery');
const filterDate = document.getElementById('filterDate');
const orderModal = document.getElementById('orderModal');

// Event Listeners
searchOrder.addEventListener('input', applyFilters);
filterStatus.addEventListener('change', applyFilters);
filterDelivery.addEventListener('change', applyFilters);
filterDate.addEventListener('change', applyFilters);

// Inicialización
init();

function init() {
  loadCurrentStore();
  loadOrders();
  renderOrders();
  updateStats();
  
  // Auto-actualizar cada 30 segundos
  setInterval(() => {
    loadOrders();
    renderOrders();
    updateStats();
  }, 30000);
}

function loadCurrentStore() {
  const license = JSON.parse(localStorage.getItem('ventamaestra_license'));
  if (!license) {
    alert('No se encontró licencia activa');
    window.location.href = 'licencias.html';
    return;
  }
  currentStoreId = license.storeId;
}

function loadOrders() {
  const ordersKey = `ventamaestra_online_orders_${currentStoreId}`;
  allOrders = JSON.parse(localStorage.getItem(ordersKey)) || [];
  
  // Ordenar por fecha descendente (más recientes primero)
  allOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  filteredOrders = allOrders;
}

function applyFilters() {
  const search = searchOrder.value.toLowerCase();
  const status = filterStatus.value;
  const delivery = filterDelivery.value;
  const date = filterDate.value;
  
  filteredOrders = allOrders.filter(order => {
    // Filtro de búsqueda
    const matchSearch = !search || 
      order.id.toLowerCase().includes(search) ||
      order.customer.name.toLowerCase().includes(search) ||
      order.customer.phone.includes(search);
    
    // Filtro de estado
    const matchStatus = !status || order.status === status;
    
    // Filtro de tipo de entrega
    const matchDelivery = !delivery || order.deliveryType === delivery;
    
    // Filtro de fecha
    const matchDate = !date || order.date.startsWith(date);
    
    return matchSearch && matchStatus && matchDelivery && matchDate;
  });
  
  renderOrders();
}

function renderOrders() {
  if (filteredOrders.length === 0) {
    ordersGrid.innerHTML = `
      <div class="no-orders" style="grid-column: 1/-1;">
        <i>📭</i>
        <h3>No hay pedidos</h3>
        <p>Los pedidos en línea aparecerán aquí</p>
      </div>
    `;
    return;
  }
  
  ordersGrid.innerHTML = filteredOrders.map(order => {
    const orderDate = new Date(order.date);
    const formattedDate = orderDate.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `
      <div class="order-card">
        <div class="order-header">
          <span class="order-id">${order.id}</span>
          <span class="order-status ${order.status.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}">${order.status}</span>
        </div>
        <div class="order-body">
          <div class="order-info">
            <div class="order-info-row">
              <span class="order-info-label">👤 Cliente</span>
              <span class="order-info-value">${order.customer.name}</span>
            </div>
            <div class="order-info-row">
              <span class="order-info-label">📞 Teléfono</span>
              <span class="order-info-value">${order.customer.phone}</span>
            </div>
            <div class="order-info-row">
              <span class="order-info-label">📍 Entrega</span>
              <span class="order-info-value">${order.deliveryType === 'delivery' ? 'Domicilio' : 'Recoger'}</span>
            </div>
            ${order.deliveryType === 'delivery' ? `
            <div class="order-info-row">
              <span class="order-info-label">🏠 Dirección</span>
              <span class="order-info-value" style="font-size: 0.85rem;">${order.customer.address}</span>
            </div>
            ` : ''}
            <div class="order-info-row">
              <span class="order-info-label">💳 Pago</span>
              <span class="order-info-value">${order.paymentMethod === 'cash' ? 'Efectivo' : 'Tarjeta'}</span>
            </div>
            <div class="order-info-row">
              <span class="order-info-label">🕐 Fecha</span>
              <span class="order-info-value">${formattedDate}</span>
            </div>
          </div>
          
          <div class="order-items">
            <strong>Productos (${order.items.length}):</strong>
            ${order.items.map(item => `
              <div class="order-item">
                <span>${item.qty}x ${item.name}</span>
                <span>$${(item.price * item.qty).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          
          ${order.notes ? `
          <div style="padding: 10px; background: #fff3cd; border-radius: 4px; font-size: 0.9rem; margin-top: 10px;">
            <strong>📝 Notas:</strong> ${order.notes}
          </div>
          ` : ''}
        </div>
        
        <div class="order-total">
          <span>Total</span>
          <span>$${order.total.toFixed(2)}</span>
        </div>
        
        <div class="order-actions">
          ${getOrderActions(order)}
        </div>
      </div>
    `;
  }).join('');
}

function getOrderActions(order) {
  let actions = `<button class="btn-view" onclick="viewOrderDetails('${order.id}')">Ver Detalles</button>`;
  
  switch(order.status) {
    case 'Pendiente':
      actions += `<button class="btn-preparing" onclick="updateOrderStatus('${order.id}', 'Preparando')">Preparar</button>`;
      actions += `<button class="btn-cancel" onclick="updateOrderStatus('${order.id}', 'Cancelado')">Cancelar</button>`;
      break;
    case 'Preparando':
      actions += `<button class="btn-ready" onclick="updateOrderStatus('${order.id}', 'Listo')">Listo</button>`;
      break;
    case 'Listo':
      actions += `<button class="btn-delivered" onclick="updateOrderStatus('${order.id}', 'Entregado')">Entregar</button>`;
      break;
  }
  
  return actions;
}

window.updateOrderStatus = function(orderId, newStatus) {
  const order = allOrders.find(o => o.id === orderId);
  if (!order) return;
  
  const confirmMessages = {
    'Preparando': '¿Comenzar a preparar este pedido?',
    'Listo': '¿Marcar como listo para entregar?',
    'Entregado': '¿Confirmar entrega del pedido?',
    'Cancelado': '¿Estás seguro de cancelar este pedido?'
  };
  
  if (!confirm(confirmMessages[newStatus])) return;
  
  order.status = newStatus;
  order.statusUpdatedAt = new Date().toISOString();
  
  // Si se entrega o cancela, agregar al histórico
  if (newStatus === 'Entregado') {
    // Reducir inventario
    reduceInventory(order);
  }
  
  saveOrders();
  loadOrders();
  renderOrders();
  updateStats();
  
  const successMessages = {
    'Preparando': '🔵 Pedido en preparación',
    'Listo': '🟢 Pedido listo para entregar',
    'Entregado': '✅ Pedido entregado exitosamente',
    'Cancelado': '❌ Pedido cancelado'
  };
  
  alert(successMessages[newStatus]);
};

function reduceInventory(order) {
  // Cargar productos de la tienda
  const productsKey = `ventamaestra_products_${currentStoreId}`;
  let products = JSON.parse(localStorage.getItem(productsKey)) || 
                 JSON.parse(localStorage.getItem('ventamaestra_products')) || [];
  
  // Reducir stock de cada producto
  order.items.forEach(item => {
    const product = products.find(p => p.id === item.id);
    if (product) {
      product.stock -= item.qty;
      
      // Registrar en kárdex
      if (typeof registerKardexMovement === 'function') {
        registerKardexMovement({
          productId: product.id,
          productName: product.name,
          type: 'Salida',
          qty: item.qty,
          unitType: product.unitType || 'unidades',
          reason: 'Venta en línea',
          reference: order.id,
          user: 'Sistema Web',
          notes: `Cliente: ${order.customer.name}`
        });
      }
    }
  });
  
  // Guardar productos actualizados
  localStorage.setItem(productsKey, JSON.stringify(products));
  if (!productsKey.includes('_')) {
    localStorage.setItem('ventamaestra_products', JSON.stringify(products));
  }
}

function saveOrders() {
  const ordersKey = `ventamaestra_online_orders_${currentStoreId}`;
  localStorage.setItem(ordersKey, JSON.stringify(allOrders));
}

function updateStats() {
  const today = new Date().toISOString().split('T')[0];
  
  const pending = allOrders.filter(o => o.status === 'Pendiente').length;
  const preparing = allOrders.filter(o => o.status === 'Preparando').length;
  const ready = allOrders.filter(o => o.status === 'Listo').length;
  const deliveredToday = allOrders.filter(o => 
    o.status === 'Entregado' && o.date.startsWith(today)
  ).length;
  
  document.getElementById('statPending').textContent = pending;
  document.getElementById('statPreparing').textContent = preparing;
  document.getElementById('statReady').textContent = ready;
  document.getElementById('statDelivered').textContent = deliveredToday;
}

window.viewOrderDetails = function(orderId) {
  const order = allOrders.find(o => o.id === orderId);
  if (!order) return;
  
  const orderDate = new Date(order.date);
  const formattedDate = orderDate.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  document.getElementById('modalOrderId').textContent = `Pedido ${order.id}`;
  
  let detailsHTML = `
    <div class="order-detail-section">
      <h3>Estado del Pedido</h3>
      <div style="padding: 15px; background: #f5f5f5; border-radius: 8px; text-align: center;">
        <span class="order-status ${order.status.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}" style="font-size: 1.1rem; padding: 8px 20px;">${order.status}</span>
        <p style="margin-top: 10px; color: #666; font-size: 0.9rem;">Actualizado: ${formattedDate}</p>
      </div>
    </div>
    
    <div class="order-detail-section">
      <h3>Información del Cliente</h3>
      <div class="order-info">
        <div class="order-info-row">
          <span class="order-info-label">👤 Nombre</span>
          <span class="order-info-value">${order.customer.name}</span>
        </div>
        <div class="order-info-row">
          <span class="order-info-label">📞 Teléfono</span>
          <span class="order-info-value">${order.customer.phone}</span>
        </div>
        <div class="order-info-row">
          <span class="order-info-label">📍 Tipo de Entrega</span>
          <span class="order-info-value">${order.deliveryType === 'delivery' ? 'Domicilio' : 'Recoger en tienda'}</span>
        </div>
        ${order.deliveryType === 'delivery' ? `
        <div class="order-info-row">
          <span class="order-info-label">🏠 Dirección</span>
          <span class="order-info-value">${order.customer.address}</span>
        </div>
        ` : ''}
      </div>
    </div>
    
    <div class="order-detail-section">
      <h3>Productos</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f5f5f5; text-align: left;">
            <th style="padding: 10px;">Cant.</th>
            <th style="padding: 10px;">Producto</th>
            <th style="padding: 10px; text-align: right;">Precio</th>
            <th style="padding: 10px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px;">${item.qty}</td>
              <td style="padding: 10px;">${item.name}</td>
              <td style="padding: 10px; text-align: right;">$${item.price.toFixed(2)}</td>
              <td style="padding: 10px; text-align: right; font-weight: bold;">$${(item.price * item.qty).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    
    <div class="order-detail-section">
      <h3>Resumen de Pago</h3>
      <div class="order-info">
        <div class="order-info-row">
          <span class="order-info-label">Subtotal</span>
          <span class="order-info-value">$${order.subtotal.toFixed(2)}</span>
        </div>
        ${order.deliveryFee > 0 ? `
        <div class="order-info-row">
          <span class="order-info-label">Envío</span>
          <span class="order-info-value">$${order.deliveryFee.toFixed(2)}</span>
        </div>
        ` : ''}
        <div class="order-info-row" style="border-top: 2px solid var(--primary-color); padding-top: 12px; margin-top: 8px;">
          <span class="order-info-label" style="font-size: 1.2rem; font-weight: bold;">TOTAL</span>
          <span class="order-info-value" style="font-size: 1.3rem; color: var(--primary-color);">$${order.total.toFixed(2)}</span>
        </div>
        <div class="order-info-row">
          <span class="order-info-label">Método de Pago</span>
          <span class="order-info-value">${order.paymentMethod === 'cash' ? '💵 Efectivo' : '💳 Tarjeta'}</span>
        </div>
      </div>
    </div>
    
    ${order.notes ? `
    <div class="order-detail-section">
      <h3>Notas del Cliente</h3>
      <div style="padding: 15px; background: #fff3cd; border-radius: 8px;">
        ${order.notes}
      </div>
    </div>
    ` : ''}
  `;
  
  document.getElementById('orderDetails').innerHTML = detailsHTML;
  orderModal.classList.add('open');
};

window.closeOrderModal = function() {
  orderModal.classList.remove('open');
};

window.printOrder = function() {
  window.print();
};

window.refreshOrders = function() {
  loadOrders();
  renderOrders();
  updateStats();
  alert('✅ Pedidos actualizados');
};

// Cerrar modal al hacer clic fuera
orderModal.addEventListener('click', function(e) {
  if (e.target === orderModal) {
    closeOrderModal();
  }
});
