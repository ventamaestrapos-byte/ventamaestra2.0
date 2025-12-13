// Variables globales
let currentLicense = JSON.parse(localStorage.getItem('ventamaestra_license')) || null;
let allLicenses = JSON.parse(localStorage.getItem('ventamaestra_all_licenses')) || [];
let storeConfig = JSON.parse(localStorage.getItem('ventamaestra_store_config')) || {};
let deviceFingerprint = null;
const isMasterAdmin = window.location.hostname === 'localhost' || checkMasterPassword();

// Referencias DOM
const activationForm = document.getElementById('activationForm');
const createLicenseForm = document.getElementById('createLicenseForm');
const onlineStoreForm = document.getElementById('onlineStoreForm');
const activationCard = document.getElementById('activationCard');
const createLicenseCard = document.getElementById('createLicenseCard');
const licensesList = document.getElementById('licensesList');
const searchLicense = document.getElementById('searchLicense');
const licensesContainer = document.getElementById('licensesContainer');

// Event Listeners
activationForm.addEventListener('submit', handleActivation);
if (createLicenseForm) createLicenseForm.addEventListener('submit', handleCreateLicense);
onlineStoreForm.addEventListener('submit', handleSaveStoreConfig);
if (searchLicense) searchLicense.addEventListener('input', renderAllLicenses);

// Inicialización
init();

async function init() {
  deviceFingerprint = await generateDeviceFingerprint();
  
  if (currentLicense && currentLicense.deviceId) {
    // Verificar que el dispositivo coincida
    if (currentLicense.deviceId !== deviceFingerprint) {
      alert('⚠️ LICENCIA INVÁLIDA\n\nEsta licencia está registrada en otro dispositivo.\nContacta al administrador para obtener ayuda.');
      localStorage.removeItem('ventamaestra_license');
      currentLicense = null;
    } else {
      // Verificar expiración
      if (new Date(currentLicense.expirationDate) < new Date()) {
        alert('⚠️ LICENCIA EXPIRADA\n\nTu licencia ha vencido. Contacta al administrador.');
      }
      
      displayCurrentLicense();
      activationCard.style.display = 'none';
    }
  }
  
  // Mostrar panel de administrador si aplica
  if (isMasterAdmin) {
    createLicenseCard.style.display = 'block';
    licensesList.style.display = 'block';
    renderAllLicenses();
  }
  
  loadStoreConfig();
}

async function generateDeviceFingerprint() {
  const navigator = window.navigator;
  const screen = window.screen;
  
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 'unknown',
    navigator.deviceMemory || 'unknown'
  ];
  
  const fingerprint = components.join('|');
  return await hashString(fingerprint);
}

async function hashString(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function checkMasterPassword() {
  // Solo para desarrollo - en producción esto sería una API
  const password = prompt('Ingresa contraseña de administrador master:');
  return password === 'master2024';
}

function displayCurrentLicense() {
  document.getElementById('currentStoreName').textContent = currentLicense.storeName;
  document.getElementById('currentLicenseKey').textContent = currentLicense.licenseKey;
  
  const isActive = new Date(currentLicense.expirationDate) > new Date();
  const statusEl = document.getElementById('currentLicenseStatus');
  statusEl.textContent = isActive ? '✅ Activa' : '❌ Expirada';
  statusEl.style.color = isActive ? '#2e7d32' : '#c62828';
  
  document.getElementById('currentDeviceInfo').textContent = 
    `${currentLicense.deviceType || 'Escritorio'} - ${currentLicense.deviceId.substring(0, 16)}...`;
  
  document.getElementById('activationDate').textContent = 
    new Date(currentLicense.activationDate).toLocaleDateString('es-MX');
  
  document.getElementById('expirationDate').textContent = 
    new Date(currentLicense.expirationDate).toLocaleDateString('es-MX');
  
  // URL de tienda en línea
  const storeUrl = `${window.location.origin}/tienda.html?store=${currentLicense.storeId}`;
  document.getElementById('storeUrl').value = storeUrl;
}

async function handleActivation(e) {
  e.preventDefault();
  
  const storeName = document.getElementById('storeName').value.trim();
  const licenseKey = document.getElementById('licenseKey').value.trim().toUpperCase();
  const businessName = document.getElementById('businessName').value.trim();
  const contactEmail = document.getElementById('contactEmail').value.trim();
  const contactPhone = document.getElementById('contactPhone').value.trim();
  const storeAddress = document.getElementById('storeAddress').value.trim();
  
  // Validar formato de licencia
  if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(licenseKey)) {
    alert('Formato de licencia inválido. Debe ser: XXXX-XXXX-XXXX-XXXX');
    return;
  }
  
  // Buscar licencia en el sistema
  const license = allLicenses.find(l => l.licenseKey === licenseKey);
  
  if (!license) {
    alert('❌ Licencia no encontrada.\n\nVerifica el código o contacta al administrador.');
    return;
  }
  
  if (license.deviceId && license.deviceId !== deviceFingerprint) {
    alert('❌ Esta licencia ya está activada en otro dispositivo.\n\nContacta al administrador para desactivarla primero.');
    return;
  }
  
  if (new Date(license.expirationDate) < new Date()) {
    alert('❌ Esta licencia ha expirado.\n\nContacta al administrador para renovarla.');
    return;
  }
  
  // Activar licencia
  license.deviceId = deviceFingerprint;
  license.activationDate = new Date().toISOString();
  license.storeName = storeName;
  license.businessName = businessName;
  license.contactEmail = contactEmail;
  license.contactPhone = contactPhone;
  license.storeAddress = storeAddress;
  license.deviceType = getDeviceType();
  license.activated = true;
  
  // Guardar licencia localmente
  localStorage.setItem('ventamaestra_license', JSON.stringify(license));
  currentLicense = license;
  
  // Actualizar en la lista maestra
  const index = allLicenses.findIndex(l => l.licenseKey === licenseKey);
  allLicenses[index] = license;
  localStorage.setItem('ventamaestra_all_licenses', JSON.stringify(allLicenses));
  
  alert('✅ LICENCIA ACTIVADA CORRECTAMENTE\n\n' +
        'Tu punto de venta está listo para usarse.\n' +
        'Este dispositivo quedó registrado permanentemente.');
  
  window.location.reload();
}

function getDeviceType() {
  const ua = navigator.userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'Tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/i.test(ua)) {
    return 'Móvil';
  }
  return 'Escritorio';
}

function handleCreateLicense(e) {
  e.preventDefault();
  
  const name = document.getElementById('newLicenseName').value.trim();
  const type = document.getElementById('licenseType').value;
  const validity = parseInt(document.getElementById('licenseValidity').value);
  const enableOnline = document.getElementById('enableOnlineStore').checked;
  
  const licenseKey = generateLicenseKey();
  const storeId = 'STORE_' + Date.now();
  
  const expirationDate = new Date();
  expirationDate.setMonth(expirationDate.getMonth() + validity);
  
  const newLicense = {
    licenseKey: licenseKey,
    storeId: storeId,
    storeName: name,
    type: type,
    createdDate: new Date().toISOString(),
    expirationDate: expirationDate.toISOString(),
    enableOnlineStore: enableOnline,
    activated: false,
    deviceId: null
  };
  
  allLicenses.push(newLicense);
  localStorage.setItem('ventamaestra_all_licenses', JSON.stringify(allLicenses));
  
  alert(`✅ LICENCIA GENERADA\n\nCódigo: ${licenseKey}\nSucursal: ${name}\nVálida hasta: ${expirationDate.toLocaleDateString('es-MX')}\n\nGuarda este código de forma segura.`);
  
  document.getElementById('createLicenseForm').reset();
  renderAllLicenses();
}

function generateLicenseKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = '';
  
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) key += '-';
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return key;
}

function renderAllLicenses() {
  const query = searchLicense ? searchLicense.value.toLowerCase() : '';
  
  const filtered = allLicenses.filter(l => 
    l.storeName.toLowerCase().includes(query) ||
    l.licenseKey.toLowerCase().includes(query) ||
    (l.businessName && l.businessName.toLowerCase().includes(query))
  );
  
  if (filtered.length === 0) {
    licensesContainer.innerHTML = '<p style="text-align: center; padding: 20px; color: #999;">No hay licencias registradas.</p>';
    return;
  }
  
  licensesContainer.innerHTML = filtered.map(license => {
    const isActive = license.activated && new Date(license.expirationDate) > new Date();
    const isExpired = new Date(license.expirationDate) < new Date();
    
    return `
      <div class="license-card" style="background: white; border: 2px solid ${isActive ? '#4caf50' : isExpired ? '#f44336' : '#e0e0e0'}; border-radius: 8px; padding: 15px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div style="flex: 1;">
            <h4 style="margin: 0 0 8px 0;">
              ${license.storeName}
              ${isActive ? '<span style="background: #4caf50; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; margin-left: 8px;">ACTIVA</span>' : ''}
              ${isExpired ? '<span style="background: #f44336; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; margin-left: 8px;">EXPIRADA</span>' : ''}
              ${!license.activated ? '<span style="background: #ff9800; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; margin-left: 8px;">PENDIENTE</span>' : ''}
            </h4>
            
            <div style="font-size: 0.85rem; color: #666; margin-bottom: 8px;">
              <strong>Licencia:</strong> <code style="background: #f5f5f5; padding: 2px 6px; border-radius: 4px;">${license.licenseKey}</code>
            </div>
            
            <div style="font-size: 0.85rem; color: #666;">
              <p style="margin: 4px 0;"><strong>Tipo:</strong> ${getTypeLabel(license.type)}</p>
              ${license.businessName ? `<p style="margin: 4px 0;"><strong>Negocio:</strong> ${license.businessName}</p>` : ''}
              ${license.deviceType ? `<p style="margin: 4px 0;"><strong>Dispositivo:</strong> ${license.deviceType}</p>` : ''}
              <p style="margin: 4px 0;"><strong>Creada:</strong> ${new Date(license.createdDate).toLocaleDateString('es-MX')}</p>
              <p style="margin: 4px 0;"><strong>Vence:</strong> ${new Date(license.expirationDate).toLocaleDateString('es-MX')}</p>
              ${license.enableOnlineStore ? '<p style="margin: 4px 0; color: #2196f3;">🌐 Tienda en línea habilitada</p>' : ''}
            </div>
          </div>
          
          <div style="display: flex; gap: 6px; flex-direction: column;">
            ${license.activated ? `<button class="cmd-btn cmd-danger" onclick="deactivateLicense('${license.licenseKey}')" style="padding: 6px 10px; font-size: 0.8rem;">🔓 Desactivar</button>` : ''}
            <button class="cmd-btn" onclick="extendLicense('${license.licenseKey}')" style="padding: 6px 10px; font-size: 0.8rem;">⏰ Extender</button>
            <button class="cmd-btn cmd-danger" onclick="deleteLicense('${license.licenseKey}')" style="padding: 6px 10px; font-size: 0.8rem;">🗑️</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function getTypeLabel(type) {
  const labels = {
    desktop: '💻 Escritorio',
    tablet: '📱 Tablet',
    mobile: '📲 Móvil'
  };
  return labels[type] || type;
}

window.deactivateLicense = function(licenseKey) {
  if (!confirm('¿Desactivar esta licencia? El dispositivo podrá ser reasignado.')) return;
  
  const license = allLicenses.find(l => l.licenseKey === licenseKey);
  if (license) {
    license.deviceId = null;
    license.activated = false;
    localStorage.setItem('ventamaestra_all_licenses', JSON.stringify(allLicenses));
    renderAllLicenses();
    alert('Licencia desactivada. Puede ser activada en otro dispositivo.');
  }
};

window.extendLicense = function(licenseKey) {
  const months = prompt('¿Cuántos meses deseas extender la licencia?', '12');
  if (!months || isNaN(months)) return;
  
  const license = allLicenses.find(l => l.licenseKey === licenseKey);
  if (license) {
    const newExpiration = new Date(license.expirationDate);
    newExpiration.setMonth(newExpiration.getMonth() + parseInt(months));
    license.expirationDate = newExpiration.toISOString();
    
    localStorage.setItem('ventamaestra_all_licenses', JSON.stringify(allLicenses));
    renderAllLicenses();
    alert(`Licencia extendida hasta: ${newExpiration.toLocaleDateString('es-MX')}`);
  }
};

window.deleteLicense = function(licenseKey) {
  if (!confirm('¿ELIMINAR esta licencia permanentemente?')) return;
  
  allLicenses = allLicenses.filter(l => l.licenseKey !== licenseKey);
  localStorage.setItem('ventamaestra_all_licenses', JSON.stringify(allLicenses));
  renderAllLicenses();
};

function loadStoreConfig() {
  if (Object.keys(storeConfig).length > 0) {
    document.getElementById('storeLogo').value = storeConfig.logo || '';
    document.getElementById('storeColor').value = storeConfig.color || '#ff7b1a';
    document.getElementById('deliveryFee').value = storeConfig.deliveryFee || 0;
    document.getElementById('minOrderAmount').value = storeConfig.minOrderAmount || 0;
    document.getElementById('acceptCash').checked = storeConfig.acceptCash !== false;
    document.getElementById('acceptCard').checked = storeConfig.acceptCard !== false;
    document.getElementById('allowPickup').checked = storeConfig.allowPickup !== false;
    document.getElementById('allowDelivery').checked = storeConfig.allowDelivery !== false;
    document.getElementById('storeMessage').value = storeConfig.message || '';
  }
}

function handleSaveStoreConfig(e) {
  e.preventDefault();
  
  storeConfig = {
    logo: document.getElementById('storeLogo').value,
    color: document.getElementById('storeColor').value,
    deliveryFee: parseFloat(document.getElementById('deliveryFee').value) || 0,
    minOrderAmount: parseFloat(document.getElementById('minOrderAmount').value) || 0,
    acceptCash: document.getElementById('acceptCash').checked,
    acceptCard: document.getElementById('acceptCard').checked,
    allowPickup: document.getElementById('allowPickup').checked,
    allowDelivery: document.getElementById('allowDelivery').checked,
    message: document.getElementById('storeMessage').value
  };
  
  localStorage.setItem('ventamaestra_store_config', JSON.stringify(storeConfig));
  alert('✅ Configuración de tienda guardada correctamente.');
}

window.copyStoreUrl = function() {
  const urlInput = document.getElementById('storeUrl');
  urlInput.select();
  document.execCommand('copy');
  alert('✅ URL copiada al portapapeles');
};

window.openStoreUrl = function() {
  const url = document.getElementById('storeUrl').value;
  window.open(url, '_blank');
};

// Verificar licencia al inicio de la aplicación
window.checkLicense = function() {
  if (!currentLicense) {
    alert('⚠️ NO HAY LICENCIA ACTIVA\n\nContacta al administrador para obtener una licencia.');
    window.location.href = 'licencias.html';
    return false;
  }
  
  if (currentLicense.deviceId !== deviceFingerprint) {
    alert('⚠️ LICENCIA INVÁLIDA\n\nEsta licencia pertenece a otro dispositivo.');
    window.location.href = 'licencias.html';
    return false;
  }
  
  if (new Date(currentLicense.expirationDate) < new Date()) {
    alert('⚠️ LICENCIA EXPIRADA\n\nContacta al administrador.');
    return false;
  }
  
  return true;
};
