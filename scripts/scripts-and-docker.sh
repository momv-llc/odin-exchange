#!/bin/bash
cd "$(dirname "$0")/.."

echo "Creating scripts and docker files..."

#=== docker-compose.yml ===
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: odin-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: odin_exchange
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: odin-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  mailhog:
    image: mailhog/mailhog
    container_name: odin-mailhog
    ports:
      - "1025:1025"
      - "8025:8025"

volumes:
  postgres_data:
  redis_data:
EOF

#=== README.md ===
cat > README.md << 'EOF'
# ODIN Exchange

Production-ready cryptocurrency exchange platform.

## Tech Stack

- **Backend**: NestJS, Prisma, PostgreSQL, Redis, Bull
- **Frontend**: Next.js 14, TanStack Query, Tailwind CSS
- **Infrastructure**: Docker, GitHub Actions

## Quick Start

```bash
# 1. Install dependencies
./scripts/setup.sh

# 2. Start development
./scripts/dev.sh