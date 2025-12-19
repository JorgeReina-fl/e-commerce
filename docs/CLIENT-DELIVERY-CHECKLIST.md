# 📦 Preparación para Cliente - Checklist

Este checklist te ayuda a preparar el proyecto antes de entregar a un cliente.

## ✅ ANTES DE ENTREGAR

### 1. Personalización de Branding
```
[ ] Actualizar src/config/branding.js con datos del cliente
[ ] Reemplazar public/favicon.svg con logo del cliente
[ ] Reemplazar public/og-image.jpg (1200x630px para redes sociales)
[ ] Actualizar index.html con título y descripción
[ ] Si hay colores custom, actualizar tailwind.config.js
```

### 2. Configuración de Servicios
```
[ ] Crear cuenta MongoDB Atlas para el cliente
[ ] Crear cuenta Stripe del cliente (o usar la tuya y cobrar comisión)
[ ] Crear cuenta Cloudinary para el cliente
[ ] Configurar email SMTP del cliente
```

### 3. Variables de Entorno
```
[ ] Copiar server/.env.example a server/.env
[ ] Rellenar todas las variables de entorno
[ ] Verificar que CLIENT_URL apunte a su dominio
[ ] Verificar que STRIPE_SECRET_KEY sea el correcto (test/live)
```

### 4. Contenido Inicial
```
[ ] Cargar productos iniciales del cliente
[ ] Configurar categorías si son diferentes
[ ] Crear usuario admin para el cliente
[ ] Configurar zonas y precios de envío (si son custom)
```

### 5. Deploy
```
[ ] Deploy backend en Railway/Render
[ ] Deploy frontend en Vercel
[ ] Configurar dominio custom del cliente (opcional)
[ ] Probar flujo completo de compra en producción
```

### 6. Documentación para Cliente
```
[ ] Entregar acceso al panel admin
[ ] Entregar credenciales de MongoDB, Stripe, etc.
[ ] Entregar manual de uso del panel admin
[ ] Configurar backups automáticos de BD
```

---

## 🎯 COMANDOS ÚTILES

### Crear usuario admin
```bash
cd server
node makeAdmin.js usuario@cliente.com
```

### Cargar productos de prueba
```bash
cd server
node seedProducts.js
```

### Build de producción local (para verificar)
```bash
cd client
npm run build
npm run preview  # Ver preview local del build
```

### Verificar que todo compila sin errores
```bash
cd client
npm run build

cd ../server
npm test
```

---

## 💼 FACTURACIÓN RECOMENDADA

### Modelo de Cobro Sugerido

**Opción 1: Pago Único + Mantenimiento**
- Setup inicial: €1,500 - €3,000
- Mantenimiento mensual: €100 - €300/mes
  - Incluye: hosting, actualizaciones, soporte

**Opción 2: Suscripción Mensual**
- €300 - €500/mes todo incluido
- Incluye: hosting, mantenimiento, soporte
- Sin costo inicial

**Extras (opcionales)**
- Dominio custom: €15/año (costo + gestión)
- Fotografía de productos: €5-10/producto
- SEO adicional: €200-500/mes
- Integraciones custom: €300-800 por integración

---

## 🔐 SEGURIDAD ANTES DE ENTREGAR

```
[ ] Cambiar todas las contraseñas por defecto
[ ] Generar nuevo JWT_SECRET único
[ ] Verificar que .env NO esté en git
[ ] Activar autenticación 2FA en servicios críticos
[ ] Configurar backups diarios de MongoDB
[ ] Revisar que no haya console.logs en producción
```

---

## 📞 SOPORTE POST-ENTREGA

### Qué Incluir en Soporte
- Resolución de bugs
- Actualizaciones de seguridad
- Backup y recuperación
- Soporte técnico básico

### Qué NO Incluir (cobrar extra)
- Nuevas funcionalidades
- Cambios de diseño mayores
- Migraciones complejas
- Integraciones nuevas

---

## 📊 CHECKLIST DE PRUEBAS FINALES

Antes de entregar, verificar:

```
[ ] Registro de usuario funciona
[ ] Login funciona
[ ] Reset de contraseña funciona
[ ] Añadir al carrito funciona
[ ] Checkout funciona
[ ] Pago con Stripe funciona (en modo test)
[ ] Emails se envían correctamente
[ ] Subir imágenes de productos funciona
[ ] Panel admin accesible solo para admin
[ ] Responsive en móvil funciona bien
[ ] Modo oscuro funciona
[ ] Cambio de idioma funciona
[ ] SEO tags están correctos
```

---

## 🎓 CAPACITACIÓN DEL CLIENTE

### Sesión de Training (1-2 horas)

**Temas a cubrir:**
1. Cómo añadir productos
2. Cómo gestionar pedidos
3. Cómo ver analytics
4. Cómo gestionar cupones
5. Cómo responder a clientes

**Materiales a entregar:**
- Video tutorial grabado
- Manual en PDF con capturas
- Lista de FAQs
- Contacto de soporte

---

## 💡 TIPS PROFESIONALES

1. **Siempre haz backup** antes de hacer cambios mayores
2. **Usa modo test de Stripe** hasta que el cliente esté 100% listo
3. **Configura alertas** de MongoDB y Railway para monitorear uptime
4. **Ofrece un periodo de prueba** de 1-2 semanas antes de cobrar mantenimiento
5. **Documenta todo** - te ahorrará horas de soporte

---

## 📅 TIMELINE RECOMENDADO

```
Día 1-2:   Personalización de branding
Día 3-4:   Configuración de servicios y deploy
Día 5:     Carga de productos iniciales
Día 6:     Pruebas completas
Día 7:     Capacitación del cliente
Día 8:     Go live!
```

**Total: ~8 días de trabajo (flexible según complejidad)**
