# 🎨 Guía de Personalización para Clientes

Esta guía explica cómo personalizar la tienda para un nuevo cliente.

## 📁 Archivos a Modificar

### 1. Configuración Principal: `src/config/branding.js`

Este es el archivo **principal** de configuración. Aquí cambias:

```javascript
const branding = {
    // Nombre de la marca
    name: 'NombreCliente',
    taglinePart1: 'Nombre',     // Parte bold del logo
    taglinePart2: 'Cliente',    // Parte light del logo
    
    // SEO
    seo: {
        defaultTitle: 'NombreCliente - Tu Tienda Online',
        defaultDescription: 'Descripción para Google...',
        // ...
    },
    
    // Contacto y redes sociales
    contact: {
        email: 'info@cliente.com',
        phone: '+34 600 000 000',
        // ...
    },
    
    social: {
        instagram: 'https://instagram.com/cliente',
        // ...
    },
    
    // Colores (sincronizar con tailwind.config.js)
    colors: {
        primary: {
            500: '#TU_COLOR_PRINCIPAL',
            // ...
        }
    },
    
    // URL de la API
    api: {
        production: 'https://api.cliente.com'
    }
};
```

### 2. HTML Base: `index.html`

Actualizar:
- `<title>` 
- `<meta name="description">`
- Favicon (href a `/favicon.svg` o similar)

### 3. Colores en Tailwind: `tailwind.config.js`

Si el cliente tiene colores de marca específicos:

```javascript
colors: {
    // Reemplazar 'gold' con los colores del cliente
    brand: {
        50: '#...',
        100: '#...',
        500: '#COLOR_PRINCIPAL',
        600: '#COLOR_HOVER',
    }
}
```

### 4. Archivos de Assets: `public/`

Reemplazar:
- `favicon.svg` - Favicon de la marca
- `og-image.jpg` - Imagen para compartir en redes (1200x630px)
- Logo si hay uno personalizado

### 5. Traducciones: `src/i18n/locales/`

Actualizar `es.json` y `en.json` si hay textos específicos del cliente.

---

## ✅ Checklist de Personalización

```
[ ] branding.js - Nombre y configuración
[ ] branding.js - Información de contacto
[ ] branding.js - Redes sociales
[ ] branding.js - URL de API producción
[ ] index.html - Título y descripción
[ ] public/favicon.svg - Favicon del cliente
[ ] public/og-image.jpg - Imagen social
[ ] tailwind.config.js - Colores (si necesario)
[ ] .env - Claves de Stripe del cliente
[ ] .env - Credenciales de email del cliente
```

---

## 🚀 Deploy

### Variables de Entorno del Cliente (.env)

```env
# Backend
MONGODB_URI=mongodb+srv://...
JWT_SECRET=cliente_jwt_secret_muy_largo
STRIPE_SECRET_KEY=sk_live_...
EMAIL_HOST=smtp.cliente.com
EMAIL_USER=noreply@cliente.com
EMAIL_PASS=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Comandos de Deploy

```bash
# Build del cliente
cd client
npm run build

# El servidor se despliega apuntando a la carpeta dist/
```

---

## 💡 Notas Importantes

1. **NO modificar componentes individuales** - Todo el branding sale de `branding.js`
2. **Sincronizar colores** - Si cambias colores en branding.js, actualiza tailwind.config.js
3. **Imágenes** - Todas las imágenes de marca van en `public/`
4. **Base de datos** - Cada cliente tiene su propia instancia de MongoDB
