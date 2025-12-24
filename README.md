# 🛍️ E-Commerce Full Stack - Base para Proyectos Freelance

**Tienda online completa y personalizable para vender a clientes**

![Status](https://img.shields.io/badge/status-production%20ready-success)
![Tests](https://img.shields.io/badge/tests-passing-success)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 📋 Descripción

Sistema completo de e-commerce listo para personalizar y vender a clientes. Incluye panel de administración, sistema de pagos, gestión de inventario, cupones, y mucho más.

**Ideal para:**
- 💼 Freelancers que venden tiendas online
- 🏢 Agencias web
- 👨‍💻 Desarrolladores que buscan una base sólida

---

## ✨ Características Principales

### Para el Cliente Final
- 🛒 Catálogo con filtros avanzados y búsqueda
- 💳 Pagos reales con Stripe
- 📦 Gestión de pedidos con tracking
- 🎟️ Sistema de cupones y descuentos
- ⭐ Reseñas de productos
- ❤️ Wishlist con múltiples listas
- 🌐 Multi-idioma (ES/EN) y multi-moneda
- 🌙 Modo oscuro
- 📱 100% Responsive

### Para el Administrador
- 📊 Dashboard con analytics en tiempo real
- 📦 Gestión completa de productos e inventario
- 🛒 Gestión de pedidos y estados
- 🎟️ Creación y gestión de cupones
- 👥 Gestión de usuarios
- ⭐ Moderación de reseñas
- 📈 Reportes exportables

### Técnicas
- ⚡ Optimizado para SEO (sitemap, meta tags, JSON-LD)
- 🔒 Seguridad (JWT, rate limiting, CORS)
- 🎨 Sistema de branding centralizado
- 📧 Emails transaccionales automáticos
- 🧪 Tests automatizados (25+ tests)
- 🚀 CI/CD con GitHub Actions
- 💾 Caché de API para mejor rendimiento

---

## 🛠️ Stack Tecnológico

### Frontend
```
React 18 + Vite
TailwindCSS
React Router
Context API
Stripe Elements
react-i18next
```

### Backend
```
Node.js + Express
MongoDB + Mongoose
JWT Authentication
Stripe Payments
Cloudinary (imágenes)
Nodemailer (emails)
```

### Testing
```
Jest + Supertest (backend)
Cypress (E2E)
GitHub Actions (CI/CD)
```

---

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+
- MongoDB
- Cuenta de Stripe (test)
- Cuenta de Cloudinary

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/tuusuario/e-commerce.git
cd e-commerce

# Instalar dependencias del servidor
cd server
npm install
cp .env.example .env
# Editar .env con tus credenciales

# Instalar dependencias del cliente
cd ../client
npm install

# Iniciar desarrollo
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

Abre http://localhost:5173

### Crear Usuario Admin

```bash
cd server
node makeAdmin.js tu-email@ejemplo.com
```

---

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [CUSTOMIZATION.md](client/CUSTOMIZATION.md) | Cómo personalizar para cada cliente |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Guía completa de deploy en Render/Vercel |
| [CLIENT-DELIVERY-CHECKLIST.md](docs/CLIENT-DELIVERY-CHECKLIST.md) | Checklist antes de entregar al cliente |
| [ADMIN-MANUAL.md](docs/ADMIN-MANUAL.md) | Manual de usuario para el panel admin |
| [functionalities.txt](docs/functionalities.txt) | Lista completa de funcionalidades |

---

## 💰 Modelo de Negocio Sugerido

### Venta a Clientes

**Opción 1: Pago Único + Mantenimiento**
```
Setup inicial:      €1,500 - €3,000
Mantenimiento:      €100 - €300/mes
```

**Opción 2: Suscripción Todo Incluido**
```
Mensual:            €300 - €500/mes
Sin costo inicial
```

**Extras**
```
- Dominio custom:           €15/año
- Fotografía productos:     €5-10/producto
- SEO adicional:            €200-500/mes
- Integraciones custom:     €300-800
```

### Costos de Hosting (pasarlos al cliente)

**Tier Gratis (para empezar)**
- Render: €0/mes (Free Tier)
- Vercel: €0/mes
- MongoDB Atlas: €0/mes
- Cloudinary: €0/mes

**Tier Escalado**
- Render: ~€7-15/mes
- MongoDB: €9/mes
- Total: ~€16-25/mes

---

## 🎨 Personalización Rápida

### 1. Editar Branding

Edita `client/src/config/branding.js`:

```javascript
const branding = {
    name: 'NombreCliente',
    taglinePart1: 'Nombre',
    taglinePart2: 'Cliente',
    
    contact: {
        email: 'info@cliente.com',
        phone: '+34 600 000 000'
    },
    
    social: {
        instagram: 'https://instagram.com/cliente',
        facebook: 'https://facebook.com/cliente'
    },
    
    api: {
        production: 'https://tu-app.onrender.com'
    }
};
```

### 2. Reemplazar Assets
```
client/public/favicon.svg    → Logo del cliente
client/public/og-image.jpg   → Imagen social (1200x630)
```

### 3. Deploy
```bash
# Frontend (Vercel)
cd client
vercel --prod

# Backend (Render)
# El deploy es automático al hacer push a GitHub
git push origin main
```

¡Listo! Tienda personalizada en minutos.

---

## 🧪 Testing

```bash
# Tests backend
cd server
npm test

# Tests E2E con Cypress
cd client
npm run cy:run

# CI/CD automático
# Se ejecuta en cada push a main vía GitHub Actions
```

---

## 📦 Deploy en Producción

### Automatizado (Recomendado)

1. Push a GitHub
2. Conecta con Vercel (frontend)
3. Conecta con Render (backend)
4. Configura variables de entorno
5. ¡Deploy automático en cada push!

Ver [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) para guía completa.

---

## 🤝 Cómo Usar Este Proyecto para Freelance

### Flujo de Trabajo Sugerido

1. **Reunión con cliente** → Entender necesidades
2. **Personalización** → Cambiar branding y colores (1-2 días)
3. **Configuración** → Setup de servicios (MongoDB, Stripe, etc.)
4. **Deploy** → Subir a producción
5. **Carga de datos** → Añadir productos del cliente
6. **Capacitación** → Entrenar al cliente en el panel admin
7. **Go Live** → Activar dominio y pagos reales

**Tiempo total: ~8-10 días**

---

## 📊 Funcionalidades Completas

Ver [docs/functionalities.txt](docs/functionalities.txt) para lista detallada.

**Resumen:**
- ✅ 32 componentes
- ✅ 18 páginas
- ✅ 7 contexts
- ✅ 15 rutas API
- ✅ 11 modelos de datos
- ✅ Sistema de cupones
- ✅ Comparador de productos
- ✅ Multi-idioma y multi-moneda
- ✅ Analytics avanzados
- ✅ Notificaciones en tiempo real
- ✅ Cron jobs automáticos

---

## 🔐 Seguridad

- ✅ JWT para autenticación
- ✅ Bcrypt para contraseñas
- ✅ Rate limiting (100 req/min)
- ✅ CORS configurado
- ✅ Headers de seguridad
- ✅ Validación de precios server-side
- ✅ Variables de entorno para secretos

---

## 🐛 Troubleshooting

### Error: "Cannot connect to database"
```bash
# Verifica tu MONGODB_URI en .env
# Asegúrate de permitir IPs en MongoDB Atlas
```

### Error: "Stripe payments failing"
```bash
# Verifica STRIPE_SECRET_KEY en .env
# Usa sk_test_... para pruebas
```

### Error: "Images not uploading"
```bash
# Verifica credenciales de Cloudinary en .env
```

Ver más en [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md#troubleshooting)

---

## 📄 Licencia

MIT License - Libre para uso comercial

---

## 👨‍💻 Autor

**Tu Nombre**
- 🌐 Website: jorgereina.es
- 📧 Email: jorgereina.rp@gmail.com
- 💼 LinkedIn: /in/jorgereinafl/

---

## 🙏 Agradecimientos

Construido con:
- [React](https://react.dev)
- [Vite](https://vitejs.dev)
- [TailwindCSS](https://tailwindcss.com)
- [Express](https://expressjs.com)
- [MongoDB](https://mongodb.com)
- [Stripe](https://stripe.com)

---

## 📈 Roadmap

- [ ] PWA (Progressive Web App)
- [ ] Chat en vivo
- [ ] Búsqueda con Algolia
- [ ] App móvil (React Native)
- [ ] Marketplace multi-vendedor

---

**⭐ Si este proyecto te ayuda, considera darle una estrella en GitHub**

**🚀 Happy coding & selling!**
