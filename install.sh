#!/bin/bash

# ============================================
# LUXETHREAD - INSTALLATION SCRIPT
# Automated Docker deployment for production
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║           LUXETHREAD - PRODUCTION DEPLOYMENT                  ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ==========================================
# Check Prerequisites
# ==========================================

echo -e "${YELLOW}[1/5] Checking prerequisites...${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed!${NC}"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi
echo -e "${GREEN}✓ Docker is installed${NC}"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}✗ Docker Compose is not installed!${NC}"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose is installed${NC}"

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo -e "${RED}✗ Docker daemon is not running!${NC}"
    echo "Please start Docker and try again."
    exit 1
fi
echo -e "${GREEN}✓ Docker daemon is running${NC}"

# ==========================================
# Environment Configuration
# ==========================================

echo -e "${YELLOW}[2/5] Checking environment configuration...${NC}"

if [ ! -f .env ]; then
    if [ -f .env.docker.example ]; then
        echo -e "${YELLOW}⚠ No .env file found. Creating from .env.docker.example...${NC}"
        cp .env.docker.example .env
        echo -e "${YELLOW}⚠ IMPORTANT: Please edit .env file with your production values!${NC}"
        echo "   Required variables:"
        echo "   - JWT_SECRET (generate with: openssl rand -base64 32)"
        echo "   - JWT_REFRESH_SECRET (generate with: openssl rand -base64 32)"
        echo "   - STRIPE_SECRET_KEY (from Stripe dashboard)"
        echo "   - MONGO_ROOT_PASSWORD (strong password)"
        echo ""
        read -p "Press Enter after configuring .env to continue, or Ctrl+C to abort..."
    else
        echo -e "${RED}✗ No .env or .env.docker.example file found!${NC}"
        echo "Please create a .env file with the required environment variables."
        exit 1
    fi
fi
echo -e "${GREEN}✓ Environment file exists${NC}"

# ==========================================
# Build Docker Images
# ==========================================

echo -e "${YELLOW}[3/5] Building Docker images...${NC}"
echo "This may take a few minutes on first run..."

# Use docker compose (v2) or docker-compose (v1)
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

$COMPOSE_CMD build --no-cache

echo -e "${GREEN}✓ Docker images built successfully${NC}"

# ==========================================
# Start Services
# ==========================================

echo -e "${YELLOW}[4/5] Starting services in detached mode...${NC}"

$COMPOSE_CMD up -d

echo -e "${GREEN}✓ Services started${NC}"

# ==========================================
# Health Check
# ==========================================

echo -e "${YELLOW}[5/5] Waiting for services to be healthy...${NC}"

# Wait for MongoDB
echo -n "  MongoDB: "
for i in {1..30}; do
    if docker exec luxethread-mongo mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
        echo -e "${GREEN}ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}timeout${NC}"
    fi
    sleep 2
done

# Wait for Server
echo -n "  Server:  "
for i in {1..30}; do
    if curl -s http://localhost:5000/ &> /dev/null; then
        echo -e "${GREEN}ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}still starting...${NC}"
    fi
    sleep 2
done

# Wait for Client
echo -n "  Client:  "
for i in {1..30}; do
    if curl -s http://localhost/ &> /dev/null; then
        echo -e "${GREEN}ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}still starting...${NC}"
    fi
    sleep 2
done

# ==========================================
# Complete
# ==========================================

echo ""
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║               DEPLOYMENT COMPLETE! 🎉                         ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo "Your LuxeThread application is now running:"
echo ""
echo -e "  ${BLUE}Frontend:${NC}  http://localhost"
echo -e "  ${BLUE}API:${NC}       http://localhost/api"
echo ""
echo "Useful commands:"
echo "  docker compose logs -f        # View logs"
echo "  docker compose ps             # Check status"
echo "  docker compose down           # Stop services"
echo "  docker compose down -v        # Stop and remove volumes"
echo ""
echo -e "${YELLOW}Note: First time setup may take a moment for MongoDB to initialize.${NC}"
