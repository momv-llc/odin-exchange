# ODIN Exchange - Установочный скрипт

## 📋 Описание

Полностью автоматический установочный скрипт для развертывания **ODIN Exchange** на Ubuntu 24.04 LTS с использованием Docker, Nginx и автоматической синхронизацией с GitHub.

## ✨ Возможности

- ✅ **Автоматическая установка** всех зависимостей (Docker, Nginx, Certbot, etc.)
- ✅ **Клонирование репозитория** из GitHub
- ✅ **Docker-контейнеризация** всех сервисов (API, Frontend, PostgreSQL, Redis)
- ✅ **SSL сертификаты** от Let's Encrypt
- ✅ **Автообновление** из GitHub каждые 5 минут
- ✅ **Firewall и Fail2ban** для безопасности
- ✅ **Скрипты управления** (odin-status, odin-logs, odin-restart)

## 🚀 Быстрый старт

### Требования

- Ubuntu 24.04 LTS
- Root доступ
- Домены с настроенными DNS A-записями:
  - `exchange.odineco.online` → IP сервера
  - `api.odineco.online` → IP сервера

### Установка

1. **Загрузите скрипт на сервер:**
```bash
wget https://raw.githubusercontent.com/momv-llc/odin-exchange/main/install.sh
# или
curl -O https://raw.githubusercontent.com/momv-llc/odin-exchange/main/install.sh
```

2. **Откройте и настройте параметры:**
```bash
nano install.sh
```

Измените следующие параметры в начале скрипта:
```bash
GITHUB_REPO="https://github.com/momv-llc/odin-exchange.git"
DOMAIN_FRONTEND="exchange.odineco.online"
DOMAIN_API="api.odineco.online"
ADMIN_EMAIL="admin@odin.exchange"
ADMIN_PASSWORD="admin123456"
```

3. **Запустите установку:**
```bash
chmod +x install.sh
sudo ./install.sh
```

4. **Дождитесь завершения** (обычно 10-15 минут)

## 📦 Что устанавливается

### Системные пакеты
- Docker и Docker Compose
- Nginx
- Certbot (для SSL)
- Fail2ban (защита от брутфорса)
- UFW (firewall)

### Docker контейнеры
- **odin-api** - NestJS API (порт 3000)
- **odin-frontend** - Next.js Frontend (порт 3001)
- **odin-postgres** - PostgreSQL 16
- **odin-redis** - Redis 7

### Скрипты управления
- `odin-status` - Показать статус сервисов
- `odin-logs` - Просмотр логов
- `odin-restart` - Перезапуск сервисов
- `odin-start` - Запуск сервисов
- `odin-stop` - Остановка сервисов
- `odin-update` - Ручное обновление из GitHub

## 🔧 Использование

### Проверка статуса
```bash
odin-status
```

### Просмотр логов
```bash
# Логи API
odin-logs api

# Логи Frontend
odin-logs frontend

# Все логи в реальном времени
cd /opt/odin-exchange
docker compose logs -f
```

### Перезапуск сервисов
```bash
odin-restart
```

### Ручное обновление
```bash
odin-update
```

### Docker команды
```bash
cd /opt/odin-exchange

# Статус контейнеров
docker compose ps

# Логи конкретного сервиса
docker compose logs -f api

# Shell в контейнере
docker compose exec api sh

# Пересборка образов
docker compose build --no-cache

# Полный перезапуск
docker compose down && docker compose up -d
```

### Работа с базой данных
```bash
# Миграции
docker compose exec api npx prisma migrate deploy

# Seed данных
docker compose exec api npx prisma db seed

# Prisma Studio (GUI)
docker compose exec api npx prisma studio

# PostgreSQL Shell
docker compose exec postgres psql -U odin_user -d odin_exchange
```

## 🔄 Автоматическая синхронизация с GitHub

### Как работает

Скрипт настраивает автоматическое обновление из GitHub:
- Каждые 5 минут проверяет наличие изменений в репозитории
- Если есть изменения - автоматически:
  1. Скачивает изменения (git pull)
  2. Пересобирает Docker образы
  3. Перезапускает контейнеры
  4. Запускает миграции базы данных

### Логи автообновления
```bash
tail -f /var/log/odin-update.log
```

### Отправка изменений на GitHub

Если вы хотите отправлять изменения с сервера обратно на GitHub:

1. **Настройте Git:**
```bash
chmod +x setup-git.sh
sudo ./setup-git.sh
```

2. **Используйте команду:**
```bash
odin-sync "Описание изменений"
```

## 🌐 Доступ к приложению

После установки:

- **Frontend:** https://exchange.odineco.online
- **API:** https://api.odineco.online
- **Health Check:** https://api.odineco.online/health
- **API Docs:** https://api.odineco.online/api/v1/docs

## 🔐 Учётные данные

Все учётные данные сохраняются в файле:
```bash
cat /root/odin-credentials.txt
```

Содержит:
- URLs
- Логин/пароль админа
- Пароли БД, Redis, JWT секреты
- Команды управления

## 🛡️ Безопасность

Скрипт настраивает:

### Firewall (UFW)
- Открыт только SSH и HTTP/HTTPS
- Все остальное заблокировано

### Fail2ban
- Защита SSH от брутфорса
- Защита Nginx от атак
- Автоматическая блокировка после 3-5 неудачных попыток

### SSL сертификаты
- Автоматическое получение от Let's Encrypt
- Автоматическое обновление сертификатов

## 📊 Мониторинг

### Health check API
```bash
curl https://api.odineco.online/health
```

### Курсы валют
```bash
curl https://api.odineco.online/api/v1/rates
```

### Использование ресурсов
```bash
docker stats
```

### Системный мониторинг
```bash
htop
```

## 🔧 Структура проекта

```
/opt/odin-exchange/
├── backend/               # NestJS API
│   ├── src/
│   ├── prisma/           # Database schema
│   ├── Dockerfile
│   └── package.json
├── frontend/             # Next.js Frontend
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml    # Docker services
└── .env                  # Environment variables
```

## 🐛 Решение проблем

### Сервисы не запускаются
```bash
# Проверить логи
odin-logs api

# Проверить статус
odin-status

# Перезапустить
odin-restart
```

### SSL сертификаты не работают
```bash
# Проверить DNS записи
dig exchange.odineco.online
dig api.odineco.online

# Переполучить сертификаты
certbot --nginx -d api.odineco.online --force-renew
```

### База данных не доступна
```bash
# Проверить PostgreSQL
docker compose exec postgres pg_isready -U odin_user

# Перезапустить БД
docker compose restart postgres
```

### Миграции не применяются
```bash
# Применить вручную
docker compose exec api npx prisma migrate deploy

# Или сбросить БД (ОСТОРОЖНО!)
docker compose exec api npx prisma db push --accept-data-loss
```

## 📝 Обновление конфигурации

### Изменение переменных окружения
```bash
cd /opt/odin-exchange
nano .env
docker compose restart
```

### Изменение доменов
```bash
# 1. Обновить .env
nano /opt/odin-exchange/.env

# 2. Обновить Nginx конфиг
nano /etc/nginx/sites-available/api.odineco.online

# 3. Перезапустить
nginx -t && systemctl reload nginx
odin-restart
```

## 🔄 Удаление

Если нужно удалить ODIN Exchange:

```bash
# Остановить и удалить контейнеры
cd /opt/odin-exchange
docker compose down -v

# Удалить файлы проекта
rm -rf /opt/odin-exchange

# Удалить скрипты
rm /usr/local/bin/odin-*

# Удалить cron задачу
rm /etc/cron.d/odin-update

# Удалить Nginx конфиги
rm /etc/nginx/sites-available/exchange.odineco.online
rm /etc/nginx/sites-available/api.odineco.online
rm /etc/nginx/sites-enabled/exchange.odineco.online
rm /etc/nginx/sites-enabled/api.odineco.online
systemctl reload nginx
```

## 📞 Поддержка

- **GitHub:** https://github.com/momv-llc/odin-exchange
- **Issues:** https://github.com/momv-llc/odin-exchange/issues

## 📄 Лицензия

MIT License

---

**ODIN Exchange** - Professional cryptocurrency exchange platform
