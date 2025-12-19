# 📁 Índice de Documentación

**Guía rápida de todos los documentos del proyecto**

---

## 🎯 Para Ti (Desarrollador/Freelancer)

| Documento | Para qué sirve | Cuándo usarlo |
|-----------|----------------|---------------|
| **[README.md](README.md)** | Vista general del proyecto | Primero que lees |
| **[functionalities.txt](functionalities.txt)** | Lista completa de features | Para mostrar a clientes |
| **[design.txt](design.txt)** | Diseño visual y CSS | Referencia de estilos |

## 🎨 Personalización para Clientes

| Documento | Para qué sirve | Cuándo usarlo |
|-----------|----------------|---------------|
| **[CUSTOMIZATION.md](client/CUSTOMIZATION.md)** | Guía de personalización de branding | Antes de cada proyecto nuevo |
| **[client/src/config/branding.js](client/src/config/branding.js)** | Archivo de configuración central | Editar para cada cliente |

## 🚀 Deploy y Entrega

| Documento | Para qué sirve | Cuándo usarlo |
|-----------|----------------|---------------|
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Guía completa de deploy | Al subir a producción |
| **[CLIENT-DELIVERY-CHECKLIST.md](CLIENT-DELIVERY-CHECKLIST.md)** | Checklist antes de entregar | Antes de entregar al cliente |
| **[server/.env.example](server/.env.example)** | Template de variables de entorno | Setup inicial del servidor |

## 📖 Para el Cliente

| Documento | Para qué sirve | Cuándo usarlo |
|-----------|----------------|---------------|
| **[ADMIN-MANUAL.md](ADMIN-MANUAL.md)** | Manual de uso del panel admin | Entregar al cliente |

## 🐳 Docker (Deploy Profesional)

| Documento | Para qué sirve | Cuándo usarlo |
|-----------|----------------|---------------|
| **[DOCKER-README.md](DOCKER-README.md)** | Inicio rápido con Docker | Deploy rápido en 5 minutos |
| **[DOCKER-GUIDE.md](DOCKER-GUIDE.md)** | Guía completa de Docker | Configuración avanzada y producción |
| **[docker-compose.yml](docker-compose.yml)** | Orquestación de servicios | Ya configurado, solo ejecutar |
| **[install.sh](install.sh)** | Script de instalación Linux/Mac | Deploy automatizado |
| **[install.ps1](install.ps1)** | Script de instalación Windows | Deploy automatizado en Windows |

## 🔧 Configuración Técnica

| Archivo | Para qué sirve |
|---------|----------------|
| **[client/vercel.json](client/vercel.json)** | Config de deploy en Vercel |
| **[server/Procfile](server/Procfile)** | Config de deploy en Railway |
| **[.github/workflows/ci.yml](.github/workflows/ci.yml)** | Pipeline de CI/CD |
| **[.env.docker.example](.env.docker.example)** | Template variables Docker |

---

## 🎯 Flujo de Trabajo Típico

### 1️⃣ Nuevo Proyecto
```
1. Leer: CUSTOMIZATION.md
2. Editar: client/src/config/branding.js
3. Reemplazar: favicon.svg, og-image.jpg
```

### 2️⃣ Deploy

**Opción A: Docker (Recomendado para VPS)**
```
1. Leer: DOCKER-README.md
2. Ejecutar: ./install.sh (Linux/Mac) o .\install.ps1 (Windows)
3. Configurar .env con tus credenciales
```

**Opción B: Vercel + Railway**
```
1. Leer: DEPLOYMENT.md
2. Seguir pasos de Railway + Vercel
3. Configurar variables de entorno
```

### 3️⃣ Antes de Entregar
```
1. Revisar: CLIENT-DELIVERY-CHECKLIST.md
2. Verificar que todo funciona
3. Preparar capacitación
```

### 4️⃣ Entregar al Cliente
```
1. Enviar: ADMIN-MANUAL.md
2. Hacer sesión de training
3. Dar accesos
```

---

## 💡 Tips Rápidos

- 📝 **Siempre copia .env.example a .env** antes de configurar
- 🎨 **Todo el branding en un solo archivo**: `branding.js`
- 📦 **Deploy automatizado**: Push a GitHub = deploy automático
- 💰 **Precios sugeridos**: Ver CLIENT-DELIVERY-CHECKLIST.md

---

## 🆘 ¿Perdido?

1. **¿Quieres empezar?** → Lee [README.md](README.md)
2. **¿Nuevo cliente?** → Lee [CUSTOMIZATION.md](client/CUSTOMIZATION.md)
3. **¿Listo para deploy?** → Lee [DEPLOYMENT.md](DEPLOYMENT.md)
4. **¿Vas a entregar?** → Lee [CLIENT-DELIVERY-CHECKLIST.md](CLIENT-DELIVERY-CHECKLIST.md)

---

**Última actualización: Diciembre 2025**
