// Script común para verificar licencia en todas las páginas
(function() {
  window.addEventListener('DOMContentLoaded', function() {
    const trialAllowedPages = ['index.html', 'licencias.html', 'generador-licencias.html', 'compras.html', 'login.html', 'inicio.html', ''];
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (typeof LicenseManager === 'undefined') return;
    
    const licenseManager = new LicenseManager();
    const license = licenseManager.getLicense();
    
    if (!license && currentPage !== 'licencias.html' && currentPage !== 'generador-licencias.html') {
      window.location.href = 'licencias.html';
      return;
    }
    
    if (license) {
      const status = licenseManager.checkLicenseStatus();
      const isAllowed = trialAllowedPages.some(page => currentPage === page || currentPage.includes(page) || currentPage === '');
      
      if (status.type === 'TRIAL' && !isAllowed) {
        alert('🔒 FUNCIÓN NO DISPONIBLE EN PRUEBA\n\nDisponible: TPV y Compras\nBloqueado: Productos, Inventarios, etc.\n\nActiva licencia completa en Licencias.');
        window.location.href = 'index.html';
        return;
      }
      
      if (!status.valid && currentPage !== 'licencias.html' && currentPage !== 'generador-licencias.html') {
        window.location.href = 'licencias.html';
        return;
      }
    }
  });
})();
