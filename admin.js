// Contraseña maestra para acceder al panel
const MASTER_PASSWORD = 'VentaMaestra2024!Admin';

// Referencias DOM
const loginSection = document.getElementById('loginSection');
const adminPanel = document.getElementById('adminPanel');
const authForm = document.getElementById('authForm');
const masterPassword = document.getElementById('masterPassword');
const generateLicenseForm = document.getElementById('generateLicenseForm');
const licenseResultCard = document.getElementById('licenseResultCard');
const searchLicenses = document.getElementById('searchLicenses');
const licensesList = document.getElementById('licensesList');

let allLicenses = [];
let isAuthenticated = false;

// Event Listeners
authForm.addEventListener('submit', handleAuth);
generateLicenseForm.addEventListener('submit', handleGenerateLicense);
searchLicenses.addEventListener('input', renderLicenses);

// Verificar sesión al cargar
init();

function init() {
  const session = sessionStorage.getItem('ventamaestra_admin_session');
  if (session === 'authenticated') {
    isAuthenticated = true;
    showAdminPanel();
  }
}

function handleAuth(e) {
  e.preventDefault();
  
  if (masterPassword.value === MASTER_PASSWORD) {
    isAuthenticated = true;
    sessionStorage.setItem('ventamaestra_admin_session', 'authenticated');
    showAdminPanel();
    masterPassword.value = '';
  } else {
    alert('❌ Contraseña incorrecta');
    masterPassword.value = '';
  }
}

function showAdminPanel() {
  loginSection.classList.add('hidden');
  adminPanel.classList.remove('hidden');
  loadAllLicenses();
  updateStats();
  renderLicenses();
}

window.logout = function() {
  if (confirm('¿Cerrar sesión del panel de administración?')) {
    isAuthenticated = false;
    sessionStorage.removeItem('ventamaestra_admin_session');
    adminPanel.classList.add('hidden');
    loginSection.classList.remove('hidden');
  }
};

function loadAllLicenses() {
  // Cargar desde localStorage global
  allLicenses = JSON.parse(localStorage.getItem('ventamaestra_all_licenses')) || [];
}

function updateStats() {
  const total = allLicenses.length;
  const active = allLicenses.filter(l => l.activated && !isExpired(l)).length;
  const expired = allLicenses.filter(l => isExpired(l)).length;
  const pending = allLicenses.filter(l => !l.activated).length;
  
  document.getElementById('statTotalLicenses').textContent = total;
  document.getElementById('statActiveLicenses').textContent = active;
  document.getElementById('statExpiredLicenses').textContent = expired;
  document.getElementById('statPendingLicenses').textContent = pending;
}

function isExpired(license) {
  if (!license.expirationDate) return false;
  return new Date(license.expirationDate) < new Date();
}

function handleGenerateLicense(e) {
  e.preventDefault();
  
  const storeName = document.getElementById('newStoreName').value;
  const storeAddress = document.getElementById('newStoreAddress').value;
  const ownerName = document.getElementById('newOwnerName').value;
  const ownerPhone = document.getElementById('newOwnerPhone').value;
  const ownerEmail = document.getElementById('newOwnerEmail').value;
  const licenseType = document.getElementById('newLicenseType').value;
  const notes = document.getElementById('newLicenseNotes').value;
  
  // Generar código único de licencia
  const licenseKey = generateLicenseKey();
  const storeId = 'STORE_' + Date.now();
  
  // Calcular fecha de expiración
  let expirationDate = null;
  if (licenseType === 'trial') {
    expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 15);
  } else {
    expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
  }
  
  const newLicense = {
    licenseKey: licenseKey,
    storeId: storeId,
    storeName: storeName,
    storeAddress: storeAddress,
    ownerName: ownerName,
    ownerPhone: ownerPhone,
    ownerEmail: ownerEmail,
    licenseType: licenseType,
    createdDate: new Date().toISOString(),
    expirationDate: expirationDate.toISOString(),
    activated: false,
    activatedDate: null,
    deviceFingerprint: null,
    deviceType: null,
    notes: notes,
    status: 'Pendiente'
  };
  
  // Guardar en localStorage
  allLicenses.push(newLicense);
  localStorage.setItem('ventamaestra_all_licenses', JSON.stringify(allLicenses));
  
  // Mostrar resultado
  showGeneratedLicense(newLicense);
  
  // Limpiar formulario
  generateLicenseForm.reset();
  
  // Actualizar estadísticas y lista
  updateStats();
  renderLicenses();
}

function generateLicenseKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = '';
  
  for (let i = 0; i < 4; i++) {
    if (i > 0) key += '-';
    for (let j = 0; j < 4; j++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  
  return key;
}

function showGeneratedLicense(license) {
  // URL de la tienda en línea
  const baseUrl = window.location.origin;
  const storeUrl = `${baseUrl}/tienda.html?store=${license.storeId}`;
  
  document.getElementById('generatedLicenseKey').value = license.licenseKey;
  document.getElementById('generatedStoreUrl').textContent = storeUrl;
  
  licenseResultCard.classList.remove('hidden');
  
  // Scroll al resultado
  licenseResultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

window.copyLicenseKey = function() {
  const input = document.getElementById('generatedLicenseKey');
  input.select();
  document.execCommand('copy');
  alert('✅ Código de licencia copiado al portapapeles');
};

window.copyStoreUrl = function() {
  const text = document.getElementById('generatedStoreUrl').textContent;
  const temp = document.createElement('textarea');
  temp.value = text;
  document.body.appendChild(temp);
  temp.select();
  document.execCommand('copy');
  document.body.removeChild(temp);
  alert('✅ URL de tienda copiada al portapapeles');
};

window.closeResult = function() {
  licenseResultCard.classList.add('hidden');
};

function renderLicenses() {
  const search = searchLicenses.value.toLowerCase();
  
  const filtered = allLicenses.filter(license => {
    return license.storeName.toLowerCase().includes(search) ||
           license.ownerName.toLowerCase().includes(search) ||
           license.licenseKey.toLowerCase().includes(search) ||
           (license.storeAddress && license.storeAddress.toLowerCase().includes(search));
  });
  
  if (filtered.length === 0) {
    licensesList.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">No hay licencias generadas</p>';
    return;
  }
  
  // Ordenar por fecha de creación (más recientes primero)
  filtered.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
  
  licensesList.innerHTML = filtered.map(license => {
    const expired = isExpired(license);
    const status = expired ? 'expired' : (license.activated ? 'active' : 'inactive');
    const statusText = expired ? 'Expirada' : (license.activated ? 'Activa' : 'Pendiente');
    
    const createdDate = new Date(license.createdDate).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    
    const expirationDate = license.expirationDate ? new Date(license.expirationDate).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) : 'Sin límite';
    
    const activatedDate = license.activatedDate ? new Date(license.activatedDate).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'No activada';
    
    const typeLabels = {
      'trial': 'Prueba',
      'basic': 'Básica',
      'standard': 'Estándar',
      'premium': 'Premium'
    };
    
    const storeUrl = `${window.location.origin}/tienda.html?store=${license.storeId}`;
    
    return `
      <div class="license-item ${status}">
        <div class="license-header">
          <div>
            <div class="license-key">${license.licenseKey}</div>
            <div style="font-size: 0.9rem; color: #666; margin-top: 5px;">ID: ${license.storeId}</div>
          </div>
          <span class="license-status ${status}">${statusText}</span>
        </div>
        
        <div style="font-size: 1.1rem; font-weight: bold; margin: 10px 0;">
          🏪 ${license.storeName}
        </div>
        
        ${license.storeAddress ? `
        <div style="color: #666; margin-bottom: 10px;">
          📍 ${license.storeAddress}
        </div>
        ` : ''}
        
        <div class="license-info">
          <div class="license-info-item">
            <span class="license-info-label">Propietario:</span>
            <span>${license.ownerName}</span>
          </div>
          <div class="license-info-item">
            <span class="license-info-label">Tipo:</span>
            <span>${typeLabels[license.licenseType]}</span>
          </div>
          ${license.ownerPhone ? `
          <div class="license-info-item">
            <span class="license-info-label">Teléfono:</span>
            <span>${license.ownerPhone}</span>
          </div>
          ` : ''}
          ${license.ownerEmail ? `
          <div class="license-info-item">
            <span class="license-info-label">Email:</span>
            <span>${license.ownerEmail}</span>
          </div>
          ` : ''}
          <div class="license-info-item">
            <span class="license-info-label">Creada:</span>
            <span>${createdDate}</span>
          </div>
          <div class="license-info-item">
            <span class="license-info-label">Expira:</span>
            <span>${expirationDate}</span>
          </div>
          <div class="license-info-item">
            <span class="license-info-label">Activada:</span>
            <span>${activatedDate}</span>
          </div>
          ${license.deviceType ? `
          <div class="license-info-item">
            <span class="license-info-label">Dispositivo:</span>
            <span>${license.deviceType}</span>
          </div>
          ` : ''}
        </div>
        
        ${license.notes ? `
        <div style="background: #fff3cd; padding: 10px; border-radius: 6px; margin: 10px 0; font-size: 0.9rem;">
          <strong>📝 Notas:</strong> ${license.notes}
        </div>
        ` : ''}
        
        <div class="license-url">
          <div style="flex: 1;">
            <div style="font-size: 0.85rem; color: #666; margin-bottom: 5px;">🌐 URL Tienda en Línea:</div>
            <div class="license-url-text">${storeUrl}</div>
          </div>
          <button class="btn btn-primary" onclick="copyUrl('${storeUrl}')" style="width: auto; padding: 8px 16px;">📋</button>
        </div>
        
        <div class="license-actions">
          <button class="btn-success" onclick="viewLicenseDetails('${license.licenseKey}')">👁️ Ver Detalles</button>
          <button class="btn-primary" onclick="copyLicenseInfo('${license.licenseKey}')">📋 Copiar Info</button>
          ${license.activated ? `
            <button class="btn-warning" onclick="deactivateLicense('${license.licenseKey}')">🔓 Desactivar</button>
          ` : ''}
          <button class="btn-danger" onclick="deleteLicense('${license.licenseKey}')">🗑️ Eliminar</button>
        </div>
      </div>
    `;
  }).join('');
}

window.copyUrl = function(url) {
  const temp = document.createElement('textarea');
  temp.value = url;
  document.body.appendChild(temp);
  temp.select();
  document.execCommand('copy');
  document.body.removeChild(temp);
  alert('✅ URL copiada al portapapeles');
};

window.viewLicenseDetails = function(licenseKey) {
  const license = allLicenses.find(l => l.licenseKey === licenseKey);
  if (!license) return;
  
  const details = `
═══════════════════════════════════════
   VENTAMAESTRA 2.0 - LICENCIA
═══════════════════════════════════════

🔑 CÓDIGO: ${license.licenseKey}
🆔 ID TIENDA: ${license.storeId}

🏪 INFORMACIÓN DE LA TIENDA
───────────────────────────────────────
Nombre: ${license.storeName}
${license.storeAddress ? `Dirección: ${license.storeAddress}` : ''}

👤 PROPIETARIO
───────────────────────────────────────
Nombre: ${license.ownerName}
${license.ownerPhone ? `Teléfono: ${license.ownerPhone}` : ''}
${license.ownerEmail ? `Email: ${license.ownerEmail}` : ''}

📋 DETALLES DE LICENCIA
───────────────────────────────────────
Tipo: ${license.licenseType.toUpperCase()}
Estado: ${license.activated ? 'ACTIVADA' : 'PENDIENTE'}
Creada: ${new Date(license.createdDate).toLocaleString('es-MX')}
Expira: ${license.expirationDate ? new Date(license.expirationDate).toLocaleString('es-MX') : 'Sin límite'}
${license.activatedDate ? `Activada: ${new Date(license.activatedDate).toLocaleString('es-MX')}` : ''}
${license.deviceType ? `Dispositivo: ${license.deviceType}` : ''}

🌐 TIENDA EN LÍNEA
───────────────────────────────────────
${window.location.origin}/tienda.html?store=${license.storeId}

${license.notes ? `\n📝 NOTAS\n───────────────────────────────────────\n${license.notes}\n` : ''}
═══════════════════════════════════════
  `;
  
  alert(details);
};

window.copyLicenseInfo = function(licenseKey) {
  const license = allLicenses.find(l => l.licenseKey === licenseKey);
  if (!license) return;
  
  const storeUrl = `${window.location.origin}/tienda.html?store=${license.storeId}`;
  
  const info = `VENTAMAESTRA 2.0 - INFORMACIÓN DE LICENCIA

🏪 Tienda: ${license.storeName}
👤 Propietario: ${license.ownerName}
${license.ownerPhone ? `📞 Teléfono: ${license.ownerPhone}` : ''}

🔑 CÓDIGO DE LICENCIA:
${license.licenseKey}

📝 INSTRUCCIONES DE ACTIVACIÓN:
1. Abrir navegador en el equipo donde se instalará
2. Ir a: http://localhost:4000/licencias.html
3. Pegar el código de licencia de arriba
4. Click en "Activar Licencia"
5. ¡Listo! El sistema quedará bloqueado a ese equipo

🌐 URL TIENDA EN LÍNEA:
${storeUrl}

Comparta esta URL con sus clientes para que puedan hacer pedidos en línea.

⚠️ IMPORTANTE:
- La licencia solo se puede activar UNA VEZ
- Quedará bloqueada al equipo donde se active
- No se puede cambiar de dispositivo sin autorización
- Tipo: ${license.licenseType.toUpperCase()}
- Expira: ${license.expirationDate ? new Date(license.expirationDate).toLocaleDateString('es-MX') : 'Sin límite'}

Soporte: VentaMaestra 2.0`;
  
  const temp = document.createElement('textarea');
  temp.value = info;
  document.body.appendChild(temp);
  temp.select();
  document.execCommand('copy');
  document.body.removeChild(temp);
  
  alert('✅ Información completa de la licencia copiada al portapapeles.\n\nPuedes enviarla por WhatsApp, email o imprimirla para entregarla al cliente.');
};

window.deactivateLicense = function(licenseKey) {
  if (!confirm('⚠️ ¿Desactivar esta licencia?\n\nEsto permitirá que el cliente la active en otro dispositivo.')) {
    return;
  }
  
  const license = allLicenses.find(l => l.licenseKey === licenseKey);
  if (!license) return;
  
  license.activated = false;
  license.activatedDate = null;
  license.deviceFingerprint = null;
  license.deviceType = null;
  license.status = 'Pendiente';
  
  localStorage.setItem('ventamaestra_all_licenses', JSON.stringify(allLicenses));
  
  alert('✅ Licencia desactivada. El cliente puede activarla nuevamente en otro dispositivo.');
  
  updateStats();
  renderLicenses();
};

window.deleteLicense = function(licenseKey) {
  if (!confirm('⚠️ ¿ELIMINAR PERMANENTEMENTE esta licencia?\n\nEsta acción NO se puede deshacer.\nLa tienda perderá acceso al sistema.')) {
    return;
  }
  
  if (!confirm('¿Estás completamente seguro?\n\nTodo el acceso del cliente será revocado.')) {
    return;
  }
  
  allLicenses = allLicenses.filter(l => l.licenseKey !== licenseKey);
  localStorage.setItem('ventamaestra_all_licenses', JSON.stringify(allLicenses));
  
  alert('✅ Licencia eliminada permanentemente.');
  
  updateStats();
  renderLicenses();
};
