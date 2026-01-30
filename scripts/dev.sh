#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting ODIN Exchange...${NC}"

# Start Docker services
echo -e "${YELLOW}Starting Docker services...${NC}"
docker-compose up -d

# Wait for services
echo -e "${YELLOW}Waiting for database...${NC}"
sleep 5

# Backend setup
cd backend
echo -e "${YELLOW}Setting up database...${NC}"
pnpm prisma generate
pnpm prisma migrate dev --name init 2>/dev/null || pnpm prisma db push
pnpm db:seed 2>/dev/null || echo "Seed already applied"

# Start backend
echo -e "${YELLOW}Starting backend...${NC}"
pnpm start:dev &
BACKEND_PID=$!
cd ..

# Start frontend
cd frontend
echo -e "${YELLOW}Starting frontend...${NC}"
pnpm dev &
FRONTEND_PID=$!
cd ..

# Print info
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ODIN Exchange is running! 🎉                     ║${NC}"
echo -e "${GREEN}╠═══════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Frontend:     http://localhost:3001                          ║${NC}"
echo -e "${GREEN}║  Backend API:  http://localhost:3000                          ║${NC}"
echo -e "${GREEN}║  Swagger Docs: http://localhost:3000/docs                     ║${NC}"
echo -e "${GREEN}║  MailHog:      http://localhost:8025                          ║${NC}"
echo -e "${GREEN}╠═══════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Admin Email:    admin@odin.exchange                          ║${NC}"
echo -e "${GREEN}║  Admin Password: admin123456                                  ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping services...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}Done!${NC}"
}
trap cleanup EXIT

# Wait
wait
