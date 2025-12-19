# ============================================
# LUXETHREAD - WINDOWS INSTALLATION SCRIPT
# Automated Docker deployment for Windows
# ============================================

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║           LUXETHREAD - PRODUCTION DEPLOYMENT                  ║" -ForegroundColor Blue
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

# ==========================================
# Check Prerequisites
# ==========================================

Write-Host "[1/5] Checking prerequisites..." -ForegroundColor Yellow

# Check Docker
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker is installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not installed!" -ForegroundColor Red
    Write-Host "Please install Docker Desktop: https://docs.docker.com/desktop/install/windows-install/" -ForegroundColor Red
    exit 1
}

# Check Docker Compose
try {
    $composeVersion = docker-compose --version
    Write-Host "✓ Docker Compose is installed: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker Compose is not installed!" -ForegroundColor Red
    Write-Host "Please install Docker Desktop (includes Docker Compose)" -ForegroundColor Red
    exit 1
}

# Check if Docker daemon is running
try {
    docker info | Out-Null
    Write-Host "✓ Docker daemon is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker daemon is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# ==========================================
# Environment Configuration
# ==========================================

Write-Host ""
Write-Host "[2/5] Checking environment configuration..." -ForegroundColor Yellow

if (-not (Test-Path ".env")) {
    if (Test-Path ".env.docker.example") {
        Write-Host "⚠ No .env file found. Creating from .env.docker.example..." -ForegroundColor Yellow
        Copy-Item ".env.docker.example" ".env"
        Write-Host ""
        Write-Host "⚠ IMPORTANT: Please edit .env file with your production values!" -ForegroundColor Yellow
        Write-Host "   Required variables:" -ForegroundColor Yellow
        Write-Host "   - JWT_SECRET (generate with: openssl rand -base64 32)" -ForegroundColor Yellow
        Write-Host "   - JWT_REFRESH_SECRET (generate with: openssl rand -base64 32)" -ForegroundColor Yellow
        Write-Host "   - STRIPE_SECRET_KEY (from Stripe dashboard)" -ForegroundColor Yellow
        Write-Host "   - MONGO_ROOT_PASSWORD (strong password)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Press Enter after configuring .env to continue, or Ctrl+C to abort..." -ForegroundColor Yellow
        Read-Host
    } else {
        Write-Host "✗ No .env or .env.docker.example file found!" -ForegroundColor Red
        Write-Host "Please create a .env file with the required environment variables." -ForegroundColor Red
        exit 1
    }
}
Write-Host "✓ Environment file exists" -ForegroundColor Green

# ==========================================
# Build Docker Images
# ==========================================

Write-Host ""
Write-Host "[3/5] Building Docker images..." -ForegroundColor Yellow
Write-Host "This may take a few minutes on first run..." -ForegroundColor Yellow

docker-compose build --no-cache

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Docker build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Docker images built successfully" -ForegroundColor Green

# ==========================================
# Start Services
# ==========================================

Write-Host ""
Write-Host "[4/5] Starting services in detached mode..." -ForegroundColor Yellow

docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to start services!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Services started" -ForegroundColor Green

# ==========================================
# Health Check
# ==========================================

Write-Host ""
Write-Host "[5/5] Waiting for services to be healthy..." -ForegroundColor Yellow

# Wait for MongoDB
Write-Host "  MongoDB: " -NoNewline
for ($i = 1; $i -le 30; $i++) {
    try {
        docker exec luxethread-mongo mongosh --eval "db.adminCommand('ping')" 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "ready" -ForegroundColor Green
            break
        }
    } catch {}
    
    if ($i -eq 30) {
        Write-Host "timeout" -ForegroundColor Red
    }
    Start-Sleep -Seconds 2
}

# Wait for Server
Write-Host "  Server:  " -NoNewline
for ($i = 1; $i -le 30; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "ready" -ForegroundColor Green
            break
        }
    } catch {}
    
    if ($i -eq 30) {
        Write-Host "still starting..." -ForegroundColor Yellow
    }
    Start-Sleep -Seconds 2
}

# Wait for Client
Write-Host "  Client:  " -NoNewline
for ($i = 1; $i -le 30; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost/" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "ready" -ForegroundColor Green
            break
        }
    } catch {}
    
    if ($i -eq 30) {
        Write-Host "still starting..." -ForegroundColor Yellow
    }
    Start-Sleep -Seconds 2
}

# ==========================================
# Complete
# ==========================================

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║               DEPLOYMENT COMPLETE! 🎉                         ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Your LuxeThread application is now running:" -ForegroundColor White
Write-Host ""
Write-Host "  Frontend:  http://localhost" -ForegroundColor Blue
Write-Host "  API:       http://localhost/api" -ForegroundColor Blue
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor White
Write-Host "  docker-compose logs -f        # View logs" -ForegroundColor Gray
Write-Host "  docker-compose ps             # Check status" -ForegroundColor Gray
Write-Host "  docker-compose down           # Stop services" -ForegroundColor Gray
Write-Host "  docker-compose down -v        # Stop and remove volumes" -ForegroundColor Gray
Write-Host ""
Write-Host "Note: First time setup may take a moment for MongoDB to initialize." -ForegroundColor Yellow
Write-Host ""
