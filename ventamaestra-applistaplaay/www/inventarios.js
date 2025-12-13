// Cargar productos desde localStorage
let productDatabase = JSON.parse(localStorage.getItem('ventamaestra_products')) || [];

// Elementos del DOM
const searchInventory = document.getElementById('searchInventory');
const filterStock = document.getElementById('filterStock');
const inventoryTableBody = document.querySelector('#inventoryTable tbody');
const inventoryFooter = document.getElementById('inventoryFooter');
const inventoryStatus = document.getElementById('inventoryStatus');

const totalProductsEl = document.getElementById('totalProducts');
const totalInvestmentEl = document.getElementById('totalInvestment');
const totalSaleValueEl = document.getElementById('totalSaleValue');
const totalProfitEl = document.getElementById('totalProfit');
const profitMarginEl = document.getElementById('profitMargin');

// Inicializar
function init() {
  loadInventory();
  attachEvents();
  updateSummary();
}

function attachEvents() {
  searchInventory.addEventListener('input', loadInventory);
  filterStock.addEventListener('change', loadInventory);
  
  // Actualizar cuando cambien productos
  setInterval(() => {
    const lastUpdate = localStorage.getItem('ventamaestra_products_updated');
    if (lastUpdate && lastUpdate !== window.lastInventoryUpdate) {
      window.lastInventoryUpdate = lastUpdate;
      productDatabase = JSON.parse(localStorage.getItem('ventamaestra_products')) || [];
      loadInventory();
      updateSummary();
    }
  }, 1000);
}

function loadInventory() {
  const searchQuery = searchInventory.value.toLowerCase().trim();
  const stockFilter = filterStock.value;
  
  let filtered = productDatabase;
  
  // Filtro de búsqueda
  if (searchQuery) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(searchQuery) ||
      (p.barcode && p.barcode.toLowerCase().includes(searchQuery)) ||
      (p.family && p.family.toLowerCase().includes(searchQuery))
    );
  }
  
  // Filtro de stock
  if (stockFilter === 'low') {
    filtered = filtered.filter(p => p.stock > 0 && p.stock < 5);
  } else if (stockFilter === 'zero') {
    filtered = filtered.filter(p => p.stock === 0);
  } else if (stockFilter === 'negative') {
    filtered = filtered.filter(p => p.stock < 0);
  }
  
  renderInventoryTable(filtered);
  updateStatus(filtered.length);
}

function renderInventoryTable(products) {
  inventoryTableBody.innerHTML = '';
  
  let totalInvestment = 0;
  let totalSaleValue = 0;
  let totalProfit = 0;
  
  products.forEach(product => {
    const purchasePrice = product.purchasePrice || 0;
    const salePrice = product.salePrice || 0;
    const stock = product.stock || 0;
    
    const investment = purchasePrice * stock;
    const saleValue = salePrice * stock;
    const profit = saleValue - investment;
    const margin = salePrice > 0 ? ((profit / saleValue) * 100) : 0;
    
    totalInvestment += investment;
    totalSaleValue += saleValue;
    totalProfit += profit;
    
    const tr = document.createElement('tr');
    
    // Clase para stock
    let stockClass = 'stock-ok';
    if (stock < 0) stockClass = 'stock-zero';
    else if (stock === 0) stockClass = 'stock-zero';
    else if (stock < 5) stockClass = 'stock-low';
    
    // Clase para ganancia
    const profitClass = profit >= 0 ? 'profit-positive' : 'profit-negative';
    
    tr.innerHTML = `
      <td>${product.barcode || '—'}</td>
      <td><strong>${product.name}</strong></td>
      <td>${product.family || '—'}</td>
      <td>${getUnitLabel(product.unitType)}</td>
      <td><span class="stock-tag ${stockClass}">${stock}</span></td>
      <td>$${purchasePrice.toFixed(2)}</td>
      <td>$${salePrice.toFixed(2)}</td>
      <td>$${investment.toFixed(2)}</td>
      <td>$${saleValue.toFixed(2)}</td>
      <td class="${profitClass}">$${profit.toFixed(2)}</td>
      <td>${margin.toFixed(1)}%</td>
    `;
    
    inventoryTableBody.appendChild(tr);
  });
  
  // Renderizar totales en el footer
  renderFooter(totalInvestment, totalSaleValue, totalProfit);
}

function renderFooter(investment, saleValue, profit) {
  const profitClass = profit >= 0 ? 'profit-positive' : 'profit-negative';
  const margin = saleValue > 0 ? ((profit / saleValue) * 100) : 0;
  
  inventoryFooter.innerHTML = `
    <tr style="font-weight: bold; background: #f5f5f5;">
      <td colspan="7" style="text-align: right;">TOTALES:</td>
      <td>$${investment.toFixed(2)}</td>
      <td>$${saleValue.toFixed(2)}</td>
      <td class="${profitClass}">$${profit.toFixed(2)}</td>
      <td>${margin.toFixed(1)}%</td>
    </tr>
  `;
}

function updateSummary() {
  const totalProducts = productDatabase.length;
  
  let totalInvestment = 0;
  let totalSaleValue = 0;
  
  productDatabase.forEach(product => {
    const purchasePrice = product.purchasePrice || 0;
    const salePrice = product.salePrice || 0;
    const stock = product.stock || 0;
    
    totalInvestment += purchasePrice * stock;
    totalSaleValue += salePrice * stock;
  });
  
  const totalProfit = totalSaleValue - totalInvestment;
  const profitMargin = totalSaleValue > 0 ? ((totalProfit / totalSaleValue) * 100) : 0;
  
  totalProductsEl.textContent = totalProducts;
  totalInvestmentEl.textContent = `$${totalInvestment.toFixed(2)}`;
  totalSaleValueEl.textContent = `$${totalSaleValue.toFixed(2)}`;
  totalProfitEl.textContent = `$${totalProfit.toFixed(2)}`;
  profitMarginEl.textContent = `${profitMargin.toFixed(1)}% margen`;
  
  // Color de la ganancia
  if (totalProfit >= 0) {
    totalProfitEl.style.color = '#2e7d32';
  } else {
    totalProfitEl.style.color = '#e53935';
  }
}

function updateStatus(count) {
  if (count === productDatabase.length) {
    inventoryStatus.textContent = `Mostrando ${count} producto(s) en inventario.`;
  } else {
    inventoryStatus.textContent = `Mostrando ${count} de ${productDatabase.length} producto(s).`;
  }
}

function getUnitLabel(unitType) {
  const labels = {
    'pieza': 'Pza',
    'kilo': 'Kg',
    'granel': 'Granel',
    'litro': 'L'
  };
  return labels[unitType] || 'Pza';
}

// Iniciar
init();
