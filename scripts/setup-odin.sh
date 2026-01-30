#!/bin/bash
set -e

PROJECT="odin-exchange"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Creating ODIN Exchange project...${NC}"

mkdir -p "$PROJECT"
cd "$PROJECT"

# Download all parts
echo "Downloading project files..."

# Create parts script
cat > create-project.sh << 'SCRIPT_END'
#!/bin/bash
set -e

echo "Creating directories..."

# Backend
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

# Frontend
mkdir -p frontend/src/app/track
mkdir -p frontend/src/components/exchange
mkdir -p frontend/src/lib/api
mkdir -p frontend/public

# Other
mkdir -p scripts
mkdir -p .github/workflows

echo "Directories created!"
SCRIPT_END

chmod +x create-project.sh
./create-project.sh

echo -e "${GREEN}Now run: cd $PROJECT && chmod +x scripts/*.sh${NC}"
echo -e "${YELLOW}Then copy the content files from the provided scripts${NC}"