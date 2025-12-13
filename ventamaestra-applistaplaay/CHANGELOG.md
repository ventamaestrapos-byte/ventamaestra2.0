# 📋 Registro de Cambios - VentaMaestra 2.0

## Versión 2.1.0 - 13 de Diciembre, 2025

### ✨ Nuevas Funcionalidades

#### 🔐 Sistema de Protección de Administrador
- Agregada autenticación con contraseña para páginas administrativas
- Páginas protegidas:
  - Gestión de Licencias (`licencias.html`)
  - Generador de APK (`generar-apk.html`)
  - Panel Admin Global (`admin.html`)
- Contraseña por defecto: `admin2025`
- Sesión de 24 horas con cierre de sesión manual
- Sistema de cambio de contraseña desde la interfaz

#### 📦 Mejoras en Productos
- Campos obligatorios reducidos a solo 3: Nombre, Código y Precio
- Validación mejorada con mensajes de error claros
- Campo "Tipo de Unidad" corregido (Pieza/Kilo/Granel/Litro)
- Formulario más ágil para agregar productos rápidamente

### 🔧 Archivos Nuevos
- `admin-auth.html` - Página de autenticación de administrador
- `admin-guard.js` - Script de protección para páginas administrativas
- `config-password.html` - Herramienta para cambiar contraseña
- `ADMIN-SECURITY-README.md` - Documentación del sistema de seguridad
- `CHANGELOG.md` - Este archivo

### 🛠️ Correcciones de Bugs
- Corregido error en formulario de productos (campo duplicado)
- Corregida estructura del campo "Tipo de Unidad" en HTML
- Mejorada validación de campos obligatorios

### 📱 Actualizaciones de Metadata
- Versión actualizada a 2.1.0 en todos los archivos de configuración
- Mejorada descripción en `manifest.json`
- Actualizado `config.xml` con información del producto
- Actualizado `package.json` con keywords relevantes

---

## Versión 1.0.0 - Inicial

### Funcionalidades Base
- 🛒 Sistema de Punto de Venta (TPV)
- 📊 Gestión de Inventarios
- 📦 Gestión de Productos
- 🛍️ Gestión de Compras
- 📋 Gestión de Pedidos
- 🎁 Gestión de Promociones
- 💳 Sistema de Tienda Online
- 👥 Gestión de Usuarios
- 📈 Kardex de movimientos
- 🔐 Sistema de Licencias
- 📱 PWA (Progressive Web App)
- 🤖 Soporte para Android (Cordova)

---

## 🚀 Próximas Versiones

### Versión 2.2.0 (Planificada)
- [ ] Sistema de reportes avanzados
- [ ] Exportación de datos a Excel
- [ ] Gráficas de ventas
- [ ] Notificaciones push
- [ ] Modo offline completo

### Versión 2.3.0 (Planificada)
- [ ] Integración con impresoras térmicas
- [ ] Lector de código de barras
- [ ] Sistema de facturas electrónicas
- [ ] API REST para integraciones

---

**Nota:** Para más información sobre las características de seguridad, consulta `ADMIN-SECURITY-README.md`
