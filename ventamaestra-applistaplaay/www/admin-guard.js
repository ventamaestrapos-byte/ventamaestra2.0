/**
 * Admin Authentication Guard
 * Incluir este script al inicio de páginas protegidas
 */

(function() {
  const AUTH_TOKEN_KEY = 'ventamaestra_admin_auth';
  const AUTH_EXPIRY_KEY = 'ventamaestra_admin_auth_expiry';

  function checkAdminAuth() {
    const authToken = localStorage.getItem(AUTH_TOKEN_KEY);
    const expiryTime = parseInt(localStorage.getItem(AUTH_EXPIRY_KEY));
    
    // Verificar si existe autenticación válida
    if (!authToken || !expiryTime || Date.now() >= expiryTime) {
      // No autenticado o sesión expirada
      const currentPage = window.location.pathname.split('/').pop();
      window.location.href = `admin-auth.html?redirect=${currentPage}`;
      return false;
    }
    
    return true;
  }

  function logoutAdmin() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_EXPIRY_KEY);
    window.location.href = 'index.html';
  }

  // Verificar autenticación al cargar la página
  if (!checkAdminAuth()) {
    // Detener ejecución del resto de scripts
    throw new Error('Admin authentication required');
  }

  // Exponer función de logout globalmente
  window.logoutAdmin = logoutAdmin;
})();
