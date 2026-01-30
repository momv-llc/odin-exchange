
---

## 📄 Файл 10: `run-all.sh` (запускает все скрипты)

```bash
#!/bin/bash

#===============================================================================
# ODIN EXCHANGE - Master Setup Script
# Запуск: chmod +x run-all.sh && ./run-all.sh
#===============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT="odin-exchange"

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║           ODIN EXCHANGE - Complete Setup                      ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Create project directory
mkdir -p "$PROJECT"
cd "$PROJECT"

# Create directories
echo -e "${YELLOW}Creating directories...${NC}"

mkdir -p backend/src/core/{config,database,cache,common/{decorators,filters,guards,interceptors}}
mkdir -p backend/src/modules/orders/{application/{dto,services},presentation/controllers}
mkdir -p backend/src/modules/currencies/{application/services,presentation/controllers}
mkdir -p backend/src/modules/exchange-rates/{application/services,presentation/controllers}
mkdir -p backend/src/modules/auth/{services,strategies,guards,presentation/controllers}
mkdir -p backend/src/modules/admin/dashboard
mkdir -p backend/src/modules/audit/services
mkdir -p backend/src/modules/notifications/{services,listeners}
mkdir -p backend/src/shared/utils
mkdir -p backend/src/health
mkdir -p backend/prisma
mkdir -p frontend/src/app/track
mkdir -p frontend/src/components/{exchange,layout}
mkdir -p frontend/src/lib/api
mkdir -p frontend/public
mkdir -p scripts
mkdir -p .github/workflows

echo -e "${GREEN}✓ Directories created${NC}"

# Download and run all scripts
echo -e "${YELLOW}Downloading setup scripts...${NC}"

# Here you would curl each script, but since we're local, we'll indicate next steps

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              Directory structure created!                      ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo ""
echo "1. Copy each script file to the scripts/ directory:"
echo "   - backend-files.sh"
echo "   - backend-core.sh"
echo "   - backend-modules.sh"
echo "   - backend-modules2.sh"
echo "   - backend-modules3.sh"
echo "   - backend-prisma.sh"
echo "   - frontend-files.sh"
echo "   - scripts-and-docker.sh"
echo ""
echo "2. Run each script:"
echo "   chmod +x scripts/*.sh"
echo "   ./scripts/backend-files.sh"
echo "   ./scripts/backend-core.sh"
echo "   ./scripts/backend-modules.sh"
echo "   ./scripts/backend-modules2.sh"
echo "   ./scripts/backend-modules3.sh"
echo "   ./scripts/backend-prisma.sh"
echo "   ./scripts/frontend-files.sh"
echo "   ./scripts/scripts-and-docker.sh"
echo ""
echo "3. Setup and run:"
echo "   ./scripts/setup.sh"
echo "   ./scripts/dev.sh"
echo ""