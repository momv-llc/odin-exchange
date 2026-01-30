#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🔧 Setting up ODIN Exchange...${NC}"

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required"; exit 1; }

# Install pnpm if needed
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}Installing pnpm...${NC}"
    npm install -g pnpm
fi

# Backend setup
echo -e "${YELLOW}📦 Setting up backend...${NC}"
cd backend
cp .env.example .env 2>/dev/null || true
pnpm install
cd ..

# Frontend setup
echo -e "${YELLOW}📦 Setting up frontend...${NC}"
cd frontend
cp .env.example .env.local 2>/dev/null || true
pnpm install
cd ..

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  ./scripts/dev.sh"
