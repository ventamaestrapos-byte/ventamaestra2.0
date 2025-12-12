# VentaMaestra 2.0 - Sistema Multi-Tienda

Sistema completo de punto de venta (TPV) con gestión multi-tienda, licencias bloqueadas por dispositivo y tienda en línea.

## 🚀 Iniciar el Sistema

Ejecutar `setup.bat` para iniciar el servidor en http://localhost:4000

---

## 📱 GENERAR APK ANDROID

### Opción 1: PWA Builder (Más Fácil - Recomendado)

1. Abre http://localhost:4000/generar-apk.html
2. Sigue las instrucciones para PWA Builder
3. Sube tu aplicación a pwabuilder.com
4. Descarga el APK generado

### Opción 2: Cordova (Profesional)

**Requisitos previos:**
- Node.js instalado (https://nodejs.org/)
- Java JDK 8+ (opcional, para compilar)
- Android SDK (opcional, para compilar)

**Ejecución automática:**

```batch
# Opción 1: Script Batch
generar-apk.bat

# Opción 2: Script PowerShell
.\generar-apk.ps1
```

El script automáticamente:
1. ✅ Verifica Node.js
2. ✅ Instala Cordova si no está instalado
3. ✅ Crea proyecto Cordova
4. ✅ Agrega plataforma Android
5. ✅ Copia todos los archivos
6. ✅ Genera el APK: `VentaMaestra-2.0.apk`

### Opción 3: ApkOnline (Sin Instalaciones)

1. Comprime toda la carpeta en un ZIP
2. Ve a https://www.apkonline.net/es/apk-maker
3. Sube el ZIP
4. Configura nombre e icono
5. Descarga tu APK

### PWA - Instalar como App Web

La aplicación ya está configurada como PWA:
- En Chrome Android: Menú → "Instalar aplicación"
- En Edge: Menú → "Aplicaciones" → "Instalar sitio"
- Funciona offline después de la primera carga

---

## 🎯 PARA TI COMO DUEÑO DE LA APLICACIÓN

### Panel de Administración Global (admin.html)

Este es **TU PANEL EXCLUSIVO** para gestionar todas las licencias y tiendas.

**Acceso**: http://localhost:4000/admin.html

**Contraseña Maestra**: `VentaMaestra2024!Admin`

#### ¿Qué puedes hacer aquí?

1. **Generar Licencias** para tus clientes
   - Crear códigos únicos (XXXX-XXXX-XXXX-XXXX)
   - Establecer tipos: Prueba, Básica, Estándar, Premium
   - Configurar fechas de expiración automáticas

2. **Generar URLs de Tienda** automáticamente
   - Cada licencia genera su URL única
   - Formato: `http://localhost:4000/tienda.html?store=STORE_123456`
   - Lista para compartir con el cliente

3. **Gestionar Todas las Tiendas**
   - Ver estadísticas: Total, Activas, Expiradas, Pendientes
   - Buscar por nombre, propietario, código
   - Ver detalles completos de cada licencia
   - Copiar información para enviar al cliente

4. **Administración de Licencias**
   - Desactivar licencias (permite mover a otro dispositivo)
   - Eliminar licencias permanentemente
   - Ver en qué dispositivo está activada cada una
   - Consultar fechas de activación y expiración

#### Flujo de Trabajo Recomendado:

1. **Cliente te contacta** para comprar VentaMaestra
2. **Accedes a admin.html** con tu contraseña maestra
3. **Generas la licencia** con sus datos (tienda, propietario, tipo)
4. **Sistema genera automáticamente**:
   - Código de licencia único
   - URL de tienda en línea única
5. **Copias y envías** toda la información al cliente
6. **Cliente activa** en su equipo (queda bloqueado)
7. **Monitoreas** el estado desde tu panel

---

## 📋 Módulos del Sistema (Para los Clientes)

### TPV Principal (index.html)
- Ventas con F1-F11 shortcuts
- Búsqueda rápida de productos
- Aplicación automática de promociones
- Control de permisos por usuario
- Integración con kárdex

### Gestión de Productos (productos.html)
- Alta, baja y modificación de productos
- Control de inventarios
- Familias de productos
- Códigos de barras

### Compras (compras.html)
- Registro de compras a proveedores
- Actualización automática de inventario
- Integración con kárdex

### Kárdex (kardex.html)
- Seguimiento de movimientos de inventario
- Registro automático de entradas y salidas
- Exportación a CSV

### Promociones (promociones.html)
- Descuentos porcentuales o fijos
- Promociones 2x1, 3x2
- Aplicación automática en ventas

### Usuarios y Permisos (usuarios.html)
- 4 roles: Dueño, Admin, Cajero, Almacén
- 15 permisos granulares
- Login con contraseña o PIN de 4 dígitos

### **Licencias** (licencias.html) ⭐ NUEVO
Sistema de licenciamiento multi-tienda con bloqueo por dispositivo.

#### Características:
- **Huella digital del dispositivo**: Cada licencia se bloquea permanentemente al dispositivo donde se activa
- **Tipos de licencia**: Trial (15 días), Básica, Estándar, Premium
- **Tipos de dispositivo**: 
  - Escritorio/Laptop: Acceso completo
  - Tablet: Acceso completo
  - **Móvil**: Solo gestión (NO ventas)
- **Configuración por tienda**: Cada sucursal tiene su propia configuración independiente

#### Uso:
1. Al iniciar el sistema por primera vez, serás redirigido a licencias.html
2. **Activar con código de licencia** (formato: XXXX-XXXX-XXXX-XXXX)
3. La licencia quedará bloqueada a ese dispositivo
4. No se puede transferir a otro equipo sin desactivación administrativa

#### Generar Licencias (Admin):
1. Ingresar contraseña maestra: `master2024`
2. Completar datos de la tienda
3. El sistema generará un código único XXXX-XXXX-XXXX-XXXX
4. Entregar el código al cliente para activación

### **Tienda en Línea** (tienda.html) ⭐ NUEVO
Cada tienda obtiene su propia URL para pedidos en línea.

#### URL Format:
```
http://localhost:4000/tienda.html?store=STORE_123456
```

#### Características para Clientes:
- Catálogo de productos con stock disponible
- Carrito de compras
- Opciones de entrega: Recoger o Domicilio
- Métodos de pago: Efectivo o Tarjeta
- Tracking de pedidos

#### Configuración (desde licencias.html):
- Habilitar/deshabilitar entrega a domicilio o recoger
- Configurar costo de envío
- Pedido mínimo
- Aceptar efectivo/tarjeta
- Personalizar colores y logo

### **Gestión de Pedidos Web** (pedidos.html) ⭐ NUEVO
Panel para administrar pedidos recibidos en línea.

#### Características:
- Vista en tiempo real de pedidos
- Estados: Pendiente → Preparando → Listo → Entregado
- Filtros por estado, tipo de entrega, fecha
- Búsqueda por cliente o número de pedido
- Impresión de pedidos
- **Reducción automática de inventario** al marcar como entregado
- Registro automático en kárdex

#### Flujo de Trabajo:
1. Cliente realiza pedido en tienda.html
2. Pedido aparece en pedidos.html con estado "Pendiente"
3. Cajero marca como "Preparando"
4. Al terminar, marca "Listo"
5. Al entregar/confirmar, marca "Entregado"
   - Se reduce inventario automáticamente
   - Se registra en kárdex como "Salida - Venta en línea"

## 🔐 Restricciones de Dispositivos

### Escritorio/Laptop/Tablet:
✅ Acceso completo a todas las funciones
✅ Realizar ventas en TPV
✅ Gestión de productos, inventarios, compras
✅ Ver pedidos en línea

### Móvil:
✅ Productos (ajustar precios, agregar)
✅ Inventario (consultar, ajustar)
✅ Compras (registrar)
✅ Kárdex (consultar)
✅ Usuarios (gestionar)
❌ **NO PUEDE** realizar ventas en TPV
❌ **NO PUEDE** cobrar en caja

**Nota**: Si intentas acceder al TPV desde un dispositivo móvil licenciado, serás redirigido automáticamente a productos.html

## 📦 Arquitectura Multi-Tienda

### Independencia Total:
Cada tienda (sucursal) tiene datos completamente independientes:
- Productos separados: `ventamaestra_products_{storeId}`
- Pedidos separados: `ventamaestra_online_orders_{storeId}`
- Configuración separada: `ventamaestra_store_config_{storeId}`
- Usuarios pueden ser compartidos o independientes

### Sincronización:
- NO hay sincronización automática entre tiendas
- Cada dispositivo tiene su propia base de datos local (localStorage)
- Ideal para negocios con múltiples sucursales independientes

## 🎯 Casos de Uso

### Tienda Individual:
1. Activar licencia en dispositivo principal (PC/laptop)
2. Configurar productos e inventario
3. Activar tienda en línea desde licencias.html
4. Compartir URL de tienda con clientes
5. Gestionar pedidos desde pedidos.html

### Cadena Multi-Tienda:
1. Crear licencia para cada sucursal (storeId único)
2. Cada sucursal activa su licencia en su dispositivo
3. Cada tienda opera independientemente
4. Cada una tiene su propia URL de tienda en línea
5. No hay interferencia entre sucursales

### Uso Móvil:
1. Activar licencia en dispositivo móvil
2. Usar SOLO para gestión (precios, inventarios, compras)
3. NO intentar hacer ventas (será bloqueado)
4. Ideal para encargados que ajustan precios en piso de venta

## 🔧 Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript Vanilla
- **Almacenamiento**: localStorage (cliente)
- **Servidor**: Python 3 http.server
- **Seguridad**: SHA-256 device fingerprinting
- **Sin dependencias**: No requiere Node.js, npm, ni frameworks

## 📝 Notas Importantes

1. **Una vez activada una licencia, queda bloqueada al dispositivo**
2. **No se puede mover a otro equipo** sin contactar administrador
3. La contraseña maestra para crear licencias es: `master2024`
4. Los datos se almacenan localmente (no hay base de datos central)
5. Cada tienda debe compartir su URL única con clientes
6. Los pedidos en línea NO reducen inventario hasta marcarlos como "Entregado"

## 📞 Soporte

Para desbloquear una licencia o transferirla a otro dispositivo, contactar al administrador con:
- Código de licencia
- Nombre de la tienda
- Motivo de la transferencia

---

**VentaMaestra 2.0** - Sistema completo de gestión comercial multi-tienda
