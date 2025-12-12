# 👑 MANUAL DEL DUEÑO - VentaMaestra 2.0

## Para: Propietario de la Aplicación VentaMaestra
## Uso: Gestión Global de Licencias y Clientes

---

## 🚀 INICIO RÁPIDO

### Paso 1: Iniciar el Sistema
```
Doble click en: setup.bat
```
- Se abrirá el navegador automáticamente
- Verás la página de inicio con las opciones

### Paso 2: Acceder a TU Panel
```
Click en: "Panel Administrador Global" 
O ir directamente a: http://localhost:4000/admin.html
```

### Paso 3: Autenticarte
```
Contraseña Maestra: VentaMaestra2024!Admin
```
⚠️ **IMPORTANTE**: Esta contraseña es SOLO para ti. Nunca la compartas con clientes.

---

## 🎯 ¿QUÉ HACES CON ESTE PANEL?

### 1️⃣ GENERAR LICENCIAS PARA CLIENTES

Cuando un cliente te compra el sistema:

1. **Llena el formulario** en el panel:
   - Nombre de su tienda: "Abarrotes La Esperanza"
   - Dirección: "Calle 5 de Mayo #123"
   - Nombre del propietario: "Juan Pérez"
   - Teléfono: 5512345678
   - Email: juan@ejemplo.com
   - Tipo de licencia: Prueba / Básica / Estándar / Premium
   - Notas: Cualquier observación interna

2. **Click en "Generar Licencia"**
   
3. **El sistema crea automáticamente**:
   ```
   🔑 Código de Licencia: AB12-CD34-EF56-GH78
   🌐 URL Tienda en Línea: http://localhost:4000/tienda.html?store=STORE_1733594847123
   ```

4. **Copiar y enviar al cliente**:
   - Click en "📋 Copiar Info"
   - Se copia todo el texto formateado
   - Envíalo por WhatsApp, Email o imprímelo

---

## 📋 INFORMACIÓN QUE ENVÍAS AL CLIENTE

Cuando copies la información de una licencia, obtendrás este formato:

```
VENTAMAESTRA 2.0 - INFORMACIÓN DE LICENCIA

🏪 Tienda: Abarrotes La Esperanza
👤 Propietario: Juan Pérez
📞 Teléfono: 5512345678

🔑 CÓDIGO DE LICENCIA:
AB12-CD34-EF56-GH78

📝 INSTRUCCIONES DE ACTIVACIÓN:
1. Abrir navegador en el equipo donde se instalará
2. Ir a: http://localhost:4000/licencias.html
3. Pegar el código de licencia de arriba
4. Click en "Activar Licencia"
5. ¡Listo! El sistema quedará bloqueado a ese equipo

🌐 URL TIENDA EN LÍNEA:
http://localhost:4000/tienda.html?store=STORE_123456

Comparta esta URL con sus clientes para que puedan hacer pedidos en línea.

⚠️ IMPORTANTE:
- La licencia solo se puede activar UNA VEZ
- Quedará bloqueada al equipo donde se active
- No se puede cambiar de dispositivo sin autorización
- Tipo: BÁSICA
- Expira: 7 dic 2026

Soporte: VentaMaestra 2.0
```

---

## 🔍 GESTIONAR LICENCIAS EXISTENTES

En tu panel verás TODAS las licencias generadas con:

### Estados:
- 🟢 **Activa**: Cliente activó y está usando el sistema
- 🟡 **Pendiente**: Generada pero el cliente aún no la activa
- 🔴 **Expirada**: La fecha de vencimiento ya pasó

### Acciones Disponibles:

#### 👁️ Ver Detalles
Muestra toda la información de la licencia en formato de texto.

#### 📋 Copiar Info
Copia toda la información formateada para enviar al cliente.

#### 🔓 Desactivar
- Usa esto si el cliente necesita cambiar de computadora
- **Proceso**: Cliente reporta que cambió de equipo
  1. Tú desactivas la licencia desde tu panel
  2. Cliente puede activarla nuevamente en el nuevo equipo
  3. La licencia se bloquea al nuevo dispositivo

#### 🗑️ Eliminar
- **CUIDADO**: Esta acción es PERMANENTE
- Elimina la licencia completamente
- El cliente perderá TODO acceso
- Úsalo solo en casos como:
  - Cliente no pagó
  - Solicitud de reembolso
  - Licencia creada por error

---

## 📊 TIPOS DE LICENCIA

### 🆓 Prueba (Trial)
- **Duración**: 15 días
- **Propósito**: Que el cliente pruebe el sistema
- **Después**: Debe comprar una licencia completa
- **Uso**: Para demos o períodos de prueba

### 💼 Básica
- **Duración**: 1 año
- **Características**: Sistema completo
- **Precio**: (Tú defines)
- **Uso**: Tiendas pequeñas

### 🏪 Estándar
- **Duración**: 1 año
- **Características**: Sistema completo + Soporte
- **Precio**: (Tú defines)
- **Uso**: Tiendas medianas

### 🌟 Premium
- **Duración**: 1 año
- **Características**: Sistema completo + Soporte prioritario
- **Precio**: (Tú defines)
- **Uso**: Cadenas o tiendas grandes

---

## 🌐 URLs DE TIENDA EN LÍNEA

Cada tienda que generas obtiene automáticamente su propia URL única:

```
http://localhost:4000/tienda.html?store=STORE_123456
```

### ¿Para qué sirve?
- El cliente la comparte con SUS clientes
- Los clientes finales hacen pedidos en línea
- Los pedidos llegan al TPV del dueño de la tienda
- Es como tener una "app de pedidos" por tienda

### ¿Es única?
- Sí, cada tienda tiene su propio ID único
- Ejemplo:
  - Tienda A: `?store=STORE_1733594847123`
  - Tienda B: `?store=STORE_1733594999456`
  - No se mezclan los pedidos

---

## 🔐 SEGURIDAD DEL SISTEMA

### Bloqueo por Dispositivo
- Cuando un cliente activa su licencia, el sistema:
  1. Lee la "huella digital" de su computadora
  2. Guarda esa huella junto con la licencia
  3. Cada vez que abre el sistema, verifica la huella
  4. Si no coincide = NO PUEDE USAR EL SISTEMA

### ¿Qué es la "huella digital"?
Una combinación única de:
- Navegador
- Sistema operativo
- Pantalla
- Zona horaria
- Hardware
- Idioma

### ¿Se puede hackear?
- Muy difícil, tendría que clonar toda la computadora
- Si el cliente intenta en otra PC, será bloqueado
- Solo TÚ puedes desactivar desde tu panel

---

## 💡 CASOS DE USO COMUNES

### Caso 1: Cliente Nuevo
```
Cliente: "Quiero comprar VentaMaestra"
Tú:
1. Accedes a admin.html
2. Generas licencia con sus datos
3. Seleccionas tipo (ej: Básica - 1 año)
4. Copias y envías la información
5. Cliente recibe y activa en su computadora
6. ¡Listo! Cliente trabajando
```

### Caso 2: Cliente Cambió de Computadora
```
Cliente: "Compré nueva computadora, ¿cómo muevo la licencia?"
Tú:
1. Accedes a admin.html
2. Buscas su licencia
3. Click en "🔓 Desactivar"
4. Le avisas: "Ya puedes activar en tu nueva PC"
5. Cliente activa con el mismo código
6. Licencia ahora bloqueada a la nueva PC
```

### Caso 3: Cliente Quiere Renovar
```
Cliente: "Mi licencia expira pronto"
Tú:
Opción A - Extender existente:
  - No hay función automática aún
  - Puedes crear nueva licencia
  - O editar manualmente en localStorage

Opción B - Nueva licencia:
  1. Generas nueva licencia
  2. Cliente desactiva la vieja (desde licencias.html)
  3. Cliente activa la nueva
```

### Caso 4: Cliente No Pagó
```
Cliente: Dejó de pagar o hay problemas
Tú:
1. Accedes a admin.html
2. Buscas su licencia
3. Click en "🗑️ Eliminar"
4. Confirmas la eliminación
5. Cliente inmediatamente pierde acceso
```

---

## 📱 RESTRICCIONES MÓVILES

### ¿Qué pasa si alguien activa en celular?

El sistema detecta que es móvil y:
- ✅ PERMITE: Ver productos, inventario, compras, kárdex
- ❌ BLOQUEA: Hacer ventas en el TPV
- 💡 USO: Personal que ajusta precios en piso de venta

### Detección automática:
```
Escritorio/Laptop → Acceso completo
Tablet          → Acceso completo
Móvil          → Solo gestión (sin ventas)
```

---

## 📈 ESTADÍSTICAS EN TU PANEL

En la parte superior siempre verás:

```
┌─────────────┬─────────┬───────────┬────────────┐
│ Totales: 15 │ Activas │ Expiradas │ Pendientes │
│             │    12   │     2     │      1     │
└─────────────┴─────────┴───────────┴────────────┘
```

- **Totales**: Todas las licencias generadas
- **Activas**: Clientes usando el sistema
- **Expiradas**: Licencias que vencieron
- **Pendientes**: Generadas pero no activadas

---

## 🔄 FLUJO COMPLETO DE VENTA

```
1. CLIENTE TE CONTACTA
   "Quiero el sistema para mi tienda"
   
2. DEFINES EL PRECIO
   Según tipo: Prueba/Básica/Estándar/Premium
   
3. CLIENTE PAGA
   Transferencia, efectivo, etc.
   
4. GENERAS LICENCIA
   admin.html → Llenar formulario → Generar
   
5. ENVÍAS INFORMACIÓN
   Copiar Info → WhatsApp/Email
   
6. CLIENTE INSTALA
   - Ejecuta setup.bat en su PC
   - Va a licencias.html
   - Pega el código
   - Click "Activar"
   
7. SISTEMA BLOQUEADO
   Su computadora ahora es la única autorizada
   
8. CLIENTE USA SISTEMA
   - Configura productos
   - Hace ventas
   - Recibe pedidos en línea
   
9. TÚ MONITOREAS
   Desde admin.html ves estado de su licencia
   
10. RENOVACIÓN (1 año después)
    Cliente te contacta para renovar
```

---

## 🛠️ SOLUCIÓN DE PROBLEMAS

### "No puedo acceder a admin.html"
- Verifica que setup.bat esté corriendo
- Debe ver servidor activo en la ventana negra
- Prueba: http://localhost:4000/admin.html
- Contraseña correcta: `VentaMaestra2024!Admin`

### "Cliente dice que no puede activar"
1. Verifica que la licencia existe en tu panel
2. Asegúrate que el código es correcto (XXXX-XXXX-XXXX-XXXX)
3. Verifica que la licencia no esté ya activada
4. Si está activada, desactívala primero

### "Cliente perdió acceso"
1. Busca su licencia en admin.html
2. Verifica estado: ¿Expirada? ¿Desactivada?
3. Si expiró, genera nueva licencia
4. Si está activa pero no funciona, desactiva y reactiva

### "Cliente cambió de PC sin avisar"
1. El sistema lo bloqueará automáticamente
2. Cliente te contacta
3. Tú desactivas la licencia
4. Cliente activa en la nueva PC

---

## 💾 RESPALDOS Y DATOS

### ¿Dónde se guardan las licencias?
```
localStorage del navegador
Clave: ventamaestra_all_licenses
```

### ¿Cómo respaldar?
1. Abrir DevTools (F12)
2. Ir a Application → Local Storage
3. Copiar valor de `ventamaestra_all_licenses`
4. Guardar en archivo .txt

### ¿Cómo restaurar?
1. Abrir DevTools (F12)
2. Ir a Application → Local Storage
3. Pegar valor guardado
4. Refrescar página

### ⚠️ IMPORTANTE
- Los datos son locales (en TU computadora)
- Si formateas, pierdes las licencias
- Haz respaldos periódicos
- No compartas tu localStorage con nadie

---

## 📞 CONTACTO CON CLIENTES

### Información a solicitar cuando vendes:
- ✅ Nombre de la tienda
- ✅ Nombre del propietario
- ✅ Teléfono de contacto
- ✅ Email (opcional)
- ✅ Dirección física
- ✅ Tipo de negocio
- ✅ Número de empleados (para saber cuántos usuarios)

### Información que entregas:
- ✅ Código de licencia (XXXX-XXXX-XXXX-XXXX)
- ✅ Instrucciones de activación
- ✅ URL de tienda en línea
- ✅ Contraseña por defecto: master2024 (para crear usuarios)
- ✅ Manual de usuario (opcional)

---

## 🎓 CAPACITACIÓN A CLIENTES

### Qué debes explicarles:

1. **Activación** (5 min)
   - Cómo pegar el código
   - Por qué queda bloqueado
   - Qué hacer si cambian de PC

2. **Configuración** (15 min)
   - Crear usuarios y permisos
   - Agregar productos
   - Configurar tienda en línea

3. **Uso diario** (20 min)
   - Hacer ventas
   - Cobrar
   - Ver pedidos web
   - Corte de caja

4. **Soporte** (contacto)
   - Tu WhatsApp/Email
   - Horarios de atención
   - Costo de soporte (si aplica)

---

## 💰 MODELO DE NEGOCIO SUGERIDO

### Precios Recomendados (México):

- **Prueba**: $0 - 15 días
- **Básica**: $1,500 MXN / año
- **Estándar**: $3,000 MXN / año
- **Premium**: $5,000 MXN / año

### Servicios Adicionales:

- **Instalación**: $500 MXN
- **Capacitación**: $800 MXN
- **Soporte mensual**: $300 MXN/mes
- **Personalización**: Variable

### Estrategia:

1. Ofrecer prueba gratis (15 días)
2. Cliente prueba sin compromiso
3. Si le gusta, compra licencia anual
4. Renovación al año con descuento

---

## 🚀 CRECIMIENTO DEL NEGOCIO

### Cómo conseguir más clientes:

1. **Marketing local**
   - Visita tiendas de tu zona
   - Ofrece demo en sus propias PCs
   - Deja tarjetas de presentación

2. **Referencias**
   - Clientes satisfechos recomiendan
   - Ofrece descuento por referir

3. **Redes sociales**
   - Publica casos de éxito
   - Videos de demostración
   - Testimoniales

4. **Alianzas**
   - Proveedores de equipos
   - Contadores
   - Otros servicios para negocios

---

## ✅ CHECKLIST DIARIA

Como dueño de VentaMaestra, cada día deberías:

- [ ] Revisar si hay nuevos clientes potenciales
- [ ] Verificar estado de licencias (expiradas próximamente)
- [ ] Responder consultas de clientes
- [ ] Hacer respaldo de licencias (semanal)
- [ ] Revisar si hay pagos pendientes
- [ ] Contactar clientes próximos a vencer

---

## 📚 RECURSOS

### Archivos Importantes:
- `admin.html` - Tu panel de control
- `README.md` - Documentación técnica
- `setup.bat` - Iniciar el sistema

### Contraseñas a recordar:
- Panel admin: `VentaMaestra2024!Admin`
- Para crear usuarios (clientes): `master2024`

### URLs Clave:
- Inicio: http://localhost:4000/inicio.html
- Tu panel: http://localhost:4000/admin.html
- Activación: http://localhost:4000/licencias.html
- TPV: http://localhost:4000/index.html

---

## 🎯 PRÓXIMOS PASOS

Ya tienes todo listo para:

1. ✅ Generar licencias
2. ✅ Gestionar clientes
3. ✅ Crear URLs de tienda
4. ✅ Monitorear activaciones
5. ✅ Desactivar/Eliminar según necesites

### Empieza ahora:

```
1. Ejecuta setup.bat
2. Ve a admin.html
3. Ingresa contraseña maestra
4. Crea tu primera licencia de prueba
5. Pruébala tú mismo en licencias.html
6. ¡Listo para vender!
```

---

**¡Éxito con tu negocio de VentaMaestra 2.0! 🚀**

*Si tienes dudas sobre cómo funciona algo, revisa este manual o prueba las funciones con licencias de prueba primero.*
