# 🔐 Sistema de Protección de Administrador - VentaMaestra 2.0

## Páginas Protegidas

Las siguientes páginas ahora requieren autenticación de administrador:

1. **Gestión de Licencias** (`licencias.html`) - Generación y gestión de licencias para sucursales
2. **Generador de APK** (`generar-apk.html`) - Herramienta para crear la app Android
3. **Panel Admin Global** (`admin.html`) - Panel de control de todas las sucursales

## Contraseña por Defecto

**Contraseña inicial:** `admin2025`

## Cómo Acceder

1. Intenta acceder a cualquiera de las páginas protegidas
2. Serás redirigido automáticamente a `admin-auth.html`
3. Ingresa la contraseña de administrador
4. La sesión durará 24 horas

## Cambiar la Contraseña

### Opción 1: Manual (Recomendado)
1. Abre el archivo: `www/admin-auth.html`
2. Busca la línea 135: `const ADMIN_PASSWORD = 'admin2025';`
3. Cambia `'admin2025'` por tu nueva contraseña
4. Guarda el archivo

Ejemplo:
```javascript
const ADMIN_PASSWORD = 'MiContraseñaSegura2025!';
```

### Opción 2: Usar la herramienta
1. Abre `config-password.html` en el navegador
2. Sigue las instrucciones en pantalla

## Cerrar Sesión

En cualquier página protegida encontrarás el botón **"🔒 Cerrar Sesión Admin"** que:
- Cierra tu sesión inmediatamente
- Te redirige al TPV principal
- Requerirá nueva autenticación para acceder nuevamente

## Características de Seguridad

✅ **Sesión temporal**: 24 horas de duración
✅ **Protección automática**: Redirige a login si no está autenticado
✅ **Validación en tiempo real**: Verifica la sesión al cargar cada página
✅ **Cierre de sesión manual**: Botón en todas las páginas protegidas

## Archivos Importantes

- `admin-auth.html` - Página de inicio de sesión (AQUÍ se cambia la contraseña)
- `admin-guard.js` - Script de protección (NO modificar)
- `config-password.html` - Herramienta auxiliar para cambiar contraseña

## Seguridad Adicional

Para mayor seguridad, considera:

1. **Cambiar la contraseña por defecto inmediatamente**
2. **Usar una contraseña fuerte** (mínimo 12 caracteres, con mayúsculas, minúsculas, números y símbolos)
3. **No compartir la contraseña** con usuarios que no sean administradores
4. **Cerrar sesión** cuando termines de usar las funciones administrativas

## Solución de Problemas

### "No puedo acceder, olvidé mi contraseña"
1. Abre `admin-auth.html` con un editor de texto
2. Busca `const ADMIN_PASSWORD`
3. Mira cuál es la contraseña actual o cámbiala

### "La sesión expira muy rápido"
- Las sesiones duran 24 horas por defecto
- Para cambiar la duración, edita la línea 132 de `admin-auth.html`:
  ```javascript
  const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 horas
  ```
  Por ejemplo, para 7 días: `(7 * 24 * 60 * 60 * 1000)`

### "Me redirige al login aunque ingresé la contraseña"
1. Verifica que la contraseña en `admin-auth.html` sea la correcta
2. Borra el caché del navegador
3. Cierra y vuelve a abrir el navegador

---

**Nota:** Este sistema de protección funciona a nivel del navegador. Para mayor seguridad en producción, considera implementar autenticación en el servidor.
