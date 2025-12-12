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
  createLicense(businessName, businessAddress, deliveryUrl, isPaid = false) {
    const now = new Date();
    const expirationDate = new Date(now);
    expirationDate.setDate(expirationDate.getDate() + (isPaid ? 365 : 15)); // 15 días trial o 1 año pagada
    
    const license = {
      code: this.generateLicenseCode(),
      businessName: businessName,
      businessAddress: businessAddress,
      deliveryUrl: deliveryUrl,
      activatedDate: now.toISOString(),
      expirationDate: expirationDate.toISOString(),
      machineId: this.getMachineId(),
      type: isPaid ? 'FULL' : 'TRIAL',
      status: 'ACTIVE',
      daysRemaining: isPaid ? 365 : 15
    };

    localStorage.setItem(this.storageKey, JSON.stringify(license));
    return license;
  }

  // Verificar estado de la licencia
  checkLicenseStatus() {
    const license = this.getLicense();
    if (!license) return { valid: false, status: 'NO_LICENSE', daysRemaining: 0 };

    const now = new Date();
    const expirationDate = new Date(license.expirationDate);
    const daysRemaining = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 0) {
      license.status = 'EXPIRED';
      license.daysRemaining = 0;
      localStorage.setItem(this.storageKey, JSON.stringify(license));
      return { valid: false, status: 'EXPIRED', daysRemaining: 0, type: license.type };
    }

    license.daysRemaining = daysRemaining;
    localStorage.setItem(this.storageKey, JSON.stringify(license));
    
    return { 
      valid: true, 
      status: 'ACTIVE', 
      daysRemaining: daysRemaining,
      type: license.type,
      businessName: license.businessName,
      code: license.code
    };
  }

  // Activar licencia pagada
  activatePaidLicense(licenseCode) {
    const license = this.getLicense();
    if (!license) return false;

    // Verificar formato del código de licencia
    if (!licenseCode.startsWith('VM2-PRO-')) {
      return { success: false, message: 'Código de licencia inválido' };
    }

    const now = new Date();
    const expirationDate = new Date(now);
    expirationDate.setDate(expirationDate.getDate() + 365); // 1 año

    license.type = 'FULL';
    license.status = 'ACTIVE';
    license.code = licenseCode;
    license.expirationDate = expirationDate.toISOString();
    license.daysRemaining = 365;
    license.upgradedDate = now.toISOString();

    localStorage.setItem(this.storageKey, JSON.stringify(license));
    return { success: true, message: 'Licencia activada exitosamente', daysRemaining: 365 };
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
