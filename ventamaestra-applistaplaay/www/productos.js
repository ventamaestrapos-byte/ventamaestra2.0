// Base de datos de productos en localStorage
let productDatabase = JSON.parse(localStorage.getItem('ventamaestra_products')) || [];

let editingProductId = null;

// Elementos del DOM
const productForm = document.getElementById('productForm');
const formTitle = document.getElementById('formTitle');
const productsTableBody = document.querySelector('#productsTable tbody');
const productStatus = document.getElementById('productStatus');
const productSearch = document.getElementById('productSearch');
const cancelBtn = document.getElementById('cancelBtn');

// Campos del formulario
const productNameInput = document.getElementById('productName');
const barcodeInput = document.getElementById('barcode');
const familyInput = document.getElementById('family');
const unitTypeInput = document.getElementById('unitType');
const purchasePriceInput = document.getElementById('purchasePrice');
const salePriceInput = document.getElementById('salePrice');
const wholesalePriceInput = document.getElementById('wholesalePrice');
const wholesaleQtyInput = document.getElementById('wholesaleQty');
const stockInput = document.getElementById('stock');
const expiryDateInput = document.getElementById('expiryDate');
const allowNegativeInput = document.getElementById('allowNegative');

// Inicializar
function init() {
  renderProductsTable();
  attachEvents();
  updateStatus('Listo para agregar productos.');
}

function attachEvents() {
  if (productForm) productForm.addEventListener('submit', handleSubmit);
  if (cancelBtn) cancelBtn.addEventListener('click', resetForm);
  if (productSearch) productSearch.addEventListener('input', handleSearch);
  if (productNameInput) productNameInput.focus();
}

function handleSubmit(e) {
  e.preventDefault();
  
  // Validar que existan los elementos necesarios
  if (!productNameInput || !barcodeInput) {
    console.error('Elementos del formulario no encontrados');
    alert('Error: No se pueden cargar los campos del formulario. Recarga la página.');
    return;
  }
  
  const product = {
    id: editingProductId || Date.now(),
    name: productNameInput.value.trim(),
    barcode: barcodeInput.value.trim(),
    family: familyInput ? familyInput.value.trim() : '',
    unitType: unitTypeInput ? unitTypeInput.value : 'pieza',
    purchasePrice: purchasePriceInput ? parseFloat(purchasePriceInput.value) || 0 : 0,
    salePrice: salePriceInput ? parseFloat(salePriceInput.value) || 0 : 0,
    wholesalePrice: wholesalePriceInput ? parseFloat(wholesalePriceInput.value) || 0 : 0,
    wholesaleQty: wholesaleQtyInput ? parseInt(wholesaleQtyInput.value) || 0 : 0,
    stock: stockInput ? parseInt(stockInput.value) || 0 : 0,
    expiryDate: expiryDateInput ? expiryDateInput.value : '',
    allowNegative: allowNegativeInput ? allowNegativeInput.checked : true
  };
  
  try {
    if (editingProductId) {
      // Editar
      const index = productDatabase.findIndex(p => p.id === editingProductId);
      if (index !== -1) {
        productDatabase[index] = product;
        updateStatus(`Producto "${product.name}" actualizado correctamente.`);
      }
    } else {
      // Agregar
      productDatabase.push(product);
      updateStatus(`Producto "${product.name}" agregado correctamente.`);
    }
    
    saveToLocalStorage();
    renderProductsTable();
    resetForm();
  } catch (error) {
    console.error('Error al guardar producto:', error);
    updateStatus('Error al guardar el producto. Revisa la consola.');
  }
}

function saveToLocalStorage() {
  localStorage.setItem('ventamaestra_products', JSON.stringify(productDatabase));
  // También actualizar en el TPV
  localStorage.setItem('ventamaestra_products_updated', Date.now().toString());
}

function renderProductsTable(filter = '') {
  if (!productsTableBody) {
    console.error('Tabla de productos no encontrada');
    return;
  }
  
  productsTableBody.innerHTML = '';
  
  let filteredProducts = productDatabase;
  if (filter) {
    const query = filter.toLowerCase();
    filteredProducts = productDatabase.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.barcode.toLowerCase().includes(query) ||
      p.family.toLowerCase().includes(query)
    );
  }
  
  filteredProducts.forEach(product => {
    const tr = document.createElement('tr');
    
    const stockClass = product.stock <= 0 ? 'stock-zero' : product.stock < 5 ? 'stock-low' : 'stock-ok';
    
    tr.innerHTML = `
      <td>${product.barcode || '—'}</td>
      <td>${product.name}</td>
      <td><span class="stock-tag ${stockClass}">${product.stock}</span></td>
      <td>$${product.salePrice.toFixed(2)}</td>
      <td>
        <button class="cmd-btn" style="padding: 4px 8px; font-size: 0.8rem;" onclick="editProduct(${product.id})">Editar</button>
        <button class="cmd-btn cmd-danger" style="padding: 4px 8px; font-size: 0.8rem;" onclick="deleteProduct(${product.id})">Eliminar</button>
      </td>
    `;
    
  if (!productSearch) return;
    productsTableBody.appendChild(tr);
  });
}

function handleSearch() {
  const query = productSearch.value.trim();
  renderProductsTable(query);
}

function editProduct(id) {
  const product = productDatabase.find(p => p.id === id);
  if (!product) return;
  
  editingProductId = id;
  if (formTitle) formTitle.textContent = 'Editar Producto';
  
  if (productNameInput) productNameInput.value = product.name;
  if (barcodeInput) barcodeInput.value = product.barcode || '';
  if (familyInput) familyInput.value = product.family || '';
  if (unitTypeInput) unitTypeInput.value = product.unitType || 'pieza';
  if (purchasePriceInput) purchasePriceInput.value = product.purchasePrice || '';
  if (salePriceInput) salePriceInput.value = product.salePrice;
  if (wholesalePriceInput) wholesalePriceInput.value = product.wholesalePrice || '';
  if (wholesaleQtyInput) wholesaleQtyInput.value = product.wholesaleQty || '';
  if (stockInput) stockInput.value = product.stock;
  if (expiryDateInput) expiryDateInput.value = product.expiryDate || '';
  if (allowNegativeInput) allowNegativeInput.checked = product.allowNegative;
  
  updateStatus(`Editando producto: ${product.name}`);
  if (productNameInput) productNameInput.focus();
}

function deleteProduct(id) {
  const product = productDatabase.find(p => p.id === id);
  if (!product) return;
  
  if (confirm(`¿Eliminar el producto "${product.name}"?`)) {
    productDatabase = productDatabase.filter(p => p.id !== id);
    saveToLocalStorage();
    renderProductsTable();
    updateStatus(`Producto "${product.name}" eliminado.`);
  }
}

function resetForm() {
  editingProductId = null;
  if (formTitle) formTitle.textContent = 'Agregar Producto';
  if (productForm) productForm.reset();
  if (stockInput) stockInput.value = '0';
  if (allowNegativeInput) allowNegativeInput.checked = true;
  updateStatus('Formulario limpio. Listo para agregar nuevo producto.');
  if (productNameInput) productNameInput.focus();
}

function updateStatus(msg) {
  if (productStatus) productStatus.textContent = msg;
} cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
// Hacer funciones globales para los botones
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;

// Iniciar
init();
