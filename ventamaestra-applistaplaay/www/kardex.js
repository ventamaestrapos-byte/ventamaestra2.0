// Variables globales
let products = JSON.parse(localStorage.getItem('ventamaestra_products')) || [];
let kardexMovements = JSON.parse(localStorage.getItem('ventamaestra_kardex')) || [];
let selectedProduct = null;
let filteredMovements = [];
let currentUser = JSON.parse(localStorage.getItem('ventamaestra_current_user')) || { name: 'Sistema' };

// Referencias DOM
const productSearch = document.getElementById('productSearch');
const productList = document.getElementById('productList');
const btnShowKardex = document.getElementById('btnShowKardex');
const productInfoCard = document.getElementById('productInfoCard');
const summaryCard = document.getElementById('summaryCard');
const filtersCard = document.getElementById('filtersCard');
const movementsCard = document.getElementById('movementsCard');
const manualMovementCard = document.getElementById('manualMovementCard');
const movementsBody = document.getElementById('movementsBody');
const emptyMessage = document.getElementById('emptyMessage');

const infoName = document.getElementById('infoName');
const infoStock = document.getElementById('infoStock');
const infoCost = document.getElementById('infoCost');
const infoPrice = document.getElementById('infoPrice');
const infoFamily = document.getElementById('infoFamily');
const infoUnit = document.getElementById('infoUnit');

const totalEntries = document.getElementById('totalEntries');
const totalExits = document.getElementById('totalExits');
const totalMovements = document.getElementById('totalMovements');
const inventoryValue = document.getElementById('inventoryValue');

const filterType = document.getElementById('filterType');
const filterReason = document.getElementById('filterReason');
const filterDateFrom = document.getElementById('filterDateFrom');
const filterDateTo = document.getElementById('filterDateTo');
const btnApplyFilter = document.getElementById('btnApplyFilter');
const btnClearFilter = document.getElementById('btnClearFilter');
const btnExportKardex = document.getElementById('btnExportKardex');

const movementForm = document.getElementById('movementForm');
const movementType = document.getElementById('movementType');
const movementReason = document.getElementById('movementReason');
const movementQuantity = document.getElementById('movementQuantity');
const movementNotes = document.getElementById('movementNotes');

// Event Listeners
productSearch.addEventListener('input', filterProducts);
btnShowKardex.addEventListener('click', showSelectedProductKardex);
btnApplyFilter.addEventListener('click', applyFilters);
btnClearFilter.addEventListener('click', clearFilters);
btnExportKardex.addEventListener('click', exportToCSV);
movementForm.addEventListener('submit', handleManualMovement);

// Inicialización
init();

function init() {
  renderProductList();
}

function filterProducts() {
  const query = productSearch.value.toLowerCase();
  
  if (query.length < 2) {
    productList.innerHTML = '';
    return;
  }
  
  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(query) || 
    p.barcode.toLowerCase().includes(query) ||
    p.family.toLowerCase().includes(query)
  );
  
  renderProductList(filtered);
}

function renderProductList(filtered = products) {
  if (filtered.length === 0) {
    productList.innerHTML = '<p style="padding: 10px; text-align: center; color: #999;">No se encontraron productos.</p>';
    return;
  }
  
  productList.innerHTML = filtered.slice(0, 10).map(product => `
    <div class="product-item" onclick="selectProduct(${product.id})" 
         style="padding: 10px; border: 1px solid #e0e0e0; border-radius: 6px; margin-bottom: 6px; cursor: pointer; transition: background 0.2s;">
      <strong>${product.name}</strong>
      <div style="font-size: 0.85rem; color: #666; margin-top: 4px;">
        <span>Stock: ${product.stock}</span> | 
        <span>${product.family || 'Sin familia'}</span> |
        <span>${product.barcode || 'Sin código'}</span>
      </div>
    </div>
  `).join('');
}

window.selectProduct = function(productId) {
  selectedProduct = products.find(p => p.id === productId);
  if (selectedProduct) {
    productSearch.value = selectedProduct.name;
    productList.innerHTML = '';
    showKardex(selectedProduct);
  }
};

function showSelectedProductKardex() {
  if (!selectedProduct) {
    alert('Selecciona un producto primero.');
    return;
  }
  showKardex(selectedProduct);
}

function showKardex(product) {
  selectedProduct = product;
  
  // Mostrar información del producto
  infoName.textContent = product.name;
  infoStock.textContent = product.stock + ' ' + (product.unitType || 'unidades');
  infoCost.textContent = '$' + (product.cost || 0).toFixed(2);
  infoPrice.textContent = '$' + product.price.toFixed(2);
  infoFamily.textContent = product.family || 'Sin familia';
  infoUnit.textContent = getUnitLabel(product.unitType);
  
  // Filtrar movimientos del producto
  const productMovements = kardexMovements.filter(m => m.productId === product.id);
  filteredMovements = productMovements;
  
  // Calcular resumen
  const summary = calculateSummary(productMovements);
  totalEntries.textContent = summary.entries.toFixed(3);
  totalExits.textContent = summary.exits.toFixed(3);
  totalMovements.textContent = productMovements.length;
  inventoryValue.textContent = '$' + (product.stock * product.cost).toFixed(2);
  
  // Mostrar tarjetas
  productInfoCard.style.display = 'block';
  summaryCard.style.display = 'block';
  filtersCard.style.display = 'block';
  movementsCard.style.display = 'block';
  manualMovementCard.style.display = 'block';
  
  // Renderizar movimientos
  renderMovements(filteredMovements);
}

function calculateSummary(movements) {
  let entries = 0;
  let exits = 0;
  
  movements.forEach(m => {
    if (m.type === 'entry') {
      entries += m.quantity;
    } else {
      exits += m.quantity;
    }
  });
  
  return { entries, exits };
}

function renderMovements(movements) {
  if (movements.length === 0) {
    movementsBody.innerHTML = '';
    emptyMessage.style.display = 'block';
    return;
  }
  
  emptyMessage.style.display = 'none';
  
  // Ordenar por fecha descendente
  const sorted = [...movements].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  movementsBody.innerHTML = sorted.map(movement => {
    const typeClass = movement.type === 'entry' ? 'style="color: #2e7d32; font-weight: 600;"' : 'style="color: #c62828; font-weight: 600;"';
    const typeSymbol = movement.type === 'entry' ? '↑' : '↓';
    const typeLabel = movement.type === 'entry' ? 'Entrada' : 'Salida';
    
    return `
      <tr>
        <td>${formatDateTime(movement.date)}</td>
        <td ${typeClass}>${typeSymbol} ${typeLabel}</td>
        <td>${getReasonLabel(movement.reason)}</td>
        <td style="text-align: right; font-weight: 600;">${movement.quantity.toFixed(3)}</td>
        <td style="text-align: right;">${movement.previousStock.toFixed(3)}</td>
        <td style="text-align: right; font-weight: 600;">${movement.newStock.toFixed(3)}</td>
        <td style="text-align: right;">$${(movement.unitCost || 0).toFixed(2)}</td>
        <td style="text-align: right;">$${(movement.quantity * (movement.unitCost || 0)).toFixed(2)}</td>
        <td>${movement.user || 'Sistema'}</td>
        <td><small>${movement.reference || '-'}</small></td>
      </tr>
    `;
  }).join('');
}

function getUnitLabel(unitType) {
  const labels = {
    pieza: 'Pieza',
    kilo: 'Kilogramo',
    litro: 'Litro',
    granel: 'Granel'
  };
  return labels[unitType] || unitType || 'Pieza';
}

function getReasonLabel(reason) {
  const labels = {
    sale: '🛒 Venta',
    purchase: '📦 Compra',
    adjustment: '⚖️ Ajuste',
    return: '↩️ Devolución',
    damage: '💔 Merma/Daño',
    gift: '🎁 Obsequio',
    transfer: '🔄 Transferencia',
    initial: '🏁 Inventario Inicial'
  };
  return labels[reason] || reason;
}

function formatDateTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString('es-MX', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function applyFilters() {
  if (!selectedProduct) return;
  
  let movements = kardexMovements.filter(m => m.productId === selectedProduct.id);
  
  // Filtro por tipo
  if (filterType.value !== 'all') {
    movements = movements.filter(m => m.type === filterType.value);
  }
  
  // Filtro por razón
  if (filterReason.value !== 'all') {
    movements = movements.filter(m => m.reason === filterReason.value);
  }
  
  // Filtro por fecha desde
  if (filterDateFrom.value) {
    const fromDate = new Date(filterDateFrom.value);
    movements = movements.filter(m => new Date(m.date) >= fromDate);
  }
  
  // Filtro por fecha hasta
  if (filterDateTo.value) {
    const toDate = new Date(filterDateTo.value + 'T23:59:59');
    movements = movements.filter(m => new Date(m.date) <= toDate);
  }
  
  filteredMovements = movements;
  renderMovements(filteredMovements);
  
  // Actualizar resumen con movimientos filtrados
  const summary = calculateSummary(filteredMovements);
  totalEntries.textContent = summary.entries.toFixed(3);
  totalExits.textContent = summary.exits.toFixed(3);
  totalMovements.textContent = filteredMovements.length;
}

function clearFilters() {
  filterType.value = 'all';
  filterReason.value = 'all';
  filterDateFrom.value = '';
  filterDateTo.value = '';
  
  if (selectedProduct) {
    filteredMovements = kardexMovements.filter(m => m.productId === selectedProduct.id);
    renderMovements(filteredMovements);
    
    const summary = calculateSummary(filteredMovements);
    totalEntries.textContent = summary.entries.toFixed(3);
    totalExits.textContent = summary.exits.toFixed(3);
    totalMovements.textContent = filteredMovements.length;
  }
}

function handleManualMovement(e) {
  e.preventDefault();
  
  if (!selectedProduct) {
    alert('Selecciona un producto primero.');
    return;
  }
  
  const type = movementType.value;
  const reason = movementReason.value;
  const quantity = parseFloat(movementQuantity.value);
  const notes = movementNotes.value.trim();
  
  const previousStock = selectedProduct.stock;
  const newStock = type === 'entry' ? previousStock + quantity : previousStock - quantity;
  
  if (newStock < 0 && !selectedProduct.allowNegative) {
    alert('El stock no puede ser negativo para este producto.');
    return;
  }
  
  // Registrar movimiento
  const movement = {
    id: Date.now(),
    productId: selectedProduct.id,
    productName: selectedProduct.name,
    type: type,
    reason: reason,
    quantity: quantity,
    previousStock: previousStock,
    newStock: newStock,
    unitCost: selectedProduct.cost || 0,
    date: new Date().toISOString(),
    user: currentUser.name,
    reference: notes || 'Movimiento manual'
  };
  
  kardexMovements.push(movement);
  localStorage.setItem('ventamaestra_kardex', JSON.stringify(kardexMovements));
  
  // Actualizar stock del producto
  selectedProduct.stock = newStock;
  const productIndex = products.findIndex(p => p.id === selectedProduct.id);
  products[productIndex] = selectedProduct;
  localStorage.setItem('ventamaestra_products', JSON.stringify(products));
  localStorage.setItem('ventamaestra_products_updated', Date.now().toString());
  
  alert('Movimiento registrado correctamente.');
  movementForm.reset();
  showKardex(selectedProduct);
}

function exportToCSV() {
  if (!selectedProduct || filteredMovements.length === 0) {
    alert('No hay movimientos para exportar.');
    return;
  }
  
  let csv = 'Fecha,Hora,Tipo,Razón,Cantidad,Stock Anterior,Stock Nuevo,Costo Unit.,Valor,Usuario,Referencia\n';
  
  filteredMovements.forEach(m => {
    const date = new Date(m.date);
    const dateStr = date.toLocaleDateString('es-MX');
    const timeStr = date.toLocaleTimeString('es-MX');
    const typeLabel = m.type === 'entry' ? 'Entrada' : 'Salida';
    const reasonLabel = getReasonLabel(m.reason).replace(/[🛒📦⚖️↩️💔🎁🔄🏁]/g, '');
    
    csv += `${dateStr},${timeStr},${typeLabel},${reasonLabel},${m.quantity},${m.previousStock},${m.newStock},${m.unitCost},${m.quantity * m.unitCost},${m.user},${m.reference}\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `kardex_${selectedProduct.name}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Función global para registrar movimientos desde otros módulos
window.registerKardexMovement = function(productId, type, reason, quantity, reference = '', user = null) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  const movement = {
    id: Date.now() + Math.random(),
    productId: productId,
    productName: product.name,
    type: type,
    reason: reason,
    quantity: quantity,
    previousStock: product.stock,
    newStock: type === 'entry' ? product.stock + quantity : product.stock - quantity,
    unitCost: product.cost || 0,
    date: new Date().toISOString(),
    user: user || currentUser.name,
    reference: reference
  };
  
  kardexMovements.push(movement);
  localStorage.setItem('ventamaestra_kardex', JSON.stringify(kardexMovements));
};
