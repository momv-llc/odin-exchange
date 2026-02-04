#!/bin/bash

#######################################
# ODIN Exchange - Production Deployment
# Builds and deploys the application
#######################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo ""
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}============================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

print_header "ODIN Exchange Production Deployment"

cd "$PROJECT_DIR"

#######################################
# Pre-deployment Checks
#######################################

print_header "Pre-deployment Checks"

# Check .env
if [ ! -f ".env" ]; then
    print_error ".env file not found"
    exit 1
fi
print_success ".env file exists"

# Check for production secrets
if grep -q "your-super-secret\|sk_test_\|CHANGE_ME" .env 2>/dev/null; then
    print_error "Production secrets not configured in .env"
    echo "  Please update all placeholder values before deploying"
    exit 1
fi
print_success "Secrets configured"

# Check Docker
if ! command -v docker >/dev/null 2>&1; then
    print_error "Docker is required for deployment"
    exit 1
fi
print_success "Docker available"

if ! docker compose version >/dev/null 2>&1 && ! command -v docker-compose >/dev/null 2>&1; then
    print_error "Docker Compose is required for deployment"
    exit 1
fi
print_success "Docker Compose available"

#######################################
# Build Images
#######################################

print_header "Building Docker Images"

# Build backend
echo "Building backend..."
docker build -t odin-exchange-api:latest -f backend/Dockerfile backend/
print_success "Backend image built"

# Build frontend
echo "Building frontend..."
docker build -t odin-exchange-frontend:latest -f frontend/Dockerfile frontend/
print_success "Frontend image built"

#######################################
# Database Migration
#######################################

print_header "Database Migration"

# Start database first
docker-compose up -d postgres redis

# Wait for PostgreSQL
echo "Waiting for PostgreSQL..."
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
        print_success "PostgreSQL is ready"
        break
    fi
    sleep 2
done

# Run migrations
echo "Running database migrations..."
cd backend
npx prisma migrate deploy
cd "$PROJECT_DIR"
print_success "Migrations applied"

#######################################
# Deploy Services
#######################################

print_header "Deploying Services"

# Stop existing containers
docker-compose down

# Start all services
docker-compose up -d

# Wait for services to be healthy
echo "Waiting for services to start..."
sleep 10

# Check service health
if docker-compose ps | grep -q "Up"; then
    print_success "Services are running"
else
    print_error "Some services failed to start"
    docker-compose logs --tail=50
    exit 1
fi

#######################################
# Post-deployment
#######################################

print_header "Post-deployment Checks"

# Check API health
if curl -s http://localhost:3000/health >/dev/null 2>&1; then
    print_success "API is responding"
else
    echo -e "${YELLOW}⚠ API health check failed (may still be starting)${NC}"
fi

# Check frontend
if curl -s http://localhost:80 >/dev/null 2>&1; then
    print_success "Frontend is responding"
else
    echo -e "${YELLOW}⚠ Frontend check failed (may still be starting)${NC}"
fi

#######################################
# Summary
#######################################

print_header "Deployment Complete!"

echo "Services:"
docker-compose ps
echo ""

echo "Access URLs:"
echo "  - Frontend: http://localhost:80"
echo "  - API: http://localhost:3000"
echo "  - Admin: http://localhost:80/admin"
echo ""

echo "Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Restart: docker-compose restart"
echo "  - Stop: docker-compose down"
echo ""

print_success "Deployment successful!"
