// Variables globales
let promotions = JSON.parse(localStorage.getItem('ventamaestra_promotions')) || [];
let products = JSON.parse(localStorage.getItem('ventamaestra_products')) || [];
let editingPromoId = null;
let currentFilter = 'active';

// Referencias DOM
const promotionForm = document.getElementById('promotionForm');
const promoName = document.getElementById('promoName');
const promoType = document.getElementById('promoType');
const discountValue = document.getElementById('discountValue');
const specialPrice = document.getElementById('specialPrice');
const promoProduct = document.getElementById('promoProduct');
const promoFamily = document.getElementById('promoFamily');
const promoStartDate = document.getElementById('promoStartDate');
const promoEndDate = document.getElementById('promoEndDate');
const promoMinQty = document.getElementById('promoMinQty');
const promoActive = document.getElementById('promoActive');
const promoDescription = document.getElementById('promoDescription');
const btnCancelEdit = document.getElementById('btnCancelEdit');
const promotionsList = document.getElementById('promotionsList');
const searchPromo = document.getElementById('searchPromo');
const productsList = document.getElementById('productsList');

const filterActive = document.getElementById('filterActive');
const filterExpired = document.getElementById('filterExpired');
const filterAll = document.getElementById('filterAll');

// Event Listeners
promotionForm.addEventListener('submit', handleSavePromotion);
btnCancelEdit.addEventListener('click', cancelEdit);
searchPromo.addEventListener('input', renderPromotions);
promoType.addEventListener('change', handleTypeChange);

filterActive.addEventListener('click', () => {
  currentFilter = 'active';
  updateFilterButtons();
  renderPromotions();
});

filterExpired.addEventListener('click', () => {
  currentFilter = 'expired';
  updateFilterButtons();
  renderPromotions();
});

filterAll.addEventListener('click', () => {
  currentFilter = 'all';
  updateFilterButtons();
  renderPromotions();
});

// Inicialización
init();

function init() {
  loadProductsList();
  loadFamilies();
  renderPromotions();
  updateFilterButtons();
  
  // Establecer fecha actual como mínimo
  const today = new Date().toISOString().split('T')[0];
  promoStartDate.value = today;
  promoStartDate.min = today;
  promoEndDate.min = today;
}

function loadProductsList() {
  productsList.innerHTML = '';
  products.forEach(product => {
    const option = document.createElement('option');
    option.value = product.name;
    option.setAttribute('data-id', product.id);
    productsList.appendChild(option);
  });
}

function loadFamilies() {
  const families = [...new Set(products.map(p => p.family).filter(f => f))];
  promoFamily.innerHTML = '<option value="">Ninguna</option>';
  families.forEach(family => {
    const option = document.createElement('option');
    option.value = family;
    option.textContent = family;
    promoFamily.appendChild(option);
  });
}

function handleTypeChange() {
  const type = promoType.value;
  const discountGroup = document.getElementById('discountValueGroup');
  const priceGroup = document.getElementById('specialPriceGroup');
  
  discountGroup.style.display = 'none';
  priceGroup.style.display = 'none';
  discountValue.required = false;
  specialPrice.required = false;
  
  if (type === 'descuento_porcentaje' || type === 'descuento_fijo') {
    discountGroup.style.display = 'block';
    discountValue.required = true;
    discountValue.placeholder = type === 'descuento_porcentaje' ? 'Ej: 20 (20%)' : 'Ej: 50 ($50 de descuento)';
  } else if (type === 'precio_especial') {
    priceGroup.style.display = 'block';
    specialPrice.required = true;
  }
}

function handleSavePromotion(e) {
  e.preventDefault();
  
  const productId = getProductIdByName(promoProduct.value);
  
  const promotion = {
    id: editingPromoId || Date.now(),
    name: promoName.value.trim(),
    type: promoType.value,
    discountValue: parseFloat(discountValue.value) || 0,
    specialPrice: parseFloat(specialPrice.value) || 0,
    productId: productId,
    productName: promoProduct.value.trim(),
    family: promoFamily.value,
    startDate: promoStartDate.value,
    endDate: promoEndDate.value,
    minQty: parseInt(promoMinQty.value) || 1,
    active: promoActive.checked,
    description: promoDescription.value.trim(),
    createdAt: editingPromoId ? promotions.find(p => p.id === editingPromoId).createdAt : new Date().toISOString()
  };
  
  if (editingPromoId) {
    const index = promotions.findIndex(p => p.id === editingPromoId);
    promotions[index] = promotion;
    alert('Promoción actualizada correctamente.');
  } else {
    promotions.push(promotion);
    alert('Promoción registrada correctamente.');
  }
  
  localStorage.setItem('ventamaestra_promotions', JSON.stringify(promotions));
  resetForm();
  renderPromotions();
}

function getProductIdByName(name) {
  const product = products.find(p => p.name.toLowerCase() === name.toLowerCase());
  return product ? product.id : null;
}

function resetForm() {
  promotionForm.reset();
  editingPromoId = null;
  btnCancelEdit.style.display = 'none';
  promoActive.checked = true;
  handleTypeChange();
  
  const today = new Date().toISOString().split('T')[0];
  promoStartDate.value = today;
}

function cancelEdit() {
  resetForm();
}

function renderPromotions() {
  const query = searchPromo.value.toLowerCase();
  const today = new Date().toISOString().split('T')[0];
  
  let filtered = promotions.filter(promo => {
    const matchesSearch = promo.name.toLowerCase().includes(query) || 
                         promo.description.toLowerCase().includes(query) ||
                         promo.productName.toLowerCase().includes(query);
    
    if (!matchesSearch) return false;
    
    if (currentFilter === 'active') {
      return promo.active && promo.endDate >= today;
    } else if (currentFilter === 'expired') {
      return promo.endDate < today;
    }
    
    return true; // 'all'
  });
  
  if (filtered.length === 0) {
    promotionsList.innerHTML = '<p style="text-align: center; color: #777; padding: 20px;">No hay promociones registradas.</p>';
    return;
  }
  
  promotionsList.innerHTML = filtered.map(promo => {
    const isExpired = promo.endDate < today;
    const typeLabel = getTypeLabel(promo.type);
    const valueDisplay = getValueDisplay(promo);
    
    return `
      <div class="promo-card" style="background: ${isExpired ? '#f5f5f5' : '#fff'}; border: 2px solid ${promo.active && !isExpired ? '#4caf50' : '#e0e0e0'}; border-radius: 8px; padding: 15px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
          <div>
            <h4 style="margin: 0 0 5px 0; color: ${isExpired ? '#999' : '#333'};">
              ${promo.name}
              ${promo.active && !isExpired ? '<span style="background: #4caf50; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; margin-left: 8px;">ACTIVA</span>' : ''}
              ${isExpired ? '<span style="background: #f44336; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; margin-left: 8px;">VENCIDA</span>' : ''}
            </h4>
            <p style="margin: 0; font-size: 0.85rem; color: #666;">
              <strong>${typeLabel}</strong> ${valueDisplay}
            </p>
          </div>
          <div style="display: flex; gap: 6px;">
            <button class="cmd-btn" onclick="editPromotion(${promo.id})" style="padding: 6px 10px; font-size: 0.8rem;">✏️</button>
            <button class="cmd-btn cmd-danger" onclick="deletePromotion(${promo.id})" style="padding: 6px 10px; font-size: 0.8rem;">🗑️</button>
          </div>
        </div>
        
        <div style="font-size: 0.85rem; color: #555; margin-bottom: 8px;">
          ${promo.productName ? `<p style="margin: 4px 0;">📦 Producto: <strong>${promo.productName}</strong></p>` : ''}
          ${promo.family ? `<p style="margin: 4px 0;">📂 Familia: <strong>${promo.family}</strong></p>` : ''}
          <p style="margin: 4px 0;">📅 Válida: <strong>${formatDate(promo.startDate)}</strong> al <strong>${formatDate(promo.endDate)}</strong></p>
          <p style="margin: 4px 0;">🔢 Cantidad mínima: <strong>${promo.minQty}</strong></p>
        </div>
        
        ${promo.description ? `<p style="font-size: 0.85rem; color: #777; margin: 8px 0 0 0; padding: 8px; background: #f9f9f9; border-radius: 4px;">${promo.description}</p>` : ''}
      </div>
    `;
  }).join('');
}

function getTypeLabel(type) {
  const labels = {
    'descuento_porcentaje': 'Descuento %',
    'descuento_fijo': 'Descuento Fijo',
    '2x1': '2x1',
    '3x2': '3x2',
    'precio_especial': 'Precio Especial'
  };
  return labels[type] || type;
}

function getValueDisplay(promo) {
  switch(promo.type) {
    case 'descuento_porcentaje':
      return `<span style="color: #ff7b1a; font-weight: bold;">${promo.discountValue}% OFF</span>`;
    case 'descuento_fijo':
      return `<span style="color: #ff7b1a; font-weight: bold;">-$${promo.discountValue.toFixed(2)}</span>`;
    case 'precio_especial':
      return `<span style="color: #ff7b1a; font-weight: bold;">$${promo.specialPrice.toFixed(2)}</span>`;
    case '2x1':
      return '<span style="color: #ff7b1a; font-weight: bold;">Lleva 2 Paga 1</span>';
    case '3x2':
      return '<span style="color: #ff7b1a; font-weight: bold;">Lleva 3 Paga 2</span>';
    default:
      return '';
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function updateFilterButtons() {
  filterActive.style.background = currentFilter === 'active' ? 'var(--orange)' : '#eeeeee';
  filterActive.style.color = currentFilter === 'active' ? '#fff' : '#333';
  
  filterExpired.style.background = currentFilter === 'expired' ? 'var(--orange)' : '#eeeeee';
  filterExpired.style.color = currentFilter === 'expired' ? '#fff' : '#333';
  
  filterAll.style.background = currentFilter === 'all' ? 'var(--orange)' : '#eeeeee';
  filterAll.style.color = currentFilter === 'all' ? '#fff' : '#333';
}

window.editPromotion = function(id) {
  const promo = promotions.find(p => p.id === id);
  if (!promo) return;
  
  editingPromoId = id;
  promoName.value = promo.name;
  promoType.value = promo.type;
  discountValue.value = promo.discountValue || '';
  specialPrice.value = promo.specialPrice || '';
  promoProduct.value = promo.productName || '';
  promoFamily.value = promo.family || '';
  promoStartDate.value = promo.startDate;
  promoEndDate.value = promo.endDate;
  promoMinQty.value = promo.minQty;
  promoActive.checked = promo.active;
  promoDescription.value = promo.description;
  
  handleTypeChange();
  btnCancelEdit.style.display = 'block';
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deletePromotion = function(id) {
  if (!confirm('¿Eliminar esta promoción?')) return;
  
  promotions = promotions.filter(p => p.id !== id);
  localStorage.setItem('ventamaestra_promotions', JSON.stringify(promotions));
  renderPromotions();
};
