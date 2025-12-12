// Datos de ejemplo

const products = JSON.parse(localStorage.getItem('ventamaestra_products')) || [
  { id: 1, name: "Refresco 600ml", price: 18, cost: 10, stock: 25, allowNegative: true },
  { id: 2, name: "Papas fritas 45g", price: 14, cost: 7, stock: 8, allowNegative: true },
  { id: 3, name: "Pan de caja", price: 42, cost: 25, stock: 4, allowNegative: false },
  { id: 4, name: "Detergente 1L", price: 55, cost: 30, stock: 2, allowNegative: true },
  { id: 5, name: "Medicamento X 10pz", price: 120, cost: 70, stock: 0, allowNegative: true },
  { id: 6, name: "Aceite comestible 1L", price: 48, cost: 30, stock: 12, allowNegative: true }
];

// Sincronizar con localStorage cada vez que cargue
function syncProductsFromStorage() {
  const stored = JSON.parse(localStorage.getItem('ventamaestra_products'));
  if (stored && stored.length > 0) {
    products.length = 0;
    stored.forEach(p => {
      products.push({
        id: p.id,
        name: p.name,
        price: p.salePrice || p.price,
        cost: p.purchasePrice || p.cost,
        stock: p.stock,
        allowNegative: p.allowNegative !== undefined ? p.allowNegative : true,
        barcode: p.barcode,
        family: p.family,
        wholesalePrice: p.wholesalePrice,
        wholesaleQty: p.wholesaleQty,
        unitType: p.unitType || 'pieza'
      });
    });
  }
}

const deliveryOrders = [
  {
    id: "PED-1001",
    customer: "Luis Martínez",
    address: "Calle 1 #123",
    total: 132,
    status: "Pendiente"
  },
  {
    id: "PED-1002",
    customer: "Farmacia Centro",
    address: "Av. Salud #45",
    total: 240,
    status: "Preparando"
  }
];

let currentSale = [];
let totalSalesAmount = 0;
let totalTickets = 0;
let lastCashCut = null;
let salesHistory = JSON.parse(localStorage.getItem('ventamaestra_sales_history')) || [];
let cashWithdrawals = JSON.parse(localStorage.getItem('ventamaestra_withdrawals')) || [];
let pausedSales = JSON.parse(localStorage.getItem('ventamaestra_paused_sales')) || [];
let promotions = JSON.parse(localStorage.getItem('ventamaestra_promotions')) || [];
let currentUser = JSON.parse(localStorage.getItem('ventamaestra_current_user')) || null;

// Verificar licencia al iniciar
function checkLicenseOnStartup() {
  // Por ahora, simplemente retornar true para que funcione todo
  return true;
}

// Mostrar banner con cuenta regresiva
function showLicenseBanner(status) {
  const banner = document.getElementById('licenseBanner');
  if (!banner) return;
  
  if (status.type === 'TRIAL') {
    if (status.daysRemaining <= 7) {
      banner.style.display = 'block';
      banner.style.background = status.daysRemaining <= 3 ? '#f8d7da' : '#fff3cd';
      banner.style.borderBottom = status.daysRemaining <= 3 ? '3px solid #dc3545' : '3px solid #ffc107';
      banner.style.color = status.daysRemaining <= 3 ? '#721c24' : '#856404';
      
      const icon = status.daysRemaining <= 3 ? '⚠️' : '⏰';
      const plural = status.daysRemaining === 1 ? 'día' : 'días';
      
      banner.innerHTML = `${icon} <strong>PRUEBA GRATUITA:</strong> Te quedan <strong>${status.daysRemaining} ${plural}</strong> restantes. ` +
                         `<a href="licencias.html" style="color: #ff6600; text-decoration: underline; margin-left: 10px;">Activar licencia completa</a>`;
    }
  } else if (status.type === 'FULL' && status.daysRemaining <= 30) {
    banner.style.display = 'block';
    banner.style.background = '#d1ecf1';
    banner.style.borderBottom = '3px solid #17a2b8';
    banner.style.color = '#0c5460';
    
    const plural = status.daysRemaining === 1 ? 'día' : 'días';
    banner.innerHTML = `ℹ️ Tu licencia vence en <strong>${status.daysRemaining} ${plural}</strong>. ` +
                       `<a href="licencias.html" style="color: #17a2b8; text-decoration: underline; margin-left: 10px;">Renovar ahora</a>`;
  }
}

// Elementos del DOM

const searchInput = document.getElementById("searchInput");
const productList = document.getElementById("productList");
const saleItems = document.getElementById("saleItems");
const totalAmountEl = document.getElementById("totalAmount");
const stockInfoEl = document.getElementById("stockInfo");
const statusPanel = document.getElementById("statusPanel");

const productNameInput = document.getElementById("productNameInput");
const quantityInput = document.getElementById("quantityInput");
const priceInput = document.getElementById("priceInput");
const addToSaleBtn = document.getElementById("addToSaleBtn");

const btnCharge = document.getElementById("btnCharge");
const btnGoPos = document.getElementById("btnGoPos");
const btnCancelNote = document.getElementById("btnCancelNote");
const btnSearchSale = document.getElementById("btnSearchSale");
const btnPauseSale = document.getElementById("btnPauseSale");
const btnStockAdjust = document.getElementById("btnStockAdjust");
const btnWithdrawal = document.getElementById("btnWithdrawal");
const btnCut = document.getElementById("btnCut");

const deliveryPanel = document.getElementById("deliveryPanel");
const deliveryToggle = document.getElementById("deliveryToggle");
const closeDelivery = document.getElementById("closeDelivery");
const deliveryList = document.getElementById("deliveryList");
const deliveryCount = document.getElementById("deliveryCount");

const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");
const modalOk = document.getElementById("modalOk");

// Inicialización

function init() {
  // Verificar licencia antes de iniciar
  if (!checkLicenseOnStartup()) {
    return;
  }
  
  syncProductsFromStorage();
  renderProducts(products);
  renderDeliveryList();
  deliveryCount.textContent = deliveryOrders.length;
  attachEvents();
  updateTotal();
  loadCurrentUser();
  setStatus("Listo. Usa F2 para buscar, F9 para cobrar, F8 retiro, F10 corte, F11 pedidos.");
  
  // Revisar actualizaciones de productos cada segundo
  setInterval(() => {
    const lastUpdate = localStorage.getItem('ventamaestra_products_updated');
    if (lastUpdate && lastUpdate !== window.lastProductUpdate) {
      window.lastProductUpdate = lastUpdate;
      syncProductsFromStorage();
      renderProducts(products);
      setStatus("Productos actualizados desde gestión.");
    }
  }, 1000);
}

function loadCurrentUser() {
  currentUser = JSON.parse(localStorage.getItem('ventamaestra_current_user'));
  if (!currentUser) {
    // Usuario por defecto si no hay sesión
    currentUser = {
      id: 0,
      name: 'Usuario',
      role: 'owner',
      permissions: {}
    };
  }
  
  // Actualizar nombre en UI
  const userNameEl = document.getElementById('currentUserName');
  if (userNameEl) {
    userNameEl.textContent = `Cajero: ${currentUser.name}`;
  }
}

function logout() {
  if (confirm('¿Cerrar sesión?')) {
    window.location.href = 'login.html';
  }
}

window.logout = logout;

function registerKardexMovement(productId, type, reason, quantity, reference = '') {
  let kardexMovements = JSON.parse(localStorage.getItem('ventamaestra_kardex')) || [];
  const products = JSON.parse(localStorage.getItem('ventamaestra_products')) || [];
  const product = products.find(p => p.id === productId);
  
  if (!product) return;
  
  const previousStock = product.stock;
  const movement = {
    id: Date.now() + Math.random(),
    productId: productId,
    productName: product.name,
    type: type,
    reason: reason,
    quantity: quantity,
    previousStock: previousStock,
    newStock: type === 'entry' ? previousStock + quantity : previousStock - quantity,
    unitCost: product.cost || 0,
    date: new Date().toISOString(),
    user: currentUser ? currentUser.name : 'Sistema',
    reference: reference
  };
  
  kardexMovements.push(movement);
  localStorage.setItem('ventamaestra_kardex', JSON.stringify(kardexMovements));
}

function hasPermission(permission) {
  if (!currentUser) return false;
  
  // Dueño y admin tienen todos los permisos
  if (currentUser.role === 'owner' || currentUser.role === 'admin') {
    return true;
  }
  
  // Verificar permiso específico
  return currentUser.permissions && currentUser.permissions[permission] === true;
}

function checkPermission(permission, actionName) {
  if (!hasPermission(permission)) {
    alert(`No tienes permiso para: ${actionName}\nContacta al administrador.`);
    return false;
  }
  return true;
}

function attachEvents() {
  searchInput.addEventListener("input", handleSearch);
  searchInput.addEventListener("keydown", handleSearchKeyDown);

  quantityInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addProductFromForm();
    }
  });

  priceInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addProductFromForm();
    }
  });
  
  priceInput.addEventListener("focus", () => {
    if (selectedProduct && priceInput.value !== selectedProduct.price.toFixed(2)) {
      if (!hasPermission('permModifyPrice')) {
        setStatus("⚠️ No tienes permiso para modificar precios.");
      }
    }
  });

  addToSaleBtn.addEventListener("click", addProductFromForm);

  btnCharge.addEventListener("click", handleCharge);
  btnGoPos.addEventListener("click", () => setStatus("Ya estás en Punto de Venta (F5)."));
  btnCancelNote.addEventListener("click", handleCancelNote);
  btnSearchSale.addEventListener("click", handleSearchSale);
  btnPauseSale.addEventListener("click", handlePauseSale);
  btnStockAdjust.addEventListener("click", handleStockAdjust);
  btnWithdrawal.addEventListener("click", handleWithdrawal);
  btnCut.addEventListener("click", handleCashCut);

  deliveryToggle.addEventListener("click", toggleDeliveryPanel);
  closeDelivery.addEventListener("click", toggleDeliveryPanel);

  modalClose.addEventListener("click", closeModal);
  modalOk.addEventListener("click", closeModal);

  document.addEventListener("keydown", handleKeyShortcuts);
}

function addProductFromForm() {
  if (!selectedProduct) {
    setStatus("Primero selecciona un producto con F2.");
    searchInput.focus();
    return;
  }

  const qty = parseFloat(quantityInput.value) || 1;
  const pricePerUnit = parseFloat(priceInput.value) || selectedProduct.price;
  
  // Verificar si se modificó el precio
  if (Math.abs(pricePerUnit - selectedProduct.price) > 0.01) {
    if (!hasPermission('permModifyPrice')) {
      alert('No tienes permiso para modificar precios. Contacta al administrador.');
      priceInput.value = selectedProduct.price.toFixed(2);
      return;
    }
  }
  
  // Calcular precio total según la cantidad (para kilos/granel)
  const finalPrice = pricePerUnit;

  const existing = currentSale.find((item) => item.id === selectedProduct.id);
  if (existing) {
    existing.qty += qty;
  } else {
    currentSale.push({ ...selectedProduct, qty, price: finalPrice });
  }

  // Aplicar promociones automáticamente
  applyPromotionsToSale();

  renderSale();
  updateTotal();
  
  // Mensaje con cantidad formateada
  const qtyDisplay = (selectedProduct.unitType === 'kilo' || selectedProduct.unitType === 'granel') 
    ? `${qty.toFixed(3)}kg` 
    : `x${qty}`;
  setStatus(`"${selectedProduct.name}" ${qtyDisplay} agregado a la venta.`);

  // Limpiar formulario
  selectedProduct = null;
  productNameInput.value = "";
  quantityInput.value = "1";
  quantityInput.step = "1";
  priceInput.value = "";

  // Volver a F2
  setTimeout(() => {
    searchInput.focus();
  }, 100);
}

function renderProducts(list) {
  productList.innerHTML = "";
  list.forEach((p, index) => {
    const li = document.createElement("li");
    li.className = "product-item";
    li.dataset.id = p.id;

    const left = document.createElement("div");
    const right = document.createElement("div");

    left.className = "product-name";
    left.textContent = p.name;

    const meta = document.createElement("div");
    meta.className = "product-meta";
    meta.textContent = `Precio: $${p.price.toFixed(2)}`;

    const stockTag = document.createElement("span");
    stockTag.className = "stock-tag";
    if (p.stock === 0) {
      stockTag.classList.add("stock-zero");
      stockTag.textContent = "Agotado";
    } else if (p.stock < 5) {
      stockTag.classList.add("stock-low");
      stockTag.textContent = `Stock: ${p.stock}`;
    } else {
      stockTag.classList.add("stock-ok");
      stockTag.textContent = `Stock: ${p.stock}`;
    }

    right.className = "product-price";
    right.textContent = `$${p.price.toFixed(2)}`;
    right.appendChild(stockTag);

    li.appendChild(left);
    li.appendChild(meta);
    li.appendChild(right);

    li.addEventListener("click", () => selectProductForSale(p));
    
    // Resaltar el producto seleccionado
    if (index === selectedProductIndex) {
      li.style.background = "#ffe0b2";
    }
    
    productList.appendChild(li);
  });
}

let selectedProductIndex = -1;
let selectedProduct = null;

function handleSearch() {
  const query = searchInput.value.toLowerCase().trim();
  if (query === "") {
    renderProducts(products);
    selectedProductIndex = -1;
    return;
  }
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(query)
  );
  renderProducts(filtered);
  selectedProductIndex = filtered.length > 0 ? 0 : -1;
  highlightSelectedProduct();
}

function handleSearchKeyDown(e) {
  const visibleItems = Array.from(productList.querySelectorAll(".product-item"));
  
  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (visibleItems.length > 0) {
      selectedProductIndex = Math.min(selectedProductIndex + 1, visibleItems.length - 1);
      highlightSelectedProduct();
    }
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (visibleItems.length > 0) {
      selectedProductIndex = Math.max(selectedProductIndex - 1, 0);
      highlightSelectedProduct();
    }
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (visibleItems.length > 0 && selectedProductIndex >= 0) {
      const selectedItem = visibleItems[selectedProductIndex];
      const prodId = selectedItem.dataset.id;
      const prod = products.find((p) => p.id == prodId);
      if (prod) {
        selectProductForSale(prod);
      }
    }
  }
}

function selectProductForSale(product) {
  // Verificar si se puede vender sin stock
  if (product.stock <= 0 && !product.allowNegative) {
    setStatus(`⚠️ "${product.name}" sin stock y no permite venta en negativo.`);
    return;
  }
  
  selectedProduct = product;
  productNameInput.value = product.name;
  priceInput.value = product.price.toFixed(2);
  
  // Si es por kilo o granel, sugerir cantidad decimal
  if (product.unitType === 'kilo' || product.unitType === 'granel') {
    quantityInput.value = "1.000";
    quantityInput.step = "0.001";
  } else {
    quantityInput.value = "1";
    quantityInput.step = "1";
  }
  
  searchInput.value = "";
  renderProducts(products);
  selectedProductIndex = -1;
  
  // Enfocar en cantidad
  setTimeout(() => {
    quantityInput.focus();
    quantityInput.select();
  }, 100);
  
  const stockWarning = product.stock <= 0 ? " ⚠️ Stock en cero - venta en negativo permitida" : "";
  const unitInfo = product.unitType === 'kilo' || product.unitType === 'granel' ? ` (Precio por ${product.unitType})` : "";
  setStatus(`Producto seleccionado: ${product.name}${unitInfo}. Ingresa cantidad y presiona Enter.${stockWarning}`);
  updateStockInfo(product);
}

function highlightSelectedProduct() {
  const visibleItems = Array.from(productList.querySelectorAll(".product-item"));
  visibleItems.forEach((item, idx) => {
    if (idx === selectedProductIndex) {
      item.style.background = "#ffe0b2";
      item.scrollIntoView({ block: "nearest", behavior: "smooth" });
    } else {
      item.style.background = "";
    }
  });
}

function addToSale(product) {
  const existing = currentSale.find((item) => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    currentSale.push({ ...product, qty: 1 });
  }
  
  // Aplicar promociones automáticamente
  applyPromotionsToSale();
  
  renderSale();
  updateTotal();
  setStatus(`"${product.name}" agregado a la venta.`);
  updateStockInfo(product);
}

function applyPromotionsToSale() {
  const today = new Date().toISOString().split('T')[0];
  
  // Recargar promociones por si hubo cambios
  promotions = JSON.parse(localStorage.getItem('ventamaestra_promotions')) || [];
  
  currentSale.forEach(item => {
    // Resetear precio original
    const originalProduct = getProductFromStorage(item.id);
    if (originalProduct) {
      item.price = originalProduct.price;
      item.originalPrice = originalProduct.price;
      item.promotion = null;
    }
    
    // Buscar promociones aplicables
    const applicablePromos = promotions.filter(promo => {
      if (!promo.active) return false;
      if (promo.endDate < today) return false;
      if (item.qty < promo.minQty) return false;
      
      // Verificar si aplica al producto o familia
      if (promo.productId && promo.productId === item.id) return true;
      if (promo.family && promo.family === item.family) return true;
      
      return false;
    });
    
    // Aplicar la mejor promoción
    if (applicablePromos.length > 0) {
      const bestPromo = getBestPromotion(applicablePromos, item);
      if (bestPromo) {
        applyPromotionToItem(item, bestPromo);
      }
    }
  });
}

function getProductFromStorage(id) {
  const products = JSON.parse(localStorage.getItem('ventamaestra_products')) || [];
  return products.find(p => p.id === id);
}

function getBestPromotion(promos, item) {
  let bestPromo = null;
  let bestDiscount = 0;
  
  promos.forEach(promo => {
    const discount = calculatePromoDiscount(promo, item);
    if (discount > bestDiscount) {
      bestDiscount = discount;
      bestPromo = promo;
    }
  });
  
  return bestPromo;
}

function calculatePromoDiscount(promo, item) {
  const originalTotal = item.originalPrice * item.qty;
  
  switch(promo.type) {
    case 'descuento_porcentaje':
      return originalTotal * (promo.discountValue / 100);
    case 'descuento_fijo':
      return promo.discountValue;
    case 'precio_especial':
      return originalTotal - (promo.specialPrice * item.qty);
    case '2x1':
      return item.originalPrice * Math.floor(item.qty / 2);
    case '3x2':
      return item.originalPrice * Math.floor(item.qty / 3);
    default:
      return 0;
  }
}

function applyPromotionToItem(item, promo) {
  switch(promo.type) {
    case 'descuento_porcentaje':
      item.price = item.originalPrice * (1 - promo.discountValue / 100);
      break;
    case 'descuento_fijo':
      const totalDiscount = promo.discountValue / item.qty;
      item.price = Math.max(0, item.originalPrice - totalDiscount);
      break;
    case 'precio_especial':
      item.price = promo.specialPrice;
      break;
    case '2x1':
      const free2x1 = Math.floor(item.qty / 2);
      item.price = (item.originalPrice * (item.qty - free2x1)) / item.qty;
      break;
    case '3x2':
      const free3x2 = Math.floor(item.qty / 3);
      item.price = (item.originalPrice * (item.qty - free3x2)) / item.qty;
      break;
  }
  
  item.promotion = {
    name: promo.name,
    type: promo.type,
    saved: item.originalPrice * item.qty - item.price * item.qty
  };
}

function renderSale() {
  saleItems.innerHTML = "";
  currentSale.forEach((item, idx) => {
    const qtyDisplay = (item.unitType === 'kilo' || item.unitType === 'granel') 
      ? `${item.qty.toFixed(3)}kg` 
      : item.qty;
    
    const hasPromo = item.promotion && item.promotion.saved > 0;
    const promoTag = hasPromo ? `<span style="background: #4caf50; color: white; font-size: 0.7rem; padding: 2px 5px; border-radius: 3px; margin-left: 5px;">🎁 ${item.promotion.name}</span>` : '';
    const originalPriceDisplay = hasPromo ? `<small style="text-decoration: line-through; color: #999;">$${item.originalPrice.toFixed(2)}</small> ` : '';
    const savedDisplay = hasPromo ? `<small style="color: #4caf50;">Ahorro: $${item.promotion.saved.toFixed(2)}</small>` : '';
    
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        ${item.name}${promoTag}
        ${hasPromo ? `<br>${savedDisplay}` : ''}
      </td>
      <td>${qtyDisplay}</td>
      <td>${originalPriceDisplay}$${item.price.toFixed(2)}</td>
      <td>$${(item.price * item.qty).toFixed(2)}</td>
      <td><button class="remove-btn" data-idx="${idx}">×</button></td>
    `;
    saleItems.appendChild(tr);
  });

  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = e.target.dataset.idx;
      currentSale.splice(idx, 1);
      renderSale();
      updateTotal();
      setStatus("Artículo eliminado.");
    });
  });
}

function updateTotal() {
  const total = currentSale.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalSavings = currentSale.reduce((sum, item) => {
    return sum + (item.promotion ? item.promotion.saved : 0);
  }, 0);
  
  let display = `$${total.toFixed(2)}`;
  if (totalSavings > 0) {
    display += ` <small style="color: #4caf50;">(Ahorro: $${totalSavings.toFixed(2)})</small>`;
  }
  
  totalAmountEl.innerHTML = display;
}

function updateStockInfo(product) {
  stockInfoEl.textContent = `${product.name}: ${product.stock} unidades`;
}

function setStatus(msg) {
  statusPanel.textContent = msg;
}

function handleCharge() {
  if (currentSale.length === 0) {
    showModal("Cobrar", "No hay artículos en la venta.");
    return;
  }
  const total = currentSale.reduce((sum, item) => sum + item.price * item.qty, 0);
  
  // Crear formulario de cobro
  const formHtml = `
    <div style="margin-bottom: 15px;">
      <strong>Total a cobrar: $${total.toFixed(2)}</strong>
    </div>
    <div style="margin-bottom: 10px;">
      <label style="display: block; margin-bottom: 5px; font-size: 0.9rem;">Forma de pago:</label>
                <select id="paymentMethod" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #e0e0e0; font-size: 0.9rem;">
        <option value="efectivo">Efectivo</option>
        <option value="tarjeta">Tarjeta</option>
        <option value="credito">Crédito</option>
        <option value="cortesia">Cortesía</option>
      </select>
    </div>
    <div style="margin-bottom: 10px;">
      <label style="display: block; margin-bottom: 5px; font-size: 0.9rem;">Monto recibido (opcional):</label>
      <input type="number" id="amountReceived" placeholder="${total.toFixed(2)}" step="0.01" 
             style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #e0e0e0; font-size: 0.9rem;">
      <small style="color: #777;">Deja vacío o presiona Enter para cobrar exacto</small>
    </div>
    <div id="changeDisplay" style="margin-top: 10px; padding: 10px; background: #f5f5f5; border-radius: 6px; display: none;">
      <strong>Cambio: $<span id="changeAmount">0.00</span></strong>
    </div>
  `;
  
  showModal("Cobrar venta (F9)", formHtml);
  
  const paymentMethodEl = document.getElementById("paymentMethod");
  const amountReceivedEl = document.getElementById("amountReceived");
  const changeDisplayEl = document.getElementById("changeDisplay");
  const changeAmountEl = document.getElementById("changeAmount");
  
  // Calcular cambio en tiempo real
  amountReceivedEl.addEventListener("input", () => {
    const received = parseFloat(amountReceivedEl.value) || 0;
    if (received > 0 && received >= total) {
      const change = received - total;
      changeAmountEl.textContent = change.toFixed(2);
      changeDisplayEl.style.display = "block";
    } else {
      changeDisplayEl.style.display = "none";
    }
  });
  
  // Enter en el input de monto
  amountReceivedEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      confirmSale();
    }
  });
  
  // Enter en el select de forma de pago
  paymentMethodEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      amountReceivedEl.focus();
    }
  });
  
  // Enter en el botón de modal
  document.addEventListener("keydown", function modalKeyHandler(e) {
    if (e.key === "Enter" && modalOverlay.classList.contains("open")) {
      const activeElement = document.activeElement;
      // Si no está en ningún input del modal, ejecutar confirmSale
      if (activeElement !== paymentMethodEl && activeElement !== amountReceivedEl) {
        e.preventDefault();
        confirmSale();
        document.removeEventListener("keydown", modalKeyHandler);
      }
    }
  });
  
  // Enfocar automáticamente en forma de pago
  setTimeout(() => {
    paymentMethodEl.focus();
  }, 100);
  
  function confirmSale() {
    const paymentMethod = paymentMethodEl.value;
    const received = parseFloat(amountReceivedEl.value) || total;
    const change = received - total;
    
    // Verificar permiso para cortesía
    if (paymentMethod === 'cortesia' && !hasPermission('permGiveCourtesy')) {
      alert('No tienes permiso para dar cortesías. Contacta al administrador.');
      return;
    }
    
    if (received < total) {
      alert("El monto recibido es menor al total.");
      return;
    }
    
    // Registrar venta en historial
    const sale = {
      id: Date.now(),
      date: new Date().toISOString(),
      items: JSON.parse(JSON.stringify(currentSale)),
      total: total,
      paymentMethod: paymentMethod,
      received: received,
      change: change
    };
    
    salesHistory.push(sale);
    localStorage.setItem('ventamaestra_sales_history', JSON.stringify(salesHistory));
    
    // Registrar movimientos en kárdex
    currentSale.forEach(item => {
      registerKardexMovement(item.id, 'exit', 'sale', item.qty, `Venta #${sale.id}`);
    });
    
    totalSalesAmount += total;
    totalTickets += 1;
    
    let message = `Venta cobrada: $${total.toFixed(2)}<br>`;
    message += `Forma de pago: ${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}<br>`;
    if (received > total) {
      message += `Recibido: $${received.toFixed(2)}<br>`;
      message += `Cambio: $${change.toFixed(2)}<br>`;
    }
    message += `<br>Total acumulado: $${totalSalesAmount.toFixed(2)}`;
    
    currentSale = [];
    renderSale();
    updateTotal();
    
    closeModal();
    showModal("Venta completada", message);
    
    setStatus(`Venta registrada. Total: $${total.toFixed(2)}`);
    
    // Después de cerrar el modal, volver a F2
    modalOk.onclick = () => {
      closeModal();
      setTimeout(() => searchInput.focus(), 100);
    };
    
    // Permitir Enter para cerrar el modal de confirmación
    setTimeout(() => {
      const enterHandler = (e) => {
        if (e.key === "Enter" && modalOverlay.classList.contains("open")) {
          e.preventDefault();
          closeModal();
          setTimeout(() => searchInput.focus(), 100);
          document.removeEventListener("keydown", enterHandler);
        }
      };
      document.addEventListener("keydown", enterHandler);
    }, 150);
  }
  
  modalOk.onclick = confirmSale;
}

function handleCancelSale() {
  if (currentSale.length === 0) {
    setStatus("No hay venta para cancelar.");
    return;
  }
  showModal("Cancelar venta", "¿Seguro que deseas cancelar esta venta?");
  modalOk.onclick = () => {
    currentSale = [];
    renderSale();
    updateTotal();
    setStatus("Venta cancelada.");
    closeModal();
  };
}

function handleCancelNote() {
  if (!checkPermission('permCancelSale', 'Cancelar Notas')) {
    return;
  }
  
  if (currentSale.length === 0) {
    setStatus("No hay nota actual. Usa F3 para buscar ventas realizadas.");
    return;
  }
  
  const optionsHtml = `
    <div style="margin-bottom: 15px;">
      <p>¿Qué deseas cancelar?</p>
      <button class="cmd-btn cmd-danger" id="cancelFullNote" style="width: 100%; margin-bottom: 8px;">
        Cancelar Nota Completa
      </button>
      <button class="cmd-btn" id="cancelProduct" style="width: 100%;">
        Cancelar Solo un Producto
      </button>
    </div>
  `;
  
  showModal("Cancelar Nota (F1)", optionsHtml);
  
  document.getElementById("cancelFullNote").addEventListener("click", () => {
    currentSale = [];
    renderSale();
    updateTotal();
    setStatus("Nota cancelada completamente.");
    closeModal();
  });
  
  document.getElementById("cancelProduct").addEventListener("click", () => {
    closeModal();
    showCancelProductSelection();
  });
}

function showCancelProductSelection() {
  if (currentSale.length === 0) {
    setStatus("No hay productos en la venta.");
    return;
  }
  
  let productListHtml = '<div style="max-height: 300px; overflow-y: auto;"><h4>Selecciona el producto a cancelar:</h4>';
  currentSale.forEach((item, idx) => {
    productListHtml += `
      <div style="padding: 8px; border: 1px solid #e0e0e0; border-radius: 6px; margin-bottom: 6px; cursor: pointer;" 
           onclick="cancelProductAtIndex(${idx})">
        <strong>${item.name}</strong><br>
        <small>Cantidad: ${item.qty} - Precio: $${(item.price * item.qty).toFixed(2)}</small>
      </div>
    `;
  });
  productListHtml += '</div>';
  
  showModal("Cancelar Producto", productListHtml);
}

window.cancelProductAtIndex = function(idx) {
  const item = currentSale[idx];
  currentSale.splice(idx, 1);
  renderSale();
  updateTotal();
  setStatus(`Producto "${item.name}" cancelado de la nota.`);
  closeModal();
};

function handleSearchSale() {
  if (salesHistory.length === 0) {
    showModal("Buscar Venta (F3)", "No hay ventas registradas en este turno.");
    return;
  }
  
  let salesListHtml = `
    <div style="margin-bottom: 10px;">
      <input type="text" id="searchSaleInput" placeholder="Buscar por producto, total..." 
             style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #e0e0e0;">
    </div>
    <div id="salesListContainer" style="max-height: 400px; overflow-y: auto;">
  `;
  
  salesHistory.forEach((sale, idx) => {
    const saleTime = new Date(sale.date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    const products = sale.items.map(i => i.name).join(', ');
    
    salesListHtml += `
      <div class="sale-search-item" style="padding: 10px; border: 1px solid #e0e0e0; border-radius: 6px; margin-bottom: 8px; cursor: pointer;"
           onclick="showSaleDetail(${idx})">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <strong>Venta #${idx + 1} - ${saleTime}</strong>
          <strong style="color: #ff7b1a;">$${sale.total.toFixed(2)}</strong>
        </div>
        <small>${products}</small><br>
        <small>Pago: ${sale.paymentMethod}</small>
      </div>
    `;
  });
  
  salesListHtml += '</div>';
  
  showModal("Buscar Venta (F3)", salesListHtml);
  
  setTimeout(() => {
    const searchInput = document.getElementById('searchSaleInput');
    searchInput.addEventListener('input', filterSales);
  }, 100);
}

window.showSaleDetail = function(idx) {
  const sale = salesHistory[idx];
  const saleTime = new Date(sale.date).toLocaleString('es-MX');
  
  let detailHtml = `
    <div style="text-align: left;">
      <h4>Venta #${idx + 1}</h4>
      <p><strong>Fecha:</strong> ${saleTime}</p>
      <p><strong>Forma de Pago:</strong> ${sale.paymentMethod}</p>
      <p><strong>Total:</strong> $${sale.total.toFixed(2)}</p>
      <hr>
      <h4>Productos:</h4>
      <table style="width: 100%; font-size: 0.9rem;">
        <thead>
          <tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Total</th></tr>
        </thead>
        <tbody>
          ${sale.items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td>${item.qty}</td>
              <td>$${item.price.toFixed(2)}</td>
              <td>$${(item.price * item.qty).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <hr>
      <button class="cmd-btn cmd-danger" id="cancelThisSale" style="width: 100%; margin-top: 10px;">
        Cancelar Esta Venta (Devolución)
      </button>
    </div>
  `;
  
  showModal(`Detalle de Venta #${idx + 1}`, detailHtml);
  
  document.getElementById('cancelThisSale').addEventListener('click', () => {
    confirmCancelSale(idx);
  });
};

function confirmCancelSale(idx) {
  const sale = salesHistory[idx];
  
  showModal("Confirmar Cancelación", 
    `¿Cancelar la venta de $${sale.total.toFixed(2)}?<br><br>
     Esta acción registrará una devolución y ajustará el corte de caja.`);
  
  modalOk.onclick = () => {
    // Registrar cancelación
    const cancellation = {
      ...sale,
      cancelledAt: new Date().toISOString(),
      originalSaleId: sale.id
    };
    
    // Remover del historial o marcar como cancelada
    salesHistory[idx].cancelled = true;
    salesHistory[idx].cancelledAt = cancellation.cancelledAt;
    localStorage.setItem('ventamaestra_sales_history', JSON.stringify(salesHistory));
    
    totalSalesAmount -= sale.total;
    totalTickets -= 1;
    
    closeModal();
    setStatus(`Venta cancelada. Total devuelto: $${sale.total.toFixed(2)}`);
  };
}

function filterSales() {
  const query = document.getElementById('searchSaleInput').value.toLowerCase();
  const items = document.querySelectorAll('.sale-search-item');
  
  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(query) ? 'block' : 'none';
  });
}

function handlePauseSale() {
  if (pausedSales.length > 0) {
    // Mostrar ventas pausadas para recuperar
    showPausedSales();
  } else if (currentSale.length > 0) {
    // Pausar venta actual
    pauseCurrentSale();
  } else {
    setStatus("No hay venta actual para pausar ni ventas pausadas.");
  }
}

function pauseCurrentSale() {
  const pausedSale = {
    id: Date.now(),
    date: new Date().toISOString(),
    items: JSON.parse(JSON.stringify(currentSale))
  };
  
  pausedSales.push(pausedSale);
  localStorage.setItem('ventamaestra_paused_sales', JSON.stringify(pausedSales));
  
  currentSale = [];
  renderSale();
  updateTotal();
  setStatus(`Venta pausada. Usa F4 para recuperarla. (${pausedSales.length} venta(s) pausada(s))`);
}

function showPausedSales() {
  let pausedListHtml = '<h4>Ventas Pausadas:</h4><div style="max-height: 300px; overflow-y: auto;">';
  
  pausedSales.forEach((sale, idx) => {
    const saleTime = new Date(sale.date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    const total = sale.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const products = sale.items.map(i => `${i.name} (${i.qty})`).join(', ');
    
    pausedListHtml += `
      <div style="padding: 10px; border: 1px solid #e0e0e0; border-radius: 6px; margin-bottom: 8px; cursor: pointer;"
           onclick="recoverPausedSale(${idx})">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <strong>Pausada ${saleTime}</strong>
          <strong>$${total.toFixed(2)}</strong>
        </div>
        <small>${products}</small>
      </div>
    `;
  });
  
  pausedListHtml += '</div>';
  
  if (currentSale.length > 0) {
    pausedListHtml += `
      <hr>
      <button class="cmd-btn cmd-primary" id="pauseCurrentBtn" style="width: 100%; margin-top: 10px;">
        Pausar Venta Actual
      </button>
    `;
  }
  
  showModal("Pausar/Recuperar Venta (F4)", pausedListHtml);
  
  if (currentSale.length > 0) {
    setTimeout(() => {
      document.getElementById('pauseCurrentBtn').addEventListener('click', () => {
        pauseCurrentSale();
        closeModal();
      });
    }, 100);
  }
}

window.recoverPausedSale = function(idx) {
  const sale = pausedSales[idx];
  
  if (currentSale.length > 0) {
    if (!confirm("¿Descartar la venta actual y recuperar la pausada?")) {
      return;
    }
  }
  
  currentSale = JSON.parse(JSON.stringify(sale.items));
  pausedSales.splice(idx, 1);
  localStorage.setItem('ventamaestra_paused_sales', JSON.stringify(pausedSales));
  
  renderSale();
  updateTotal();
  setStatus("Venta recuperada. Continúa la operación.");
  closeModal();
};

function handleStockAdjust() {
  showModal(
    "Ajuste Express (F7)",
    "Función de ajuste de inventario rápido (simulación).<br>Aquí podrías ajustar stock sin ir al módulo completo."
  );
}

function handleWithdrawal() {
  if (!checkPermission('permWithdrawal', 'Realizar Retiros de Caja')) {
    return;
  }
  
  const formHtml = `
    <div style="margin-bottom: 10px;">
      <label style="display: block; margin-bottom: 5px; font-size: 0.9rem;">Monto a retirar:</label>
      <input type="number" id="withdrawalAmount" placeholder="0.00" step="0.01" min="0.01" required
             style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #e0e0e0; font-size: 0.9rem;">
    </div>
    <div style="margin-bottom: 10px;">
      <label style="display: block; margin-bottom: 5px; font-size: 0.9rem;">Concepto/Razón:</label>
      <input type="text" id="withdrawalReason" placeholder="Ej: Pago a proveedor, gastos..." required
             style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #e0e0e0; font-size: 0.9rem;">
    </div>
  `;
  
  showModal("Retiro de Caja (F8)", formHtml);
  
  const withdrawalAmountEl = document.getElementById("withdrawalAmount");
  const withdrawalReasonEl = document.getElementById("withdrawalReason");
  
  setTimeout(() => withdrawalAmountEl.focus(), 100);
  
  withdrawalAmountEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      withdrawalReasonEl.focus();
    }
  });
  
  withdrawalReasonEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      confirmWithdrawal();
    }
  });
  
  function confirmWithdrawal() {
    const amount = parseFloat(withdrawalAmountEl.value);
    const reason = withdrawalReasonEl.value.trim();
    
    if (!amount || amount <= 0) {
      alert("Ingresa un monto válido.");
      return;
    }
    
    if (!reason) {
      alert("Ingresa una razón para el retiro.");
      return;
    }
    
    const withdrawal = {
      id: Date.now(),
      date: new Date().toISOString(),
      amount: amount,
      reason: reason
    };
    
    cashWithdrawals.push(withdrawal);
    localStorage.setItem('ventamaestra_withdrawals', JSON.stringify(cashWithdrawals));
    
    closeModal();
    showModal("Retiro Registrado", `Se retiró $${amount.toFixed(2)} de caja.<br>Concepto: ${reason}`);
    setStatus(`Retiro registrado: $${amount.toFixed(2)} - ${reason}`);
  }
  
  modalOk.onclick = confirmWithdrawal;
}

function handleCashCut() {
  if (!checkPermission('permViewCashCut', 'Ver Corte de Caja')) {
    return;
  }
  
  const now = new Date();
  const dateStr = now.toLocaleString("es-MX");
  
  // Calcular estadísticas detalladas
  const stats = calculateCashCutStats();
  
  const cutReport = `
    <div style="text-align: left; max-height: 500px; overflow-y: auto;">
      <h3 style="margin-top: 0;">📊 Corte de Caja</h3>
      <p><strong>Fecha/Hora:</strong> ${dateStr}</p>
      <p><strong>Cajero:</strong> ${currentUser.name}</p>
      <hr>
      
      <h4>💰 Resumen Financiero</h4>
      <table style="width: 100%; font-size: 0.9rem; border-collapse: collapse;">
        <tr style="background: #f5f5f5;">
          <td style="padding: 6px;"><strong>Total Ventas:</strong></td>
          <td style="padding: 6px; text-align: right;"><strong>$${stats.totalSales.toFixed(2)}</strong></td>
        </tr>
        ${hasPermission('permViewProfit') ? `
        <tr>
          <td style="padding: 6px;">Total Ganancia:</td>
          <td style="padding: 6px; text-align: right; color: #2e7d32;"><strong>$${stats.totalProfit.toFixed(2)}</strong></td>
        </tr>
        ` : ''}
        <tr style="background: #f5f5f5;">
          <td style="padding: 6px;">Tickets:</td>
          <td style="padding: 6px; text-align: right;">${stats.ticketCount}</td>
        </tr>
        <tr>
          <td style="padding: 6px;">Ticket Promedio:</td>
          <td style="padding: 6px; text-align: right;">$${stats.avgTicket.toFixed(2)}</td>
        </tr>
      </table>
      
      <h4>💳 Formas de Pago</h4>
      <table style="width: 100%; font-size: 0.9rem;">
        <tr><td style="padding: 4px;">Efectivo:</td><td style="text-align: right;">$${stats.paymentMethods.efectivo.toFixed(2)}</td></tr>
        <tr><td style="padding: 4px;">Tarjeta:</td><td style="text-align: right;">$${stats.paymentMethods.tarjeta.toFixed(2)}</td></tr>
        <tr><td style="padding: 4px;">Crédito:</td><td style="text-align: right;">$${stats.paymentMethods.credito.toFixed(2)}</td></tr>
        <tr><td style="padding: 4px;">Cortesía:</td><td style="text-align: right;">$${stats.paymentMethods.cortesia.toFixed(2)}</td></tr>
      </table>
      
      ${stats.withdrawals.length > 0 ? `
        <h4>💸 Retiros de Caja</h4>
        <table style="width: 100%; font-size: 0.9rem;">
          ${stats.withdrawals.map(w => `
            <tr>
              <td style="padding: 4px;">${w.reason}</td>
              <td style="text-align: right; color: #e53935;">-$${w.amount.toFixed(2)}</td>
            </tr>
          `).join('')}
          <tr style="background: #ffebee; font-weight: bold;">
            <td style="padding: 6px;">Total Retiros:</td>
            <td style="text-align: right;">-$${stats.totalWithdrawals.toFixed(2)}</td>
          </tr>
        </table>
      ` : ''}
      
      <h4>📦 Top 5 Productos Más Vendidos</h4>
      <ol style="margin: 0; padding-left: 20px; font-size: 0.9rem;">
        ${stats.topProducts.map(p => `
          <li>${p.name} - ${p.quantity} unidades - $${p.total.toFixed(2)}</li>
        `).join('')}
      </ol>
      
      <h4>🏷️ Ventas por Familia</h4>
      <table style="width: 100%; font-size: 0.9rem;">
        ${stats.familySales.map(f => `
          <tr>
            <td style="padding: 4px;">${f.family}</td>
            <td style="text-align: right;">$${f.total.toFixed(2)} (${f.percentage.toFixed(1)}%)</td>
          </tr>
        `).join('')}
      </table>
      
      <h4>🧾 Lista de Ventas</h4>
      <div style="max-height: 200px; overflow-y: auto; font-size: 0.85rem;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead style="position: sticky; top: 0; background: #f5f5f5;">
            <tr>
              <th style="padding: 4px; text-align: left;">#</th>
              <th style="padding: 4px; text-align: left;">Hora</th>
              <th style="padding: 4px; text-align: right;">Total</th>
              <th style="padding: 4px; text-align: center;">Pago</th>
            </tr>
          </thead>
          <tbody>
            ${stats.salesList.map((s, idx) => `
              <tr style="${s.cancelled ? 'background: #ffebee; text-decoration: line-through; opacity: 0.6;' : ''}">
                <td style="padding: 4px; border-bottom: 1px solid #eee;">${idx + 1}</td>
                <td style="padding: 4px; border-bottom: 1px solid #eee;">${s.time}${s.cancelled ? ' ❌' : ''}</td>
                <td style="padding: 4px; border-bottom: 1px solid #eee; text-align: right;">$${s.total.toFixed(2)}</td>
                <td style="padding: 4px; border-bottom: 1px solid #eee; text-align: center;">${s.payment}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <hr>
      <p style="background: #fff3e0; padding: 10px; border-radius: 6px; margin-top: 10px;">
        <strong>💵 Efectivo en Caja:</strong> $${(stats.paymentMethods.efectivo - stats.totalWithdrawals).toFixed(2)}
      </p>
    </div>
  `;
  
  showModal("Corte de Caja (F10)", cutReport);
  
  modalOk.onclick = () => {
    // Limpiar historial después del corte
    lastCashCut = now.toISOString();
    salesHistory = [];
    cashWithdrawals = [];
    localStorage.setItem('ventamaestra_sales_history', JSON.stringify(salesHistory));
    localStorage.setItem('ventamaestra_withdrawals', JSON.stringify(cashWithdrawals));
    totalSalesAmount = 0;
    totalTickets = 0;
    closeModal();
    setStatus("Corte de caja realizado. Historial limpiado.");
  };
}

function calculateCashCutStats() {
  const stats = {
    totalSales: 0,
    totalProfit: 0,
    ticketCount: salesHistory.filter(s => !s.cancelled).length,
    avgTicket: 0,
    paymentMethods: {
      efectivo: 0,
      tarjeta: 0,
      credito: 0,
      cortesia: 0
    },
    topProducts: [],
    familySales: [],
    salesList: [],
    withdrawals: cashWithdrawals,
    totalWithdrawals: 0
  };
  
  // Calcular totales y formas de pago
  salesHistory.forEach(sale => {
    if (sale.cancelled) return; // Ignorar ventas canceladas
    
    stats.totalSales += sale.total;
    stats.paymentMethods[sale.paymentMethod] = (stats.paymentMethods[sale.paymentMethod] || 0) + sale.total;
    
    // Calcular ganancia por venta
    sale.items.forEach(item => {
      const cost = item.cost || 0;
      const profit = (item.price - cost) * item.qty;
      stats.totalProfit += profit;
    });
  });
  
  stats.avgTicket = stats.ticketCount > 0 ? stats.totalSales / stats.ticketCount : 0;
  
  // Retiros
  stats.totalWithdrawals = cashWithdrawals.reduce((sum, w) => sum + w.amount, 0);
  
  // Top productos
  const productMap = {};
  salesHistory.forEach(sale => {
    sale.items.forEach(item => {
      if (!productMap[item.id]) {
        productMap[item.id] = {
          name: item.name,
          quantity: 0,
          total: 0
        };
      }
      productMap[item.id].quantity += item.qty;
      productMap[item.id].total += item.price * item.qty;
    });
  });
  
  stats.topProducts = Object.values(productMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
  
  // Ventas por familia
  const familyMap = {};
  salesHistory.forEach(sale => {
    sale.items.forEach(item => {
      const family = item.family || 'Sin categoría';
      if (!familyMap[family]) {
        familyMap[family] = 0;
      }
      familyMap[family] += item.price * item.qty;
    });
  });
  
  stats.familySales = Object.entries(familyMap)
    .map(([family, total]) => ({
      family,
      total,
      percentage: (total / stats.totalSales) * 100
    }))
    .sort((a, b) => b.total - a.total);
  
  // Lista de ventas
  stats.salesList = salesHistory.map(sale => ({
    time: new Date(sale.date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    total: sale.total,
    payment: sale.paymentMethod.charAt(0).toUpperCase() + sale.paymentMethod.slice(1),
    cancelled: sale.cancelled || false
  }));
  
  return stats;
}

function toggleDeliveryPanel() {
  deliveryPanel.classList.toggle("open");
}

function renderDeliveryList() {
  deliveryList.innerHTML = "";
  deliveryOrders.forEach((order) => {
    const li = document.createElement("li");
    li.className = "delivery-item";

    const statusClass =
      order.status === "Pendiente"
        ? "status-pending"
        : order.status === "Preparando"
        ? "status-preparing"
        : "status-done";

    li.innerHTML = `
      <div class="delivery-item-header">
        <strong>${order.id}</strong>
        <span class="delivery-status ${statusClass}">${order.status}</span>
      </div>
      <div>${order.customer}</div>
      <div style="font-size:0.75rem; color:#777;">${order.address}</div>
      <div style="font-weight:600; margin-top:4px;">Total: $${order.total.toFixed(2)}</div>
    `;
    deliveryList.appendChild(li);
  });
}

function showModal(title, body) {
  modalTitle.textContent = title;
  modalBody.innerHTML = body;
  modalOverlay.classList.add("open");
}

function closeModal() {
  modalOverlay.classList.remove("open");
  modalOk.onclick = closeModal;
}

function handleKeyShortcuts(e) {
  if (e.key === "F1") {
    e.preventDefault();
    handleCancelNote();
  } else if (e.key === "F2") {
    e.preventDefault();
    searchInput.focus();
  } else if (e.key === "F3") {
    e.preventDefault();
    handleSearchSale();
  } else if (e.key === "F4") {
    e.preventDefault();
    handlePauseSale();
  } else if (e.key === "F5") {
    e.preventDefault();
    setStatus("Ya estás en Punto de Venta (F5).");
  } else if (e.key === "F7") {
    e.preventDefault();
    handleStockAdjust();
  } else if (e.key === "F8") {
    e.preventDefault();
    handleWithdrawal();
  } else if (e.key === "F9") {
    e.preventDefault();
    handleCharge();
  } else if (e.key === "F10") {
    e.preventDefault();
    handleCashCut();
  } else if (e.key === "F11") {
    e.preventDefault();
    toggleDeliveryPanel();
  }
}

// Iniciar la aplicación
init();
