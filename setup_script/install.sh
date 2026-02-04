#!/bin/bash

#######################################
# ODIN Exchange - Installation Script
# Version: 2.0.0
#######################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored message
print_msg() {
    echo -e "${2}${1}${NC}"
}

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

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

print_header "ODIN Exchange Installer v2.0"

echo "Project directory: $PROJECT_DIR"
echo ""

#######################################
# Check System Requirements
#######################################

print_header "Checking System Requirements"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        print_success "Node.js $(node -v) installed"
    else
        print_error "Node.js 18+ required, found $(node -v)"
        exit 1
    fi
else
    print_error "Node.js not found. Please install Node.js 18+"
    echo "  Install: https://nodejs.org/ or use nvm"
    exit 1
fi

# Check npm
if command_exists npm; then
    print_success "npm $(npm -v) installed"
else
    print_error "npm not found"
    exit 1
fi

# Check Docker
if command_exists docker; then
    print_success "Docker $(docker --version | cut -d' ' -f3 | tr -d ',') installed"
else
    print_warning "Docker not found. Docker is recommended for production."
    echo "  Install: https://docs.docker.com/get-docker/"
fi

# Check Docker Compose
if command_exists docker-compose || docker compose version >/dev/null 2>&1; then
    print_success "Docker Compose installed"
else
    print_warning "Docker Compose not found."
fi

# Check Git
if command_exists git; then
    print_success "Git $(git --version | cut -d' ' -f3) installed"
else
    print_error "Git not found"
    exit 1
fi

#######################################
# Setup Environment
#######################################

print_header "Setting Up Environment"

cd "$PROJECT_DIR"

# Create .env file if not exists
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success "Created .env from .env.example"
        
        # Generate random secrets
        JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
        JWT_REFRESH_SECRET=$(openssl rand -base64 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
        POSTGRES_PASSWORD=$(openssl rand -base64 16 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 16 | head -n 1)
        
        # Update .env with generated secrets
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
            sed -i '' "s/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET/" .env
            sed -i '' "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$POSTGRES_PASSWORD/" .env
        else
            # Linux
            sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
            sed -i "s/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET/" .env
            sed -i "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$POSTGRES_PASSWORD/" .env
        fi
        
        print_success "Generated secure random secrets"
    else
        print_error ".env.example not found"
        exit 1
    fi
else
    print_warning ".env file already exists, skipping"
fi

#######################################
# Install Backend Dependencies
#######################################

print_header "Installing Backend Dependencies"

cd "$PROJECT_DIR/backend"

if [ -f "package.json" ]; then
    npm install
    print_success "Backend dependencies installed"
    
    # Generate Prisma client
    npx prisma generate
    print_success "Prisma client generated"
else
    print_error "backend/package.json not found"
    exit 1
fi

#######################################
# Install Frontend Dependencies
#######################################

print_header "Installing Frontend Dependencies"

cd "$PROJECT_DIR/frontend"

if [ -f "package.json" ]; then
    npm install
    print_success "Frontend dependencies installed"
else
    print_error "frontend/package.json not found"
    exit 1
fi

#######################################
# Generate VAPID Keys for Push Notifications
#######################################

print_header "Generating VAPID Keys"

cd "$PROJECT_DIR/backend"

# Check if web-push is available
if npm list web-push >/dev/null 2>&1 || npx web-push --help >/dev/null 2>&1; then
    # Generate VAPID keys
    VAPID_KEYS=$(npx web-push generate-vapid-keys --json 2>/dev/null || echo "")
    
    if [ -n "$VAPID_KEYS" ]; then
        VAPID_PUBLIC=$(echo "$VAPID_KEYS" | grep -o '"publicKey":"[^"]*"' | cut -d'"' -f4)
        VAPID_PRIVATE=$(echo "$VAPID_KEYS" | grep -o '"privateKey":"[^"]*"' | cut -d'"' -f4)
        
        if [ -n "$VAPID_PUBLIC" ] && [ -n "$VAPID_PRIVATE" ]; then
            cd "$PROJECT_DIR"
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s|VAPID_PUBLIC_KEY=.*|VAPID_PUBLIC_KEY=$VAPID_PUBLIC|" .env
                sed -i '' "s|VAPID_PRIVATE_KEY=.*|VAPID_PRIVATE_KEY=$VAPID_PRIVATE|" .env
            else
                sed -i "s|VAPID_PUBLIC_KEY=.*|VAPID_PUBLIC_KEY=$VAPID_PUBLIC|" .env
                sed -i "s|VAPID_PRIVATE_KEY=.*|VAPID_PRIVATE_KEY=$VAPID_PRIVATE|" .env
            fi
            print_success "VAPID keys generated and saved to .env"
        fi
    fi
else
    print_warning "web-push not available, skipping VAPID key generation"
    echo "  You can generate manually: npx web-push generate-vapid-keys"
fi

#######################################
# Setup Database (Docker)
#######################################

print_header "Database Setup"

cd "$PROJECT_DIR"

if command_exists docker; then
    echo "Starting PostgreSQL and Redis with Docker..."
    
    # Start only database services
    docker-compose up -d postgres redis
    
    # Wait for PostgreSQL to be ready
    echo "Waiting for PostgreSQL to be ready..."
    sleep 5
    
    for i in {1..30}; do
        if docker-compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
            print_success "PostgreSQL is ready"
            break
        fi
        echo "  Waiting... ($i/30)"
        sleep 2
    done
    
    # Run migrations
    cd "$PROJECT_DIR/backend"
    npx prisma migrate deploy 2>/dev/null || npx prisma migrate dev --name init
    print_success "Database migrations applied"
    
else
    print_warning "Docker not available. Please setup PostgreSQL and Redis manually."
    echo ""
    echo "Required services:"
    echo "  - PostgreSQL 15+ on port 5432"
    echo "  - Redis on port 6379"
    echo ""
    echo "After setting up, run:"
    echo "  cd backend && npx prisma migrate deploy"
fi

#######################################
# Build Frontend (Optional)
#######################################

print_header "Build Options"

read -p "Build frontend for production? (y/N): " BUILD_FRONTEND

if [[ "$BUILD_FRONTEND" =~ ^[Yy]$ ]]; then
    cd "$PROJECT_DIR/frontend"
    npm run build
    print_success "Frontend built successfully"
fi

#######################################
# Summary
#######################################

print_header "Installation Complete!"

echo "Next steps:"
echo ""
echo "  1. Configure your .env file with API keys:"
echo "     - TELEGRAM_BOT_TOKEN (optional)"
echo "     - STRIPE_SECRET_KEY (for payments)"
echo "     - PAYPAL_CLIENT_ID (for payments)"
echo "     - FIXER_API_KEY (for fiat rates)"
echo ""
echo "  2. Start development servers:"
echo "     ${GREEN}# Backend${NC}"
echo "     cd backend && npm run start:dev"
echo ""
echo "     ${GREEN}# Frontend (new terminal)${NC}"
echo "     cd frontend && npm run dev"
echo ""
echo "  3. Or start with Docker:"
echo "     docker-compose up -d"
echo ""
echo "  4. Access the application:"
echo "     - Frontend: http://localhost:3001 (dev) or http://localhost:80 (docker)"
echo "     - API: http://localhost:3000"
echo "     - Admin: http://localhost:3001/admin"
echo "     - MailHog: http://localhost:8025"
echo ""
echo "  5. Create admin user:"
echo "     cd backend && npx prisma studio"
echo ""

print_success "ODIN Exchange installed successfully!"
