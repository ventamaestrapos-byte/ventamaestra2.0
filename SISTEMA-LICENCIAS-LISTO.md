# 🎉 Sistema de Licencias - VentaMaestra 2.0

## ✅ ¡Implementación Completada!

Se ha implementado exitosamente el sistema de licencias con prueba gratuita de 15 días.

---

## 📋 ¿Qué se implementó?

### 1. **Prueba Gratuita de 15 Días**
- ✅ Activación automática al primer uso
- ✅ Cuenta regresiva diaria visible
- ✅ Bloqueo automático después de 15 días
- ✅ Alertas cuando quedan 7 días o menos

### 2. **Sistema de Activación de Licencias**
- ✅ Códigos de licencia únicos formato: `VM2-PRO-XXXXX-XXXX-XXX`
- ✅ Validación de códigos
- ✅ Conversión de Trial a Full (1 año)
- ✅ Exportar/importar licencias

### 3. **Generador de Licencias (Administrador)**
- ✅ Crear licencias Trial (15 días)
- ✅ Crear licencias Full (1, 2, 3 años o perpetua)
- ✅ Registro de todas las licencias generadas
- ✅ Información del cliente (negocio, contacto)

### 4. **Banner de Advertencia**
- ✅ Mostrar días restantes en la app principal
- ✅ Cambio de color según urgencia:
  - 🟡 Amarillo: más de 3 días restantes
  - 🔴 Rojo: 3 días o menos
- ✅ Link directo a activación de licencia

---

## 🚀 Cómo Usar

### Para el Cliente (Primera Vez):

1. **Abrir la aplicación**: http://192.168.1.101:3000
2. La app detectará que no hay licencia y redirigirá automáticamente a la página de licencias
3. **Llenar el formulario**:
   - Nombre del negocio
   - Dirección
4. **Clic en "Iniciar Prueba Gratuita"**
5. ¡Listo! Ya pueden usar la app por 15 días

### Para el Cliente (Activar Licencia Completa):

1. **Solicitar código de licencia** al administrador
2. **Ir a "Licencias"** desde el menú principal
3. **Ingresar el código** en el campo "Código de Licencia Full"
4. **Clic en "Activar Licencia"**
5. La licencia se extiende por 1 año más

### Para el Administrador (Generar Licencias):

1. **Abrir**: http://192.168.1.101:3000/generador-licencias.html
2. **Llenar datos del cliente**:
   - Nombre del negocio
   - Contacto (email o teléfono)
   - Tipo de licencia (Trial o Full)
   - Duración (1, 2, 3 años o perpetua)
3. **Clic en "Generar Licencia"**
4. **Copiar o descargar** el código generado
5. **Enviar el código** al cliente

---

## 📱 Páginas Disponibles

### Cliente:
- **TPV Principal**: http://192.168.1.101:3000/
- **Gestión de Licencias**: http://192.168.1.101:3000/licencias.html

### Administrador:
- **Generador de Licencias**: http://192.168.1.101:3000/generador-licencias.html

---

## 🔔 Comportamiento del Sistema

### Días Restantes:
- **15-8 días**: Sin advertencia
- **7-4 días**: Banner amarillo con cuenta regresiva
- **3-1 días**: Banner rojo con advertencia urgente
- **0 días**: Bloqueo total, redirección a activación

### Bloqueo al Expirar:
Cuando la prueba expira:
1. Aparece mensaje emergente
2. Se bloquea el acceso al TPV
3. Redirección automática a página de licencias
4. Solo se puede activar licencia completa

---

## 💡 Ejemplo de Flujo Completo

### Escenario: Nuevo Cliente

**Día 1:**
```
Cliente abre: http://192.168.1.101:3000
→ Sistema detecta: No hay licencia
→ Redirección automática a licencias.html
→ Cliente completa formulario de prueba
→ ¡Prueba de 15 días activada!
```

**Día 8:**
```
Cliente abre la app
→ Banner aparece: "⏰ Te quedan 7 días restantes..."
→ Link para activar licencia completa
```

**Día 13:**
```
Cliente abre la app
→ Banner rojo: "⚠️ Te quedan 2 días restantes..."
→ Advertencia urgente
```

**Día 14:**
```
Cliente solicita licencia al admin
Admin genera código: VM2-PRO-ABC123-XYZ-789
Admin envía código al cliente
```

**Día 15:**
```
Cliente ingresa código en licencias.html
→ Clic en "Activar Licencia"
→ ✅ ¡Licencia Full activada! (1 año)
→ Banner desaparece
→ Sistema funcional por 365 días más
```

---

## 🔧 Archivos Modificados

### Nuevos Archivos:
- `generador-licencias.html` - Herramienta para administrador

### Archivos Actualizados:
- `licencia.js` - Lógica del sistema de licencias
- `licencias.html` - Interfaz de gestión
- `index.html` - Agregado banner de advertencia
- `app.js` - Validación al iniciar

---

## 📊 Precios Sugeridos

Puedes ofrecer diferentes planes:

### Plan Trial (Gratis)
- ✅ 15 días gratis
- ✅ Todas las funciones
- ✅ Sin tarjeta requerida

### Plan Anual
- 💰 $499 MXN/año
- ✅ Licencia 1 año
- ✅ Soporte por email
- ✅ Actualizaciones incluidas

### Plan 3 Años
- 💰 $1,299 MXN (ahorra $200)
- ✅ Licencia 3 años
- ✅ Soporte prioritario
- ✅ Respaldo en nube

### Plan Perpetuo
- 💰 $2,499 MXN (pago único)
- ✅ Licencia de por vida
- ✅ Soporte vitalicio
- ✅ Todas las actualizaciones futuras

---

## ✉️ Mensaje para Enviar a Clientes

Puedes copiar y enviar este mensaje:

```
🎉 ¡Bienvenido a VentaMaestra 2.0!

Tu licencia está activada:
Código: [CÓDIGO AQUÍ]

Para activarla:
1. Abre: http://192.168.1.101:3000/licencias.html
2. Ingresa tu código en "Activar Licencia Full"
3. Clic en "Activar Licencia"

Duración: 1 año
Vencimiento: [FECHA]

Soporte: soporte@ventamaestra.com

¡Gracias por confiar en nosotros! 🚀
```

---

## 🆘 Solución de Problemas

### "La licencia no se activa"
- Verificar que el código comience con `VM2-PRO-`
- Verificar que no haya espacios al inicio o final
- Verificar que la licencia no haya expirado

### "El banner no aparece"
- Refrescar la página (F5)
- Verificar que `licencia.js` esté cargado
- Revisar consola del navegador (F12)

### "No puedo generar licencias"
- Abrir: http://192.168.1.101:3000/generador-licencias.html
- Verificar que el servidor esté corriendo en puerto 3000

---

## 🎯 Próximos Pasos Recomendados

1. **Personalización**: Cambiar precios en `generador-licencias.html`
2. **Email**: Configurar envío automático de códigos
3. **Base de Datos**: Guardar licencias en servidor (opcional)
4. **Respaldo**: Implementar sincronización en nube
5. **Reportes**: Dashboard de licencias activas/expiradas

---

## 📞 Soporte

Si necesitas ayuda o personalizaciones:
- Contacta al desarrollador
- Envía el archivo de licencia exportado
- Indica el problema específico

---

**¡Sistema listo para usar!** 🎊

El sistema de licencias está completamente funcional y listo para probar desde tu celular o cualquier dispositivo conectado a la red local.
