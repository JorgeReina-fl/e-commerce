# 🐳 Guía Completa de Docker - E-Commerce

**Despliegue profesional con Docker en minutos**

---

## 📋 Tabla de Contenidos

1. [¿Qué es Docker y Por Qué lo Usamos?](#qué-es-docker)
2. [Requisitos Previos](#requisitos-previos)
3. [Instalación Rápida](#instalación-rápida)
4. [Arquitectura del Sistema](#arquitectura)
5. [Comandos Esenciales](#comandos-esenciales)
6. [Configuración Avanzada](#configuración-avanzada)
7. [Troubleshooting](#troubleshooting)
8. [Deploy en Producción](#deploy-en-producción)

---

## 🎯 ¿Qué es Docker y Por Qué lo Usamos? {#qué-es-docker}

### Problema Sin Docker

```
❌ "Funciona en mi PC pero no en producción"
❌ 3-4 horas configurando servidor manualmente
❌ Versiones diferentes de Node/MongoDB causan bugs
❌ Difícil manejar múltiples proyectos simultáneamente
```

### Solución Con Docker

```
✅ Mismo entorno en desarrollo y producción
✅ Deploy en 5 minutos con un solo comando
✅ Aislamiento total entre proyectos
✅ Fácil rollback si algo falla
```

### Ventajas para Tu Negocio

- 💰 **Vende más rápido**: Deploy instantáneo impresiona a clientes
- ⚡ **Trabaja más eficiente**: No pierdas tiempo configurando
- 🔒 **Cero problemas**: Funciona igual en todos lados
- 📈 **Escala fácil**: Maneja 5-10 clientes simultáneamente

---

## 📦 Requisitos Previos {#requisitos-previos}

### En Tu Computadora (Desarrollo)

```bash
# 1. Docker Desktop (Windows/Mac)
# Descarga: https://www.docker.com/products/docker-desktop

# 2. Verificar instalación
docker --version
# Debe mostrar: Docker version 24.0.0 o superior

docker-compose --version
# Debe mostrar: Docker Compose version 2.0.0 o superior
```

### En Servidor de Producción (Linux)

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Verificar
docker --version
docker compose version
```

---

## 🚀 Instalación Rápida {#instalación-rápida}

### Opción 1: Script Automatizado (Recomendado)

```bash
# 1. Clonar o navegar al proyecto
cd e-commerce

# 2. Configurar variables de entorno
cp .env.docker.example .env

# 3. Editar .env con tus credenciales
# (Ver sección de Configuración abajo)

# 4. Ejecutar script de instalación
chmod +x install.sh
./install.sh

# ✅ ¡Listo! Aplicación corriendo en http://localhost
```

### Opción 2: Manual

```bash
# 1. Configurar variables
cp .env.docker.example .env
nano .env  # Editar con tus valores

# 2. Construir imágenes
docker-compose build

# 3. Iniciar servicios
docker-compose up -d

# 4. Verificar estado
docker-compose ps
```

---

## 🏗️ Arquitectura del Sistema {#arquitectura}

### Diagrama de Contenedores

```
┌─────────────────────────────────────────────────┐
│           DOCKER COMPOSE                        │
│     (Orquesta todos los servicios)              │
└─────────────────────────────────────────────────┘
                      │
          ┌───────────┼───────────┐
          │           │           │
          ▼           ▼           ▼
    ┌─────────┐  ┌─────────┐  ┌─────────┐
    │ CLIENT  │  │ SERVER  │  │  MONGO  │
    │ (Nginx) │  │(Node.js)│  │   DB    │
    │  :80    │  │  :5000  │  │ :27017  │
    └─────────┘  └─────────┘  └─────────┘
         │            │            │
         └────────────┴────────────┘
              luxethread-network
              (Red interna Docker)
```

### Componentes

#### 1. **MongoDB Container** (`mongo`)
- **Imagen**: `mongo:7.0`
- **Puerto**: 27017 (solo interno)
- **Volúmenes**: 
  - `mongo_data` → Datos persistentes
  - `mongo_config` → Configuración
- **Health Check**: Verifica conexión cada 30s

#### 2. **Server Container** (`server`)
- **Base**: `node:18-alpine`
- **Puerto**: 5000 (solo interno)
- **Función**: API REST + Backend
- **Depende de**: MongoDB
- **Volúmenes**: `server_uploads` → Archivos subidos

#### 3. **Client Container** (`client`)
- **Base**: `nginx:alpine`
- **Puerto**: 80 (expuesto al host)
- **Función**: 
  - Sirve React app compilado
  - Proxy a API (`/api` → `server:5000`)
- **Depende de**: Server

### Red Interna

```
luxethread-network (bridge)
├── mongo:27017
├── server:5000
└── client:80 → localhost:80
```

**Importante**: Solo el puerto 80 del cliente está expuesto. MongoDB y Server son internos.

---

## 🛠️ Comandos Esenciales {#comandos-esenciales}

### Iniciar y Parar

```bash
# Iniciar todo (detached mode)
docker-compose up -d

# Iniciar y ver logs en tiempo real
docker-compose up

# Parar todos los servicios
docker-compose down

# Parar y eliminar volúmenes (CUIDADO: borra datos)
docker-compose down -v
```

### Logs y Debugging

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f mongo

# Ver últimas 100 líneas
docker-compose logs --tail=100 server
```

### Estado y Salud

```bash
# Ver estado de contenedores
docker-compose ps

# Ver uso de recursos (CPU, RAM)
docker stats

# Verificar salud de servicios
docker-compose ps
# Busca "healthy" en la columna Status
```

### Reiniciar Servicios

```bash
# Reiniciar un servicio específico
docker-compose restart server

# Reiniciar todo
docker-compose restart

# Reconstruir y reiniciar (después de cambios en código)
docker-compose up -d --build
```

### Acceso a Contenedores

```bash
# Entrar a MongoDB shell
docker exec -it luxethread-mongo mongosh

# Entrar a bash del servidor
docker exec -it luxethread-server sh

# Ejecutar comando en servidor
docker exec luxethread-server npm run seed
```

### Limpieza

```bash
# Limpiar contenedores parados
docker container prune

# Limpiar imágenes no usadas
docker image prune

# Limpiar todo (CUIDADO)
docker system prune -a --volumes
```

---

## ⚙️ Configuración Avanzada {#configuración-avanzada}

### Variables de Entorno (.env)

```bash
# ==========================================
# MongoDB Configuration
# ==========================================
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=tu_password_super_seguro_aqui

# ==========================================
# Server Configuration
# ==========================================
SERVER_PORT=5000
NODE_ENV=production

# Generar JWT secrets:
# openssl rand -base64 32
JWT_SECRET=tu_jwt_secret_generado_con_openssl
JWT_REFRESH_SECRET=tu_jwt_refresh_secret_generado

# ==========================================
# Client Configuration
# ==========================================
CLIENT_PORT=80
CLIENT_URL=http://localhost
VITE_API_URL=http://localhost/api

# ==========================================
# Stripe (Pagos)
# ==========================================
STRIPE_SECRET_KEY=sk_test_tu_clave_de_stripe
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret

# ==========================================
# Cloudinary (Imágenes)
# ==========================================
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# ==========================================
# Email (SMTP)
# ==========================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password
EMAIL_FROM=TuTienda <noreply@tutienda.com>
```

### Generar Secrets Seguros

```bash
# JWT Secret
openssl rand -base64 32

# MongoDB Password
openssl rand -base64 24

# O usar generador online:
# https://www.random.org/passwords/
```

### Cambiar Puertos

```bash
# En .env
CLIENT_PORT=8080  # Cambiar de 80 a 8080

# Reiniciar
docker-compose down
docker-compose up -d

# Ahora accesible en http://localhost:8080
```

### Múltiples Proyectos Simultáneos

```bash
# Proyecto Cliente A
cd ~/proyectos/cliente-a
docker-compose up -d  # Puerto 80

# Proyecto Cliente B (puerto diferente)
cd ~/proyectos/cliente-b
echo "CLIENT_PORT=8080" >> .env
docker-compose up -d  # Puerto 8080

# Ambos corriendo sin conflictos
```

---

## 🔧 Troubleshooting {#troubleshooting}

### Error: "Port already in use"

```bash
# Ver qué está usando el puerto 80
# Windows
netstat -ano | findstr :80

# Linux/Mac
lsof -i :80

# Solución 1: Cambiar puerto
echo "CLIENT_PORT=8080" >> .env
docker-compose up -d

# Solución 2: Parar servicio que usa puerto 80
# (IIS en Windows, Apache en Linux, etc.)
```

### Error: "Cannot connect to MongoDB"

```bash
# 1. Verificar que MongoDB está corriendo
docker-compose ps

# 2. Ver logs de MongoDB
docker-compose logs mongo

# 3. Verificar health check
docker inspect luxethread-mongo | grep Health -A 10

# 4. Reiniciar MongoDB
docker-compose restart mongo

# 5. Si persiste, recrear volumen
docker-compose down -v
docker-compose up -d
```

### Error: "Build failed" o "npm install failed"

```bash
# 1. Limpiar caché de Docker
docker-compose build --no-cache

# 2. Verificar .dockerignore no excluye archivos necesarios
cat server/.dockerignore
cat client/.dockerignore

# 3. Verificar package.json existe
ls -la server/package.json
ls -la client/package.json
```

### Contenedor se Reinicia Constantemente

```bash
# 1. Ver logs para encontrar error
docker-compose logs server

# 2. Verificar variables de entorno
docker exec luxethread-server env | grep MONGO

# 3. Verificar health check
docker inspect luxethread-server | grep Health -A 10

# 4. Entrar al contenedor y debuggear
docker exec -it luxethread-server sh
node server.js  # Ejecutar manualmente
```

### Aplicación Lenta

```bash
# 1. Ver uso de recursos
docker stats

# 2. Limitar recursos (en docker-compose.yml)
services:
  server:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M

# 3. Verificar logs por errores
docker-compose logs -f
```

---

## 🌐 Deploy en Producción {#deploy-en-producción}

### Opción 1: VPS (DigitalOcean, Linode, etc.)

```bash
# 1. Conectar al servidor
ssh root@tu-servidor.com

# 2. Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Clonar proyecto
git clone https://github.com/tu-usuario/e-commerce.git
cd e-commerce

# 4. Configurar variables
cp .env.docker.example .env
nano .env  # Editar con valores de producción

# 5. Ejecutar instalación
chmod +x install.sh
./install.sh

# 6. Configurar dominio (opcional)
# Ver sección "Dominio Personalizado" abajo
```

### Opción 2: Docker Swarm (Múltiples Servidores)

```bash
# Inicializar Swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml ecommerce

# Ver servicios
docker service ls

# Escalar servidor
docker service scale ecommerce_server=3
```

### Dominio Personalizado

```bash
# 1. Apuntar dominio a IP del servidor (en tu DNS)
# A record: tienda.com → 123.45.67.89

# 2. Instalar Nginx en host (fuera de Docker)
sudo apt install nginx

# 3. Configurar proxy reverso
sudo nano /etc/nginx/sites-available/tienda.com

# Contenido:
server {
    listen 80;
    server_name tienda.com www.tienda.com;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# 4. Activar sitio
sudo ln -s /etc/nginx/sites-available/tienda.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 5. SSL con Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tienda.com -d www.tienda.com
```

### HTTPS con Traefik (Alternativa)

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    command:
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.myresolver.acme.email=tu@email.com"
      - "--certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.myresolver.acme.httpchallenge.entrypoint=web"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./letsencrypt:/letsencrypt

  client:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.client.rule=Host(`tutienda.com`)"
      - "traefik.http.routers.client.entrypoints=websecure"
      - "traefik.http.routers.client.tls.certresolver=myresolver"
```

### Backup Automático

```bash
# Script de backup (backup.sh)
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Backup MongoDB
docker exec luxethread-mongo mongodump --out=/tmp/backup
docker cp luxethread-mongo:/tmp/backup $BACKUP_DIR/mongo_$DATE

# Backup uploads
docker cp luxethread-server:/app/uploads $BACKUP_DIR/uploads_$DATE

# Comprimir
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz $BACKUP_DIR/*_$DATE

# Limpiar backups antiguos (más de 7 días)
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete

echo "Backup completado: backup_$DATE.tar.gz"
```

```bash
# Automatizar con cron
crontab -e

# Backup diario a las 2 AM
0 2 * * * /root/e-commerce/backup.sh
```

### Monitoreo

```bash
# Instalar Portainer (UI para Docker)
docker volume create portainer_data
docker run -d -p 9000:9000 \
  --name=portainer --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce

# Acceder a http://tu-servidor:9000
```

---

## 📊 Comparación: Docker vs Otros Métodos

| Aspecto | Docker | Manual | Vercel/Railway |
|---------|--------|--------|----------------|
| **Tiempo Setup** | 5 min | 3-4 horas | 10 min |
| **Consistencia** | ✅ 100% | ❌ Variable | ✅ Alta |
| **Costo** | €5-20/mes | €5-20/mes | €20-50/mes |
| **Control** | ✅ Total | ✅ Total | ⚠️ Limitado |
| **Escalabilidad** | ✅ Fácil | ❌ Difícil | ✅ Automática |
| **Portabilidad** | ✅ Cualquier servidor | ❌ Depende | ❌ Vendor lock-in |

---

## 🎯 Casos de Uso Reales

### Caso 1: Demo para Cliente

```bash
# En tu laptop durante reunión
cd demo-cliente
docker-compose up -d

# Mostrar en http://localhost
# Cliente ve aplicación funcionando en vivo
```

### Caso 2: Desarrollo de Múltiples Clientes

```bash
# Cliente A
cd ~/clientes/tienda-ropa
docker-compose up -d  # Puerto 80

# Cliente B
cd ~/clientes/tienda-tech
CLIENT_PORT=8080 docker-compose up -d  # Puerto 8080

# Trabajar en ambos simultáneamente
```

### Caso 3: Testing Antes de Entregar

```bash
# Fresh start para simular producción
docker-compose down -v
docker-compose up -d

# Probar flujo completo:
# 1. Registro usuario
# 2. Añadir productos
# 3. Proceso de compra
# 4. Panel admin
```

---

## 💡 Tips y Mejores Prácticas

### ✅ Haz

1. **Usa `.env` para secretos** - Nunca hardcodees credenciales
2. **Backups regulares** - Automatiza con cron
3. **Monitorea logs** - `docker-compose logs -f`
4. **Health checks** - Ya incluidos en docker-compose.yml
5. **Limita recursos** - Evita que un contenedor use toda la RAM

### ❌ Evita

1. **No uses `latest` tag** - Especifica versiones (mongo:7.0)
2. **No corras como root** - Ya configurado con usuarios no-root
3. **No expongas MongoDB** - Solo interno, nunca puerto 27017 público
4. **No ignores logs de error** - Revísalos regularmente
5. **No uses volúmenes para código** - Solo para datos persistentes

---

## 📚 Recursos Adicionales

- 📖 [Docker Docs](https://docs.docker.com/)
- 📖 [Docker Compose Docs](https://docs.docker.com/compose/)
- 🎓 [Docker Tutorial](https://docker-curriculum.com/)
- 💬 [Docker Community](https://forums.docker.com/)

---

## 🆘 Soporte

**¿Problemas con Docker?**

1. Revisa [Troubleshooting](#troubleshooting)
2. Verifica logs: `docker-compose logs -f`
3. Busca en [Stack Overflow](https://stackoverflow.com/questions/tagged/docker)
4. Consulta documentación oficial

---

**Última actualización:** Diciembre 2025  
**Versión Docker:** 24.0+  
**Versión Compose:** 2.0+  
**Status:** ✅ PRODUCTION READY
