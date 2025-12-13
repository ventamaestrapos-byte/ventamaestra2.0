// Base de datos de compras en localStorage
let purchaseDatabase = JSON.parse(localStorage.getItem('ventamaestra_purchases')) || [];
let productDatabase = JSON.parse(localStorage.getItem('ventamaestra_products')) || [];

// Elementos del DOM
const purchaseForm = document.getElementById('purchaseForm');
const purchasesTableBody = document.querySelector('#purchasesTable tbody');
const purchaseStatus = document.getElementById('purchaseStatus');
const purchaseSearch = document.getElementById('purchaseSearch');
const cancelBtn = document.getElementById('cancelBtn');

// Campos del formulario
const folioInput = document.getElementById('folio');
const purchaseDateInput = document.getElementById('purchaseDate');
const supplierInput = document.getElementById('supplier');
const productNameInput = document.getElementById('productName');
const familyInput = document.getElementById('family');
const unitTypeInput = document.getElementById('unitType');
const quantityInput = document.getElementById('quantity');
const purchasePriceInput = document.getElementById('purchasePrice');
const salePriceInput = document.getElementById('salePrice');
const wholesalePriceInput = document.getElementById('wholesalePrice');
const wholesaleQtyInput = document.getElementById('wholesaleQty');
const barcodeInput = document.getElementById('barcode');
const expiryDateInput = document.getElementById('expiryDate');
const paymentMethodInput = document.getElementById('paymentMethod');
const totalPurchaseEl = document.getElementById('totalPurchase');

// Inicializar
function init() {
  renderPurchasesTable();
  attachEvents();
  setTodayDate();
  generateNextFolio();
  updateStatus('Listo para registrar una compra.');
}

function attachEvents() {
  purchaseForm.addEventListener('submit', handleSubmit);
  cancelBtn.addEventListener('click', resetForm);
  purchaseSearch.addEventListener('input', handleSearch);
  
  // Calcular total automáticamente
  quantityInput.addEventListener('input', calculateTotal);
  purchasePriceInput.addEventListener('input', calculateTotal);
  
  // Navegación con Enter
  const formInputs = [
    folioInput,
    purchaseDateInput,
    supplierInput,
    productNameInput,
    familyInput,
    unitTypeInput,
    quantityInput,
    purchasePriceInput,
    salePriceInput,
    wholesalePriceInput,
    wholesaleQtyInput,
    barcodeInput,
    expiryDateInput,
    paymentMethodInput
  ];
  
  formInputs.forEach((input, index) => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (index < formInputs.length - 1) {
          formInputs[index + 1].focus();
        } else {
          purchaseForm.requestSubmit();
        }
      }
    });
  });
  
  folioInput.focus();
}

function setTodayDate() {
  const today = new Date().toISOString().split('T')[0];
  purchaseDateInput.value = today;
}

function generateNextFolio() {
  const lastPurchase = purchaseDatabase[purchaseDatabase.length - 1];
  if (lastPurchase && lastPurchase.folio) {
    const match = lastPurchase.folio.match(/(\d+)$/);
    if (match) {
      const nextNum = parseInt(match[1]) + 1;
      folioInput.value = `COMP-${nextNum.toString().padStart(3, '0')}`;
      return;
    }
  }
  folioInput.value = 'COMP-001';
}

function calculateTotal() {
  const qty = parseFloat(quantityInput.value) || 0;
  const price = parseFloat(purchasePriceInput.value) || 0;
  const total = qty * price;
  totalPurchaseEl.textContent = total.toFixed(2);
}

function handleSubmit(e) {
  e.preventDefault();
  
  const qty = parseFloat(quantityInput.value) || 0;
  const purchasePrice = parseFloat(purchasePriceInput.value) || 0;
  const total = qty * purchasePrice;
  
  const purchase = {
    id: Date.now(),
    folio: folioInput.value.trim(),
    date: purchaseDateInput.value,
    supplier: supplierInput.value.trim(),
    product: {
      name: productNameInput.value.trim(),
      family: familyInput.value.trim(),
      unitType: unitTypeInput.value,
      quantity: qty,
      purchasePrice: purchasePrice,
      salePrice: parseFloat(salePriceInput.value) || 0,
      wholesalePrice: parseFloat(wholesalePriceInput.value) || 0,
      wholesaleQty: parseInt(wholesaleQtyInput.value) || 0,
      barcode: barcodeInput.value.trim(),
      expiryDate: expiryDateInput.value
    },
    paymentMethod: paymentMethodInput.value,
    total: total
  };
  
  // Guardar compra
  purchaseDatabase.push(purchase);
  localStorage.setItem('ventamaestra_purchases', JSON.stringify(purchaseDatabase));
  
  // Actualizar o agregar producto al inventario
  updateProductInventory(purchase.product);
  
  // Registrar en kárdex
  const productInInventory = products.find(p => p.name.toLowerCase() === purchase.product.name.toLowerCase());
  if (productInInventory) {
    registerKardexMovement(productInInventory.id, 'entry', 'purchase', purchase.product.quantity, `Compra ${purchase.folio} - ${purchase.supplier}`);
  }
  
  updateStatus(`Compra "${purchase.folio}" registrada correctamente. Total: $${total.toFixed(2)}`);
  renderPurchasesTable();
  resetForm();
}

function updateProductInventory(productData) {
  // Buscar si el producto ya existe (por nombre o código de barras)
  let existingProduct = productDatabase.find(p => 
    p.name.toLowerCase() === productData.name.toLowerCase() ||
    (productData.barcode && p.barcode === productData.barcode)
  );
  
  if (existingProduct) {
    // Actualizar stock y precios
    existingProduct.stock += productData.quantity;
    existingProduct.purchasePrice = productData.purchasePrice;
    existingProduct.salePrice = productData.salePrice;
    existingProduct.wholesalePrice = productData.wholesalePrice;
    existingProduct.wholesaleQty = productData.wholesaleQty;
    if (productData.expiryDate) existingProduct.expiryDate = productData.expiryDate;
  } else {
    // Crear nuevo producto
    const newProduct = {
      id: Date.now(),
      name: productData.name,
      barcode: productData.barcode,
      family: productData.family,
      unitType: productData.unitType,
      purchasePrice: productData.purchasePrice,
      salePrice: productData.salePrice,
      wholesalePrice: productData.wholesalePrice,
      wholesaleQty: productData.wholesaleQty,
      stock: productData.quantity,
      expiryDate: productData.expiryDate,
      allowNegative: true
    };
    productDatabase.push(newProduct);
  }
  
  // Guardar productos actualizados
  localStorage.setItem('ventamaestra_products', JSON.stringify(productDatabase));
  localStorage.setItem('ventamaestra_products_updated', Date.now().toString());
}

function renderPurchasesTable(filter = '') {
  purchasesTableBody.innerHTML = '';
  
  let filtered = purchaseDatabase;
  if (filter) {
    const query = filter.toLowerCase();
    filtered = purchaseDatabase.filter(p => 
      p.folio.toLowerCase().includes(query) ||
      p.supplier.toLowerCase().includes(query) ||
      p.product.name.toLowerCase().includes(query)
    );
  }
  
  // Ordenar por fecha descendente
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  filtered.forEach(purchase => {
    const tr = document.createElement('tr');
    
    const paymentLabel = {
      'efectivo': 'Efectivo',
      'credito': 'Crédito',
      'transferencia': 'Transf.',
      'cheque': 'Cheque'
    };
    
    tr.innerHTML = `
      <td><strong>${purchase.folio}</strong></td>
      <td>${formatDate(purchase.date)}</td>
      <td>${purchase.supplier}</td>
      <td>$${purchase.total.toFixed(2)}</td>
      <td>${paymentLabel[purchase.paymentMethod] || purchase.paymentMethod}</td>
    `;
    
    tr.style.cursor = 'pointer';
    tr.addEventListener('click', () => showPurchaseDetail(purchase));
    
    purchasesTableBody.appendChild(tr);
  });
}

function showPurchaseDetail(purchase) {
  const detail = `
    <strong>Folio:</strong> ${purchase.folio}<br>
    <strong>Fecha:</strong> ${formatDate(purchase.date)}<br>
    <strong>Proveedor:</strong> ${purchase.supplier}<br>
    <strong>Producto:</strong> ${purchase.product.name}<br>
    <strong>Cantidad:</strong> ${purchase.product.quantity} ${getUnitLabel(purchase.product.unitType)}<br>
    <strong>Precio Compra:</strong> $${purchase.product.purchasePrice.toFixed(2)}<br>
    <strong>Precio Venta:</strong> $${purchase.product.salePrice.toFixed(2)}<br>
    <strong>Total:</strong> $${purchase.total.toFixed(2)}<br>
    <strong>Forma de Pago:</strong> ${purchase.paymentMethod}<br>
    ${purchase.product.barcode ? `<strong>Código:</strong> ${purchase.product.barcode}<br>` : ''}
    ${purchase.product.expiryDate ? `<strong>Caducidad:</strong> ${formatDate(purchase.product.expiryDate)}` : ''}
  `;
  
  updateStatus(detail);
}

function handleSearch() {
  const query = purchaseSearch.value.trim();
  renderPurchasesTable(query);
}

function resetForm() {
  purchaseForm.reset();
  setTodayDate();
  generateNextFolio();
  totalPurchaseEl.textContent = '0.00';
  updateStatus('Formulario limpio. Listo para nueva compra.');
  folioInput.focus();
}

function updateStatus(msg) {
  purchaseStatus.innerHTML = msg;
}

function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getUnitLabel(unitType) {
  const labels = {
    'pieza': 'pza',
    'kilo': 'kg',
    'granel': 'granel',
    'litro': 'L'
  };
  return labels[unitType] || unitType || 'pza';
}

function registerKardexMovement(productId, type, reason, quantity, reference = '') {
  let kardexMovements = JSON.parse(localStorage.getItem('ventamaestra_kardex')) || [];
  const product = products.find(p => p.id === productId);
  
  if (!product) return;
  
  const previousStock = product.stock - quantity;
  const movement = {
    id: Date.now() + Math.random(),
    productId: productId,
    productName: product.name,
    type: type,
    reason: reason,
    quantity: quantity,
    previousStock: previousStock,
    newStock: product.stock,
    unitCost: product.cost || 0,
    date: new Date().toISOString(),
    user: 'Sistema',
    reference: reference
  };
  
  kardexMovements.push(movement);
  localStorage.setItem('ventamaestra_kardex', JSON.stringify(kardexMovements));
}
  return labels[unitType] || 'pza';
}

// Iniciar
init();
