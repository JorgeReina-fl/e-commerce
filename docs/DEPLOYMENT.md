# 🚀 Guía de Deploy en Producción

Esta guía explica cómo desplegar tu tienda e-commerce en producción.

## 📋 Requisitos Previos

- [ ] Cuenta de GitHub
- [ ] Cuenta de Vercel (para frontend)
- [ ] Cuenta de Render (para backend)
- [ ] Cuenta de MongoDB Atlas
- [ ] Cuenta de Stripe
- [ ] Cuenta de Cloudinary

---

## 🗄️ Paso 1: Configurar MongoDB Atlas

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster gratuito (M0)
3. En **Database Access**, crea un usuario con contraseña
4. En **Network Access**, añade `0.0.0.0/0` (permitir desde cualquier IP)
5. Copia tu **Connection String**:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority
   ```

---

## 🎨 Paso 2: Configurar Cloudinary

1. Ve a [Cloudinary](https://cloudinary.com)
2. Crea una cuenta gratuita
3. En el Dashboard, copia:
   - Cloud Name
   - API Key
   - API Secret

---

## 💳 Paso 3: Configurar Stripe

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com)
2. Activa tu cuenta (necesitarás datos bancarios para producción)
3. Copia tu **Secret Key**:
   - Test: `sk_test_...` (para pruebas)
   - Live: `sk_live_...` (para producción real)

---

## 🖥️ Paso 4: Desplegar Backend (Render)

1. **Push tu código a GitHub** (si no lo has hecho).
2. Ve a [Render.com](https://render.com) y haz login con GitHub.
3. Click en **"New +"** → **"Web Service"**.
4. Selecciona tu repositorio de la lista.
5. Configura los detalles del servicio:
   - **Name**: e-commerce-backend (o el que prefieras)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
6. Click en **"Advanced"** para añadir las **Environment Variables**:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=tu-secreto-muy-largo-min-32-chars
STRIPE_SECRET_KEY=sk_live_...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password
EMAIL_FROM=TuTienda <noreply@tutienda.com>
CLIENT_URL=https://tu-tienda.vercel.app
```

7. Click en **"Create Web Service"**.

### Obtener URL del Backend

Render te dará una URL como: `https://tu-proyecto.onrender.com`

**¡Cópiala! La necesitarás para el frontend.**

---

## 🌐 Paso 5: Desplegar Frontend (Vercel)

### Opción A: Deploy con Vercel CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Ir a la carpeta del cliente
cd client

# Deploy
vercel

# Para producción
vercel --prod
```

### Opción B: Deploy desde GitHub (Recomendado)

1. Push tu código a GitHub
2. Ve a [Vercel](https://vercel.com)
3. **New Project** → Importa tu repositorio
4. **Root Directory**: `client`
5. **Framework Preset**: Vite
6. Deploy!

### Configurar Variables de Entorno en Vercel

En Vercel Project Settings → Environment Variables:

```env
VITE_API_URL=https://tu-proyecto.onrender.com
```

### Actualizar branding.js

Edita `client/src/config/branding.js`:

```javascript
api: {
    development: 'http://localhost:5000',
    production: 'https://tu-proyecto.onrender.com'  // URL de Render
}
```

Commit y push para que se redespliegue automáticamente.

---

## 📧 Paso 6: Configurar Email (Gmail)

Si usas Gmail para enviar emails:

1. Ve a [Google Account](https://myaccount.google.com)
2. **Security** → **2-Step Verification** (actívalo)
3. **App passwords** → Genera una contraseña para "Mail"
4. Usa esa contraseña en `EMAIL_PASS`

**Alternativas profesionales:**
- SendGrid (12,000 emails/mes gratis)
- Mailgun
- AWS SES

---

## ✅ Paso 7: Verificar Deploy

### Checklist de Verificación

```
[ ] Backend responde en /api/products
[ ] Frontend carga correctamente
[ ] Login funciona
[ ] Crear producto funciona (admin)
[ ] Subir imágenes funciona (Cloudinary)
[ ] Añadir al carrito funciona
[ ] Checkout con Stripe funciona (modo test)
[ ] Emails se envían correctamente
```

### Comandos de Prueba

```bash
# Probar backend
curl https://tu-backend.onrender.com/api/products

# Debería devolver lista de productos
```

---

## 🔄 Paso 8: Configurar CI/CD Automático

### GitHub Actions (ya configurado)

El archivo `.github/workflows/ci.yml` ya existe y:
- ✅ Ejecuta tests en cada push
- ✅ Verifica que el build funcione
- ✅ Ejecuta tests E2E con Cypress

### Deploy Automático

Vercel y Render ya hacen deploy automático en cada push a `main`.

---

## 🎯 Deploy para un Cliente Nuevo

1. **Duplica el proyecto** en Render/Vercel (new project)
2. **Crea nueva base de datos** en MongoDB Atlas
3. **Configura variables de entorno** con datos del cliente
4. **Actualiza branding.js** con datos del cliente
5. **Deploy!**

Cada cliente tiene:
- Su propia instancia de Render (backend)
- Su propia instancia de Vercel (frontend)
- Su propia base de datos MongoDB
- Sus propias credenciales de Stripe

---

## 💰 Costos Estimados

### Opción Gratuita (para empezar)
```
Render:     €0/mes (Free Tier)
Vercel:     €0/mes (100GB bandwidth)
MongoDB:    €0/mes (512MB storage)
Cloudinary: €0/mes (25GB storage)
────────────────────────────────
TOTAL:      €0/mes
```

### Opción Escalada (con tráfico)
```
Render:     ~€7-15/mes (Starter)
Vercel:     €0-20/mes (Pro si necesitas)
MongoDB:    €9/mes (shared cluster)
Cloudinary: €0-89/mes (según imágenes)
────────────────────────────────
TOTAL:      ~€16-133/mes
```

---

## 🆘 Solución de Problemas

### Error: "Cannot connect to MongoDB"
- Verifica que la IP `0.0.0.0/0` esté permitida en MongoDB Atlas
- Verifica que el string de conexión sea correcto

### Error: "CORS policy"
- Añade tu dominio de Vercel a CORS en `server.js`
- Verifica que `CLIENT_URL` esté configurado en Render

### Error: "Images not uploading"
- Verifica credenciales de Cloudinary
- Verifica que el límite de tamaño sea correcto

### Error: "Emails not sending"
- Verifica que Gmail App Password esté correcto
- Prueba con otro servicio SMTP

---

## 📚 Recursos Adicionales

- [Render Docs](https://docs.render.com)
- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas Guide](https://docs.atlas.mongodb.com)
- [Stripe Testing](https://stripe.com/docs/testing)

---

## 🎉 ¡Listo!

Tu tienda está online en:
- **Frontend**: https://tu-tienda.vercel.app
- **Backend**: https://tu-api.onrender.com

Comparte la URL del frontend con clientes potenciales para demostrar tus capacidades.
