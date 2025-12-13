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
  productForm.addEventListener('submit', handleSubmit);
  cancelBtn.addEventListener('click', resetForm);
  productSearch.addEventListener('input', handleSearch);
  productNameInput.focus();
}

function handleSubmit(e) {
  e.preventDefault();
  
  const product = {
    id: editingProductId || Date.now(),
    name: productNameInput.value.trim(),
    barcode: barcodeInput.value.trim(),
    family: familyInput.value.trim(),
    unitType: unitTypeInput ? unitTypeInput.value : 'pieza',
    purchasePrice: parseFloat(purchasePriceInput.value) || 0,
    salePrice: parseFloat(salePriceInput.value) || 0,
    wholesalePrice: parseFloat(wholesalePriceInput.value) || 0,
    wholesaleQty: parseInt(wholesaleQtyInput.value) || 0,
    stock: parseInt(stockInput.value) || 0,
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
  }
}

function saveToLocalStorage() {
  localStorage.setItem('ventamaestra_products', JSON.stringify(productDatabase));
  // También actualizar en el TPV
  localStorage.setItem('ventamaestra_products_updated', Date.now().toString());
}

function renderProductsTable(filter = '') {
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
  formTitle.textContent = 'Editar Producto';
  
  productNameInput.value = product.name;
  barcodeInput.value = product.barcode || '';
  familyInput.value = product.family || '';
  unitTypeInput.value = product.unitType || 'pieza';
  purchasePriceInput.value = product.purchasePrice || '';
  salePriceInput.value = product.salePrice;
  wholesalePriceInput.value = product.wholesalePrice || '';
  wholesaleQtyInput.value = product.wholesaleQty || '';
  stockInput.value = product.stock;
  expiryDateInput.value = product.expiryDate || '';
  allowNegativeInput.checked = product.allowNegative;
  
  updateStatus(`Editando producto: ${product.name}`);
  productNameInput.focus();
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
  formTitle.textContent = 'Agregar Producto';
  productForm.reset();
  stockInput.value = '0';
  allowNegativeInput.checked = true;
  updateStatus('Formulario limpio. Listo para agregar nuevo producto.');
  productNameInput.focus();
}

function updateStatus(msg) {
  productStatus.textContent = msg;
}

// Hacer funciones globales para los botones
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;

// Iniciar
init();
