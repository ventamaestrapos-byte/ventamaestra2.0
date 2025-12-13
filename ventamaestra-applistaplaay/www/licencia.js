// Sistema de Licencia y Configuración por Equipo
// Cada instalación genera su propia licencia única

class LicenseManager {
  constructor() {
    this.storageKey = 'ventamaestra_license';
    this.configKey = 'ventamaestra_config';
  }

  // Generar código de licencia único
  generateLicenseCode() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    const machine = this.getMachineId();
    return `VM2-${timestamp}-${random}-${machine}`.toUpperCase();
  }

  // Generar ID de máquina basado en características del navegador
  getMachineId() {
    const nav = navigator;
    const screen = window.screen;
    const guid = nav.mimeTypes.length;
    const plugins = nav.plugins.length;
    const screenInfo = screen.height * screen.width + screen.colorDepth;
    
    const machineString = `${guid}${plugins}${screenInfo}${nav.userAgent}${nav.language}`;
    
    // Hash simple
    let hash = 0;
    for (let i = 0; i < machineString.length; i++) {
      const char = machineString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36).substring(0, 6);
  }

  // Verificar si ya existe licencia
  hasLicense() {
    const license = localStorage.getItem(this.storageKey);
    return license !== null;
  }

  // Obtener licencia actual
  getLicense() {
    const licenseData = localStorage.getItem(this.storageKey);
    if (!licenseData) return null;
    
    try {
      return JSON.parse(licenseData);
    } catch (e) {
      return null;
    }
  }

  // Crear nueva licencia
  createLicense(businessName, businessAddress, deliveryUrl) {
    const license = {
      code: this.generateLicenseCode(),
      businessName: businessName,
      businessAddress: businessAddress,
      deliveryUrl: deliveryUrl,
      activatedDate: new Date().toISOString(),
      machineId: this.getMachineId(),
      type: 'FULL',
      status: 'ACTIVE'
    };

    localStorage.setItem(this.storageKey, JSON.stringify(license));
    return license;
  }

  // Obtener configuración del negocio
  getConfig() {
    const config = localStorage.getItem(this.configKey);
    if (!config) return null;
    
    try {
      return JSON.parse(config);
    } catch (e) {
      return null;
    }
  }

  // Guardar configuración del negocio
  saveConfig(config) {
    localStorage.setItem(this.configKey, JSON.stringify(config));
  }

  // Verificar si necesita activación inicial
  needsActivation() {
    return !this.hasLicense();
  }

  // Obtener URL de pedidos a domicilio
  getDeliveryUrl() {
    const license = this.getLicense();
    return license ? license.deliveryUrl : '';
  }

  // Obtener nombre del negocio
  getBusinessName() {
    const license = this.getLicense();
    return license ? license.businessName : 'Mi Negocio';
  }

  // Exportar información de licencia (para respaldo)
  exportLicense() {
    const license = this.getLicense();
    const config = this.getConfig();
    
    return {
      license: license,
      config: config,
      exportDate: new Date().toISOString()
    };
  }

  // Importar licencia (desde respaldo)
  importLicense(data) {
    if (data.license) {
      localStorage.setItem(this.storageKey, JSON.stringify(data.license));
    }
    if (data.config) {
      localStorage.setItem(this.configKey, JSON.stringify(data.config));
    }
    return true;
  }
}

// Instancia global
const licenseManager = new LicenseManager();
