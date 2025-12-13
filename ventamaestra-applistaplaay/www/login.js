let users = JSON.parse(localStorage.getItem('ventamaestra_users')) || [];
let currentPin = '';

const loginForm = document.getElementById('loginForm');
const loginUser = document.getElementById('loginUser');
const loginPassword = document.getElementById('loginPassword');
const pinDisplay = document.getElementById('pinDisplay');

// Cargar usuarios
loadUsers();

loginForm.addEventListener('submit', handleLogin);

function loadUsers() {
  loginUser.innerHTML = '<option value="">Selecciona usuario...</option>';
  
  users.filter(u => u.active).forEach(user => {
    const option = document.createElement('option');
    option.value = user.id;
    option.textContent = `${user.name} (${getRoleLabel(user.role)})`;
    loginUser.appendChild(option);
  });
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

function handleLogin(e) {
  e.preventDefault();
  
  const userId = parseInt(loginUser.value);
  const password = loginPassword.value;
  
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    alert('Usuario no encontrado.');
    return;
  }
  
  if (!user.active) {
    alert('Este usuario está inactivo. Contacta al administrador.');
    return;
  }
  
  if (user.password !== password) {
    alert('Contraseña incorrecta.');
    loginPassword.value = '';
    return;
  }
  
  loginSuccess(user);
}

window.addPinDigit = function(digit) {
  if (currentPin.length < 4) {
    currentPin += digit;
    updatePinDisplay();
    
    if (currentPin.length === 4) {
      setTimeout(() => {
        loginWithPin();
      }, 300);
    }
  }
};

window.clearPin = function() {
  currentPin = '';
  updatePinDisplay();
};

window.loginWithPin = function() {
  if (currentPin.length !== 4) {
    alert('El PIN debe tener 4 dígitos.');
    return;
  }
  
  const user = users.find(u => u.pin === currentPin && u.active);
  
  if (!user) {
    alert('PIN incorrecto o usuario inactivo.');
    clearPin();
    return;
  }
  
  loginSuccess(user);
};

function updatePinDisplay() {
  if (currentPin.length === 0) {
    pinDisplay.textContent = '••••';
  } else {
    pinDisplay.textContent = '•'.repeat(currentPin.length) + '·'.repeat(4 - currentPin.length);
  }
}

function loginSuccess(user) {
  // Verificar restricciones de dispositivo móvil
  const license = JSON.parse(localStorage.getItem('ventamaestra_license'));
  
  if (license && license.deviceType === 'Móvil') {
    // En dispositivos móviles solo permitir gestión, NO ventas
    if (window.location.href.includes('index.html') || 
        window.location.search.includes('tpv') ||
        !window.location.pathname.match(/(productos|inventarios|compras|kardex|usuarios)\.html$/)) {
      alert('⚠️ RESTRICCIÓN MÓVIL\n\nLas ventas no están permitidas en dispositivos móviles.\n\nPuedes acceder a:\n✅ Productos\n✅ Inventario\n✅ Compras\n✅ Kárdex\n✅ Usuarios\n\n❌ NO PUEDES realizar ventas desde este dispositivo.');
      
      // Redirigir a productos en lugar del TPV
      localStorage.setItem('ventamaestra_current_user', JSON.stringify(user));
      window.location.href = 'productos.html';
      return;
    }
  }
  
  localStorage.setItem('ventamaestra_current_user', JSON.stringify(user));
  
  // Registrar inicio de sesión
  const loginRecord = {
    userId: user.id,
    userName: user.name,
    loginTime: new Date().toISOString(),
    deviceType: license ? license.deviceType : 'Desconocido'
  };
  
  const loginHistory = JSON.parse(localStorage.getItem('ventamaestra_login_history')) || [];
  loginHistory.push(loginRecord);
  localStorage.setItem('ventamaestra_login_history', JSON.stringify(loginHistory));
  
  // Redirigir al TPV (o donde se solicitó)
  const redirectTo = new URLSearchParams(window.location.search).get('redirect') || 'index.html';
  window.location.href = redirectTo;
}
