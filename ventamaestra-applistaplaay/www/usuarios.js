// Variables globales
let users = JSON.parse(localStorage.getItem('ventamaestra_users')) || [];
let editingUserId = null;
let currentFilter = 'active';

// Permisos disponibles
const allPermissions = [
  'permModifyPrice', 'permEditProduct', 'permDeleteProduct', 'permViewProfit',
  'permViewCashCut', 'permGiveCourtesy', 'permMakeDiscounts', 'permViewCardex',
  'permAddUser', 'permViewInventory', 'permCancelSale', 'permWithdrawal',
  'permPurchases', 'permPromotions', 'permReports'
];

// Referencias DOM
const userForm = document.getElementById('userForm');
const formTitle = document.getElementById('formTitle');
const userName = document.getElementById('userName');
const userRole = document.getElementById('userRole');
const userUsername = document.getElementById('userUsername');
const userPassword = document.getElementById('userPassword');
const userPin = document.getElementById('userPin');
const userActive = document.getElementById('userActive');
const permissionsSection = document.getElementById('permissionsSection');
const btnCancelEdit = document.getElementById('btnCancelEdit');
const btnSelectAll = document.getElementById('btnSelectAll');
const btnDeselectAll = document.getElementById('btnDeselectAll');
const usersList = document.getElementById('usersList');
const searchUser = document.getElementById('searchUser');
const filterActiveUsers = document.getElementById('filterActiveUsers');
const filterAllUsers = document.getElementById('filterAllUsers');

// Event Listeners
userForm.addEventListener('submit', handleSaveUser);
btnCancelEdit.addEventListener('click', cancelEdit);
searchUser.addEventListener('input', renderUsers);
userRole.addEventListener('change', handleRoleChange);
btnSelectAll.addEventListener('click', selectAllPermissions);
btnDeselectAll.addEventListener('click', deselectAllPermissions);

filterActiveUsers.addEventListener('click', () => {
  currentFilter = 'active';
  updateFilterButtons();
  renderUsers();
});

filterAllUsers.addEventListener('click', () => {
  currentFilter = 'all';
  updateFilterButtons();
  renderUsers();
});

// Inicialización
init();

function init() {
  // Crear usuario dueño por defecto si no existe
  if (users.length === 0) {
    const owner = {
      id: Date.now(),
      name: 'Administrador',
      role: 'owner',
      username: 'admin',
      password: 'admin123',
      pin: '0000',
      active: true,
      permissions: {},
      createdAt: new Date().toISOString()
    };
    users.push(owner);
    localStorage.setItem('ventamaestra_users', JSON.stringify(users));
  }
  
  renderUsers();
  updateFilterButtons();
}

function handleRoleChange() {
  const role = userRole.value;
  
  if (role === 'owner' || role === 'admin') {
    permissionsSection.style.display = 'none';
    // Dueño y admin tienen todos los permisos
  } else if (role === 'cashier' || role === 'stock') {
    permissionsSection.style.display = 'block';
    
    if (role === 'cashier') {
      // Permisos predeterminados para cajero
      setDefaultCashierPermissions();
    } else if (role === 'stock') {
      // Permisos predeterminados para almacén
      setDefaultStockPermissions();
    }
  } else {
    permissionsSection.style.display = 'none';
  }
}

function setDefaultCashierPermissions() {
  deselectAllPermissions();
  document.getElementById('permViewCashCut').checked = true;
  document.getElementById('permCancelSale').checked = false;
  document.getElementById('permViewInventory').checked = true;
}

function setDefaultStockPermissions() {
  deselectAllPermissions();
  document.getElementById('permViewInventory').checked = true;
  document.getElementById('permEditProduct').checked = true;
  document.getElementById('permPurchases').checked = true;
  document.getElementById('permViewCardex').checked = true;
}

function selectAllPermissions() {
  allPermissions.forEach(perm => {
    const checkbox = document.getElementById(perm);
    if (checkbox) checkbox.checked = true;
  });
}

function deselectAllPermissions() {
  allPermissions.forEach(perm => {
    const checkbox = document.getElementById(perm);
    if (checkbox) checkbox.checked = false;
  });
}

function handleSaveUser(e) {
  e.preventDefault();
  
  // Validar que el username no exista
  const existingUser = users.find(u => 
    u.username.toLowerCase() === userUsername.value.toLowerCase() && 
    u.id !== editingUserId
  );
  
  if (existingUser) {
    alert('Este nombre de usuario ya está en uso. Elige otro.');
    return;
  }
  
  // Recopilar permisos
  const permissions = {};
  if (userRole.value === 'cashier' || userRole.value === 'stock') {
    allPermissions.forEach(perm => {
      const checkbox = document.getElementById(perm);
      if (checkbox) {
        permissions[perm] = checkbox.checked;
      }
    });
  }
  
  const user = {
    id: editingUserId || Date.now(),
    name: userName.value.trim(),
    role: userRole.value,
    username: userUsername.value.trim(),
    password: userPassword.value,
    pin: userPin.value || '',
    active: userActive.checked,
    permissions: permissions,
    createdAt: editingUserId ? users.find(u => u.id === editingUserId).createdAt : new Date().toISOString(),
    lastModified: new Date().toISOString()
  };
  
  if (editingUserId) {
    const index = users.findIndex(u => u.id === editingUserId);
    users[index] = user;
    alert('Usuario actualizado correctamente.');
  } else {
    users.push(user);
    alert('Usuario registrado correctamente.');
  }
  
  localStorage.setItem('ventamaestra_users', JSON.stringify(users));
  localStorage.setItem('ventamaestra_current_user', JSON.stringify(user)); // Usuario actual
  resetForm();
  renderUsers();
}

function resetForm() {
  userForm.reset();
  editingUserId = null;
  btnCancelEdit.style.display = 'none';
  formTitle.textContent = 'Nuevo Usuario/Cajero';
  permissionsSection.style.display = 'none';
  userActive.checked = true;
  userPassword.required = true;
}

function cancelEdit() {
  resetForm();
}

function renderUsers() {
  const query = searchUser.value.toLowerCase();
  
  let filtered = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(query) || 
                         user.username.toLowerCase().includes(query) ||
                         user.role.toLowerCase().includes(query);
    
    if (!matchesSearch) return false;
    
    if (currentFilter === 'active') {
      return user.active;
    }
    
    return true;
  });
  
  if (filtered.length === 0) {
    usersList.innerHTML = '<p style="text-align: center; color: #777; padding: 20px;">No hay usuarios registrados.</p>';
    return;
  }
  
  usersList.innerHTML = filtered.map(user => {
    const roleLabel = getRoleLabel(user.role);
    const roleColor = getRoleColor(user.role);
    const permCount = Object.values(user.permissions || {}).filter(p => p).length;
    
    return `
      <div class="user-card" style="background: ${user.active ? '#fff' : '#f5f5f5'}; border: 2px solid ${user.active ? roleColor : '#e0e0e0'}; border-radius: 8px; padding: 15px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
          <div>
            <h4 style="margin: 0 0 5px 0; color: ${user.active ? '#333' : '#999'};">
              ${user.name}
              <span style="background: ${roleColor}; color: white; font-size: 0.7rem; padding: 2px 8px; border-radius: 4px; margin-left: 8px;">
                ${roleLabel}
              </span>
              ${!user.active ? '<span style="background: #999; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; margin-left: 8px;">INACTIVO</span>' : ''}
            </h4>
            <p style="margin: 0; font-size: 0.85rem; color: #666;">
              <strong>Usuario:</strong> ${user.username}
            </p>
          </div>
          <div style="display: flex; gap: 6px;">
            <button class="cmd-btn" onclick="editUser(${user.id})" style="padding: 6px 10px; font-size: 0.8rem;">✏️</button>
            ${user.role !== 'owner' ? `<button class="cmd-btn cmd-danger" onclick="deleteUser(${user.id})" style="padding: 6px 10px; font-size: 0.8rem;">🗑️</button>` : ''}
          </div>
        </div>
        
        <div style="font-size: 0.85rem; color: #555;">
          ${user.pin ? `<p style="margin: 4px 0;">🔢 PIN: ••••</p>` : ''}
          <p style="margin: 4px 0;">📅 Registrado: ${formatDate(user.createdAt)}</p>
          
          ${(user.role === 'cashier' || user.role === 'stock') ? `
            <div style="margin-top: 10px; padding: 10px; background: #f9f9f9; border-radius: 6px;">
              <strong style="font-size: 0.9rem;">🔐 Permisos (${permCount}):</strong>
              <div style="margin-top: 8px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 6px; font-size: 0.8rem;">
                ${getPermissionsDisplay(user.permissions)}
              </div>
            </div>
          ` : '<p style="margin: 10px 0 0 0; color: #4caf50; font-weight: 600;">✅ Acceso Total</p>'}
        </div>
      </div>
    `;
  }).join('');
}

function getRoleLabel(role) {
  const labels = {
    owner: 'Dueño',
    admin: 'Administrador',
    cashier: 'Cajero',
    stock: 'Almacén'
  };
  return labels[role] || role;
}

function getRoleColor(role) {
  const colors = {
    owner: '#d32f2f',
    admin: '#1976d2',
    cashier: '#388e3c',
    stock: '#f57c00'
  };
  return colors[role] || '#757575';
}

function getPermissionsDisplay(permissions) {
  if (!permissions || Object.keys(permissions).length === 0) {
    return '<span style="color: #999;">Sin permisos asignados</span>';
  }
  
  const labels = {
    permModifyPrice: '💰 Modificar Precio',
    permEditProduct: '✏️ Editar Productos',
    permDeleteProduct: '🗑️ Dar de Baja',
    permViewProfit: '📊 Ver Ganancia',
    permViewCashCut: '💵 Ver Corte',
    permGiveCourtesy: '🎁 Cortesías',
    permMakeDiscounts: '🏷️ Descuentos',
    permViewCardex: '📋 Kárdex',
    permAddUser: '👥 Agregar Usuarios',
    permViewInventory: '📦 Inventarios',
    permCancelSale: '❌ Cancelar Ventas',
    permWithdrawal: '💸 Retiros',
    permPurchases: '🛒 Compras',
    permPromotions: '🎁 Promociones',
    permReports: '📈 Reportes'
  };
  
  return Object.entries(permissions)
    .filter(([key, value]) => value)
    .map(([key]) => `<span style="padding: 3px 6px; background: #e8f5e9; border-radius: 4px; white-space: nowrap;">${labels[key] || key}</span>`)
    .join('');
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function updateFilterButtons() {
  filterActiveUsers.style.background = currentFilter === 'active' ? 'var(--orange)' : '#eeeeee';
  filterActiveUsers.style.color = currentFilter === 'active' ? '#fff' : '#333';
  
  filterAllUsers.style.background = currentFilter === 'all' ? 'var(--orange)' : '#eeeeee';
  filterAllUsers.style.color = currentFilter === 'all' ? '#fff' : '#333';
}

window.editUser = function(id) {
  const user = users.find(u => u.id === id);
  if (!user) return;
  
  editingUserId = id;
  formTitle.textContent = 'Editar Usuario';
  userName.value = user.name;
  userRole.value = user.role;
  userUsername.value = user.username;
  userPassword.value = user.password;
  userPassword.required = false;
  userPin.value = user.pin || '';
  userActive.checked = user.active;
  
  handleRoleChange();
  
  // Cargar permisos
  if (user.permissions && (user.role === 'cashier' || user.role === 'stock')) {
    Object.entries(user.permissions).forEach(([key, value]) => {
      const checkbox = document.getElementById(key);
      if (checkbox) checkbox.checked = value;
    });
  }
  
  btnCancelEdit.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteUser = function(id) {
  const user = users.find(u => u.id === id);
  if (!user) return;
  
  if (user.role === 'owner') {
    alert('No se puede eliminar al dueño del sistema.');
    return;
  }
  
  if (!confirm(`¿Eliminar usuario "${user.name}"?`)) return;
  
  users = users.filter(u => u.id !== id);
  localStorage.setItem('ventamaestra_users', JSON.stringify(users));
  renderUsers();
};
