# 🐳 Docker Quick Start

**Deploy completo en 5 minutos**

---

## ⚡ Inicio Rápido

### Windows

```powershell
# 1. Configurar variables
copy .env.docker.example .env
notepad .env  # Editar con tus valores

# 2. Ejecutar instalación
.\install.ps1
```

### Linux/Mac

```bash
# 1. Configurar variables
cp .env.docker.example .env
nano .env  # Editar con tus valores

# 2. Ejecutar instalación
chmod +x install.sh
./install.sh
```

### Manual

```bash
# 1. Configurar
cp .env.docker.example .env

# 2. Construir
docker-compose build

# 3. Iniciar
docker-compose up -d

# 4. Verificar
docker-compose ps
```

---

## 🎯 Acceso

- **Frontend**: http://localhost
- **API**: http://localhost/api
- **MongoDB**: localhost:27017 (solo interno)

---

## 📋 Comandos Esenciales

```bash
# Ver logs
docker-compose logs -f

# Ver estado
docker-compose ps

# Reiniciar
docker-compose restart

# Parar
docker-compose down

# Parar y borrar datos
docker-compose down -v
```

---

## 🔧 Configuración Mínima (.env)

```bash
# MongoDB
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=tu_password_seguro

# JWT (generar con: openssl rand -base64 32)
JWT_SECRET=tu_jwt_secret
JWT_REFRESH_SECRET=tu_jwt_refresh_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_tu_clave
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password
```

---

## 📚 Documentación Completa

Ver [DOCKER-GUIDE.md](DOCKER-GUIDE.md) para:
- Arquitectura detallada
- Troubleshooting
- Deploy en producción
- Configuración avanzada
- Backups y monitoreo

---

## 🆘 Problemas Comunes

### Puerto 80 ocupado
```bash
# Cambiar puerto en .env
echo "CLIENT_PORT=8080" >> .env
docker-compose up -d
```

### MongoDB no conecta
```bash
# Ver logs
docker-compose logs mongo

# Reiniciar
docker-compose restart mongo
```

### Rebuild después de cambios
```bash
docker-compose up -d --build
```

---

**¿Necesitas ayuda?** → [DOCKER-GUIDE.md](DOCKER-GUIDE.md)
