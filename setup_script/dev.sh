#!/bin/bash

#######################################
# ODIN Exchange - Development Runner
# Starts all services for development
#######################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}Starting ODIN Exchange Development Environment${NC}"
echo ""

cd "$PROJECT_DIR"

# Check if Docker is available
if command -v docker >/dev/null 2>&1; then
    echo -e "${GREEN}Starting PostgreSQL and Redis...${NC}"
    docker-compose up -d postgres redis mailhog
    sleep 3
else
    echo -e "${YELLOW}Docker not found. Make sure PostgreSQL and Redis are running manually.${NC}"
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Backend
echo -e "${GREEN}Starting Backend...${NC}"
cd "$PROJECT_DIR/backend"
npm run start:dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start Frontend
echo -e "${GREEN}Starting Frontend...${NC}"
cd "$PROJECT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}Development servers started!${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo "  Frontend: http://localhost:5173"
echo "  API:      http://localhost:3000"
echo "  Admin:    http://localhost:5173/admin"
echo "  MailHog:  http://localhost:8025"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Wait for processes
wait
