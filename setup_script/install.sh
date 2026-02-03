#!/bin/bash

#===============================================================================
# ODIN Exchange - GitHub + Docker Installation Script for Ubuntu 24.04
# Клонирует репозиторий, устанавливает Docker, настраивает домены и SSL
# Запуск: chmod +x install.sh && sudo ./install.sh
#===============================================================================

set -e

# Цвета
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

#===============================================================================
# КОНФИГУРАЦИЯ - ИЗМЕНИТЕ ЭТИ ЗНАЧЕНИЯ!
#===============================================================================
GITHUB_REPO="https://github.com/momv-llc/odin-exchange.git"
DOMAIN_FRONTEND="exchange.odineco.online"
DOMAIN_API="api.odineco.online"
CERTBOT_EMAIL="admin@odineco.online"

# Безопасные пароли (без спецсимволов для URL)
POSTGRES_USER="postgres"
POSTGRES_DB="odin_exchange"
POSTGRES_PORT="5432"
POSTGRES_PASSWORD="OdinDB$(date +%s | sha256sum | head -c 16)"

JWT_SECRET="OdinJWT$(date +%s | sha256sum | head -c 32)"
JWT_REFRESH_SECRET="OdinRefresh$(date +%s | sha256sum | head -c 32)"

API_PORT="3000"
FRONTEND_PORT="3001"
FRONTEND_URL="https://${DOMAIN_FRONTEND}"
VITE_API_URL="https://${DOMAIN_API}/api"
#===============================================================================

APP_DIR="/opt/odin-exchange"

log() { echo -e "${GREEN}[✓]${NC} $1"; }
info() { echo -e "${BLUE}[i]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║     ODIN Exchange - GitHub + Docker Installation Script           ║"
echo "║                     Ubuntu 24.04 LTS                              ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Проверка root
[[ $EUID -ne 0 ]] && error "Запустите скрипт с sudo: sudo ./install.sh"

info "GitHub Repo: $GITHUB_REPO"
info "Frontend: https://$DOMAIN_FRONTEND"
info "API: https://$DOMAIN_API"
echo ""

#===============================================================================
# 1. ОБНОВЛЕНИЕ СИСТЕМЫ
#===============================================================================
log "Обновление системы..."
apt update && apt upgrade -y

#===============================================================================
# 2. УСТАНОВКА БАЗОВЫХ ПАКЕТОВ
#===============================================================================
log "Установка базовых пакетов..."
apt install -y \
    curl \
    wget \
    git \
    build-essential \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw \
    fail2ban \
    htop \
    nano \
    unzip \
    jq

#===============================================================================
# 3. УСТАНОВКА DOCKER
#===============================================================================
log "Установка Docker..."

# Удаляем старые версии
apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Docker GPG ключ
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

# Docker репозиторий
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Установка Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Запуск Docker
systemctl start docker
systemctl enable docker

docker --version
docker compose version

log "Docker установлен"

#===============================================================================
# 4. УСТАНОВКА NGINX И CERTBOT
#===============================================================================
log "Установка Nginx и Certbot..."
apt install -y nginx certbot python3-certbot-nginx

systemctl start nginx
systemctl enable nginx

log "Nginx установлен"

#===============================================================================
# 5. НАСТРОЙКА FIREWALL
#===============================================================================
log "Настройка Firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

log "Firewall настроен"

#===============================================================================
# 6. НАСТРОЙКА FAIL2BAN
#===============================================================================
log "Настройка Fail2ban..."
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
backend = systemd

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
port = http,https
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
EOF

systemctl restart fail2ban
systemctl enable fail2ban

log "Fail2ban настроен"

#===============================================================================
# 7. КЛОНИРОВАНИЕ РЕПОЗИТОРИЯ
#===============================================================================
log "Клонирование репозитория..."

# Удаляем старую версию если есть
rm -rf $APP_DIR

# Клонируем
git clone $GITHUB_REPO $APP_DIR

cd $APP_DIR

log "Репозиторий клонирован в $APP_DIR"

#===============================================================================
# 8. ПРОВЕРКА СТРУКТУРЫ ПРОЕКТА
#===============================================================================
log "Проверка структуры проекта..."

if [ ! -f "$APP_DIR/docker-compose.yml" ]; then
    error "docker-compose.yml не найден. Проверьте репозиторий."
fi

if [ ! -f "$APP_DIR/backend/Dockerfile" ] || [ ! -f "$APP_DIR/frontend/Dockerfile" ]; then
    error "Dockerfile не найдены в backend/ или frontend/. Проверьте репозиторий."
fi

#===============================================================================
# 9. СОЗДАНИЕ .ENV ФАЙЛА
#===============================================================================
log "Создание .env файла..."

if [ ! -f "$APP_DIR/.env.example" ]; then
    error ".env.example не найден. Проверьте репозиторий."
fi

cp "$APP_DIR/.env.example" "$APP_DIR/.env"

sed -i \
    -e "s/^POSTGRES_USER=.*/POSTGRES_USER=${POSTGRES_USER}/" \
    -e "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=${POSTGRES_PASSWORD}/" \
    -e "s/^POSTGRES_DB=.*/POSTGRES_DB=${POSTGRES_DB}/" \
    -e "s/^POSTGRES_PORT=.*/POSTGRES_PORT=${POSTGRES_PORT}/" \
    -e "s|^DATABASE_URL=.*|DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public|" \
    -e "s|^DIRECT_URL=.*|DIRECT_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public|" \
    -e "s/^JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" \
    -e "s/^JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}/" \
    -e "s/^API_PORT=.*/API_PORT=${API_PORT}/" \
    -e "s/^FRONTEND_PORT=.*/FRONTEND_PORT=${FRONTEND_PORT}/" \
    -e "s|^FRONTEND_URL=.*|FRONTEND_URL=${FRONTEND_URL}|" \
    "$APP_DIR/.env"

if ! grep -q "^VITE_API_URL=" "$APP_DIR/.env"; then
    echo "VITE_API_URL=${VITE_API_URL}" >> "$APP_DIR/.env"
else
    sed -i "s|^VITE_API_URL=.*|VITE_API_URL=${VITE_API_URL}|" "$APP_DIR/.env"
fi

log ".env файл создан"

#===============================================================================
# 10. НАСТРОЙКА NGINX
#===============================================================================
log "Настройка Nginx..."

# API конфигурация
cat > /etc/nginx/sites-available/$DOMAIN_API << EOF
server {
    listen 80;
    server_name $DOMAIN_API;

    location / {
        proxy_pass http://127.0.0.1:${API_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }
}
EOF

# Frontend конфигурация
cat > /etc/nginx/sites-available/$DOMAIN_FRONTEND << EOF
server {
    listen 80;
    server_name $DOMAIN_FRONTEND www.$DOMAIN_FRONTEND;

    location / {
        proxy_pass http://127.0.0.1:${FRONTEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Активируем сайты
ln -sf /etc/nginx/sites-available/$DOMAIN_API /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/$DOMAIN_FRONTEND /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl reload nginx

log "Nginx настроен"

#===============================================================================
# 11. СБОРКА И ЗАПУСК DOCKER
#===============================================================================
log "Сборка Docker образов..."

cd $APP_DIR

# Собираем образы
docker compose build --no-cache

log "Запуск Docker контейнеров..."

# Запускаем
docker compose up -d

# Ждем запуска
log "Ожидание готовности сервисов..."
sleep 15

# Проверяем статус
docker compose ps

log "Docker контейнеры запущены"

#===============================================================================
# 12. МИГРАЦИИ И SEED
#===============================================================================
log "Запуск миграций базы данных..."

# Ждем пока PostgreSQL будет готов
for i in {1..30}; do
    if docker compose exec -T postgres pg_isready -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" > /dev/null 2>&1; then
        break
    fi
    echo "Ожидание PostgreSQL... $i/30"
    sleep 2
done

# Запускаем миграции
docker compose exec -T api npx prisma migrate deploy 2>/dev/null || {
    warn "Миграции не найдены, создаём..."
    docker compose exec -T api npx prisma db push --accept-data-loss 2>/dev/null || true
}

# Запускаем seed если есть
log "Заполнение базы данных..."
docker compose exec -T api npx prisma db seed 2>/dev/null || {
    info "Seed файл не найден, пропускаем..."
}

log "База данных настроена"

#===============================================================================
# 13. SSL СЕРТИФИКАТЫ
#===============================================================================
log "Получение SSL сертификатов..."

# API SSL
certbot --nginx -d $DOMAIN_API \
    --non-interactive --agree-tos \
    -m $CERTBOT_EMAIL --redirect || warn "SSL для API не получен"

# Frontend SSL
certbot --nginx -d $DOMAIN_FRONTEND -d www.$DOMAIN_FRONTEND \
    --non-interactive --agree-tos \
    -m $CERTBOT_EMAIL --redirect || warn "SSL для Frontend не получен"

# Автообновление SSL
systemctl enable certbot.timer
systemctl start certbot.timer

log "SSL настроен"

#===============================================================================
# 14. СКРИПТ АВТОМАТИЧЕСКОГО ОБНОВЛЕНИЯ
#===============================================================================
log "Создание скрипта автообновления..."

cat > /usr/local/bin/odin-update << 'UPDATEEOF'
#!/bin/bash
# ODIN Exchange - Auto Update Script

set -e

APP_DIR="/opt/odin-exchange"
LOG_FILE="/var/log/odin-update.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

cd $APP_DIR

# Проверяем есть ли изменения
git fetch origin

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main 2>/dev/null || git rev-parse origin/master)

if [ "$LOCAL" = "$REMOTE" ]; then
    log "Нет обновлений"
    exit 0
fi

log "Обнаружены обновления! Обновляем..."

# Сохраняем .env
cp .env .env.backup

# Pull изменений
git reset --hard
git pull origin main 2>/dev/null || git pull origin master

# Восстанавливаем .env
cp .env.backup .env

# Пересобираем и перезапускаем
log "Пересборка Docker образов..."
docker compose build --no-cache

log "Перезапуск контейнеров..."
docker compose down
docker compose up -d

# Миграции
log "Запуск миграций..."
sleep 10
docker compose exec -T api npx prisma migrate deploy 2>/dev/null || true

log "Обновление завершено!"

# Очистка старых образов
docker image prune -f

log "Очистка завершена"
UPDATEEOF

chmod +x /usr/local/bin/odin-update

log "Скрипт обновления создан: /usr/local/bin/odin-update"

#===============================================================================
# 15. CRON ДЛЯ АВТООБНОВЛЕНИЯ
#===============================================================================
log "Настройка автоматических обновлений..."

# Создаем cron задачу (каждые 5 минут проверяет обновления)
cat > /etc/cron.d/odin-update << 'EOF'
# ODIN Exchange - Auto Update (каждые 5 минут)
*/5 * * * * root /usr/local/bin/odin-update >> /var/log/odin-update.log 2>&1
EOF

# Также добавляем ежедневную очистку логов
cat >> /etc/cron.d/odin-update << 'EOF'
# Очистка логов старше 7 дней
0 0 * * * root find /var/log -name "odin-*.log" -mtime +7 -delete
EOF

log "Автообновление настроено (каждые 5 минут)"

#===============================================================================
# 16. СКРИПТЫ УПРАВЛЕНИЯ
#===============================================================================
log "Создание скриптов управления..."

# Статус
cat > /usr/local/bin/odin-status << 'EOF'
#!/bin/bash
echo "=== ODIN Exchange Status ==="
cd /opt/odin-exchange
docker compose ps
echo ""
echo "=== Последние логи API ==="
docker compose logs api --tail 20
EOF
chmod +x /usr/local/bin/odin-status

# Логи
cat > /usr/local/bin/odin-logs << 'EOF'
#!/bin/bash
cd /opt/odin-exchange
docker compose logs -f ${1:-api}
EOF
chmod +x /usr/local/bin/odin-logs

# Рестарт
cat > /usr/local/bin/odin-restart << 'EOF'
#!/bin/bash
cd /opt/odin-exchange
docker compose restart
echo "✓ ODIN Exchange перезапущен"
EOF
chmod +x /usr/local/bin/odin-restart

# Остановка
cat > /usr/local/bin/odin-stop << 'EOF'
#!/bin/bash
cd /opt/odin-exchange
docker compose down
echo "✓ ODIN Exchange остановлен"
EOF
chmod +x /usr/local/bin/odin-stop

# Запуск
cat > /usr/local/bin/odin-start << 'EOF'
#!/bin/bash
cd /opt/odin-exchange
docker compose up -d
echo "✓ ODIN Exchange запущен"
EOF
chmod +x /usr/local/bin/odin-start

log "Скрипты управления созданы"

#===============================================================================
# 17. СОХРАНЕНИЕ CREDENTIALS
#===============================================================================
log "Сохранение учётных данных..."

cat > /root/odin-credentials.txt << EOF
═══════════════════════════════════════════════════════════════════
                    ODIN EXCHANGE - CREDENTIALS
═══════════════════════════════════════════════════════════════════

📂 GitHub Repository:
   $GITHUB_REPO

🌐 URLs:
   Frontend: https://$DOMAIN_FRONTEND
   API:      https://$DOMAIN_API
   Health:   https://$DOMAIN_API/health

🗄️ Database:
   Host:     postgres (internal Docker network)
   Name:     $POSTGRES_DB
   User:     $POSTGRES_USER
   Password: $POSTGRES_PASSWORD

🔐 JWT:
   Secret:         $JWT_SECRET
   Refresh Secret: $JWT_REFRESH_SECRET

═══════════════════════════════════════════════════════════════════
                       КОМАНДЫ УПРАВЛЕНИЯ
═══════════════════════════════════════════════════════════════════

🔧 Управление:
   odin-status    - Статус всех сервисов
   odin-logs      - Просмотр логов (odin-logs api / odin-logs frontend)
   odin-restart   - Перезапуск всех сервисов
   odin-start     - Запуск сервисов
   odin-stop      - Остановка сервисов
   odin-update    - Ручное обновление из GitHub

🐳 Docker:
   cd /opt/odin-exchange
   docker compose ps           - Статус контейнеров
   docker compose logs -f      - Все логи в реальном времени
   docker compose exec api sh  - Shell в API контейнере

📊 Мониторинг:
   curl https://$DOMAIN_API/health
   curl https://$DOMAIN_API/api/exchange-rates

🔄 Автообновление:
   Проверка обновлений: каждые 5 минут
   Лог обновлений: /var/log/odin-update.log

═══════════════════════════════════════════════════════════════════
EOF

chmod 600 /root/odin-credentials.txt

#===============================================================================
# ГОТОВО!
#===============================================================================
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        ODIN EXCHANGE - УСТАНОВКА ЗАВЕРШЕНА! 🎉                    ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}🌐 URLs:${NC}"
echo "   Frontend: https://$DOMAIN_FRONTEND"
echo "   API:      https://$DOMAIN_API"
echo "   Health:   https://$DOMAIN_API/health"
echo ""
echo -e "${BLUE}🔧 Команды управления:${NC}"
echo "   odin-status    - Статус сервисов"
echo "   odin-logs      - Логи (odin-logs api)"
echo "   odin-restart   - Перезапуск"
echo "   odin-update    - Ручное обновление"
echo ""
echo -e "${YELLOW}📋 Учётные данные сохранены в: /root/odin-credentials.txt${NC}"
echo ""
echo -e "${GREEN}🔄 Автообновление включено (каждые 5 минут)${NC}"
echo ""

# Финальная проверка
echo -e "${BLUE}📊 Статус сервисов:${NC}"
docker compose ps
echo ""

# Тест здоровья
echo -e "${BLUE}🏥 Health check:${NC}"
sleep 5
curl -s https://$DOMAIN_API/health 2>/dev/null | jq . 2>/dev/null || curl -s http://localhost:${API_PORT}/health | jq . 2>/dev/null || echo "API ещё запускается..."
echo ""
