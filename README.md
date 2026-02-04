# ODIN Exchange

Полнофункциональная платформа для обмена валют с поддержкой криптовалют, фиатных валют и денежных переводов.

## 🚀 Технологический стек

### Backend
- **NestJS** - фреймворк для Node.js
- **Prisma** - ORM для работы с базой данных
- **PostgreSQL** - основная база данных
- **Redis** - кеширование и очереди задач
- **Bull** - обработка фоновых задач
- **JWT** - аутентификация
- **Web Push** - push-уведомления

### Frontend
- **React 18** + **Vite** - быстрая разработка
- **TailwindCSS** - стилизация
- **React Router** - маршрутизация
- **Axios** - HTTP клиент
- **i18next** - мультиязычность

### Интеграции
- **Stripe** - карточные платежи
- **PayPal** - онлайн платежи
- **CoinGecko** - курсы криптовалют
- **Binance API** - торговые данные
- **Fixer.io** - курсы фиатных валют

### Инфраструктура
- **Docker** + **Docker Compose** - контейнеризация
- **Nginx** - reverse proxy для фронтенда
- **MailHog** - тестирование email (development)

## 📋 Реализованные функции

### Аутентификация и авторизация
- ✅ JWT аутентификация для пользователей
- ✅ JWT аутентификация для админов
- ✅ Двухфакторная аутентификация (2FA) для админов
- ✅ Роли: SUPER_ADMIN, ADMIN, OPERATOR
- ✅ Регистрация и авторизация пользователей
- ✅ Восстановление пароля

### Админ-панель
- ✅ Dashboard с метриками
- ✅ Управление пользователями
- ✅ Управление заказами
- ✅ Управление локациями (страны/города)
- ✅ Управление способами оплаты
- ✅ Управление переводами
- ✅ Промокоды и скидки
- ✅ Отзывы клиентов
- ✅ Настройки системы
- ✅ KYC верификация пользователей
- ✅ Управление рефералами
- ✅ Расширенная аналитика

### Пользовательская часть
- ✅ Тикер курсов валют (криптовалюты, фиат, товары)
- ✅ Калькулятор обмена
- ✅ Выбор локации
- ✅ Способы оплаты
- ✅ Форма денежного перевода
- ✅ Чат поддержки
- ✅ Отзывы
- ✅ Мультиязычность (EN, DE, RU, UA)
- ✅ KYC верификация
- ✅ Реферальная программа

### Уведомления
- ✅ Telegram бот
- ✅ WhatsApp интеграция
- ✅ Email уведомления
- ✅ Push-уведомления (Web Push)

### Платёжные системы
- ✅ **Stripe** - карточные платежи, Payment Intents, Webhooks
- ✅ **PayPal** - Checkout Orders, Capture, Refunds
- ✅ **Криптоплатежи** - BTC, ETH, USDT (ERC20/TRC20), LTC, SOL
- ✅ QR-коды для крипто адресов
- ✅ Мониторинг транзакций

### KYC Верификация
- ✅ Многоуровневая верификация (NONE, BASIC, INTERMEDIATE, ADVANCED)
- ✅ Загрузка документов (паспорт, ID, водительские права)
- ✅ Селфи с документом
- ✅ Статусы: NOT_STARTED, PENDING, IN_REVIEW, APPROVED, REJECTED
- ✅ AML/Санкционные проверки
- ✅ Админ-панель для проверки документов

### Реферальная система
- ✅ Уникальные реферальные коды
- ✅ Автоматическое начисление комиссий
- ✅ Настраиваемые уровни вознаграждений
- ✅ Статистика и история выплат
- ✅ Lifetime комиссии (опционально)

### Аналитика
- ✅ Трекинг событий (page views, actions)
- ✅ Ежедневная статистика
- ✅ Конверсионная воронка
- ✅ Источники трафика (UTM)
- ✅ Аналитика по пользователям
- ✅ Топ пользователи по объёму

### API курсов валют
- ✅ **CoinGecko** - криптовалюты с рыночной капитализацией
- ✅ **Binance** - реальные торговые пары
- ✅ **Fixer.io** - фиатные валюты
- ✅ Автообновление: крипто каждую минуту, фиат каждый час
- ✅ История курсов для графиков

### API модули
- ✅ Auth (пользователи)
- ✅ Admin Auth
- ✅ Users
- ✅ Orders
- ✅ Locations
- ✅ Payment Methods
- ✅ Transfers
- ✅ Promo Codes
- ✅ Reviews
- ✅ Notifications (Telegram, WhatsApp, Push)
- ✅ Payments (Stripe, PayPal, Crypto)
- ✅ KYC
- ✅ Referrals
- ✅ Analytics
- ✅ Exchange Rates

## 🛠 Установка и запуск

### Требования
- Node.js 20+ (рекомендуется 20.x LTS)
- npm 9+
- Docker и Docker Compose (рекомендуется)
- Git

## 📦 Полный список зависимостей

### Системные зависимости
- Node.js 18+ (рекомендуется 20.x)
- npm 9+
- PostgreSQL 15+
- Redis 7+
- Docker 20+ и Docker Compose 2+ (для контейнерного запуска)
- Nginx (для production)

### Backend зависимости (runtime)
- @nestjs/axios, @nestjs/bull, @nestjs/common, @nestjs/config, @nestjs/core
- @nestjs/event-emitter, @nestjs/jwt, @nestjs/passport, @nestjs/platform-express
- @nestjs/schedule, @nestjs/swagger, @nestjs/terminus, @nestjs/throttler
- @prisma/client, argon2, axios, bcrypt, bull, class-transformer, class-validator
- cors, helmet, ioredis, joi, nanoid, otplib, passport, passport-jwt, passport-local
- qrcode, reflect-metadata, rxjs, stripe, web-push

### Backend зависимости (dev)
- @nestjs/cli, @nestjs/schematics, @nestjs/testing
- @types/bcrypt, @types/express, @types/jest, @types/multer, @types/node
- @types/nodemailer, @types/passport-jwt, @types/passport-local, @types/qrcode
- @types/uuid, @types/web-push
- @typescript-eslint/eslint-plugin, @typescript-eslint/parser
- eslint, jest, prisma, ts-jest, ts-node, typescript

### Frontend зависимости (runtime)
- axios, clsx, lucide-react, react, react-dom, react-router-dom, tailwind-merge

### Frontend зависимости (dev)
- @tailwindcss/postcss, @tailwindcss/vite, @types/node, @types/react, @types/react-dom
- @vitejs/plugin-react, autoprefixer, postcss, tailwindcss, typescript
- vite, vite-plugin-singlefile

## 🧩 Скрипты установки и запуска

| Скрипт | Назначение |
|--------|------------|
| `setup_script/install.sh` | Полная автоматическая установка (интерактивно) |
| `setup_script/setup-git.sh` | Настройка git hooks и конфигурации |
| `setup_script/dev.sh` | Быстрый запуск для разработки |
| `setup_script/deploy.sh` | Production деплой через Docker |

## ✅ Пошаговая инструкция по установке

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd odin-exchange
```

### 2. Настройка окружения

```bash
# Скопируйте пример конфигурации
cp .env.example .env

# Отредактируйте .env файл с вашими настройками
nano .env
```

### 3. (Рекомендуется) Автоматическая установка

```bash
./setup_script/install.sh
```

Скрипт проверит требования, создаст `.env`, сгенерирует JWT/VAPID ключи, установит зависимости,
поднимет PostgreSQL/Redis через Docker и применит миграции Prisma.

### 4. Запуск через Docker (ручной)

```bash
# Запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

### 3.1. Production деплой (Ubuntu 24.04 + Docker + TLS)

> Пример рассчитан на домены `ex.odineco.online` (frontend) и `api.odineco.online` (backend).

```bash
# 1) Установите Docker и Compose plugin
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 2) Клонируйте проект и подготовьте .env
git clone <repository-url>
cd odin-exchange
cp .env.example .env
nano .env

# 3) Запустите сервисы
docker compose up -d
```

```bash
# 4) Установите и настройте Nginx reverse-proxy
sudo apt install -y nginx
sudo cp deploy/nginx/odin-exchange.conf /etc/nginx/sites-available/odin-exchange.conf
sudo ln -s /etc/nginx/sites-available/odin-exchange.conf /etc/nginx/sites-enabled/odin-exchange.conf
sudo nginx -t
sudo systemctl reload nginx

# 5) Получите TLS сертификаты (Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ex.odineco.online -d api.odineco.online
```

> После выпуска сертификатов Certbot автоматически добавит HTTPS-блоки в конфиг Nginx.

### 4. Локальная разработка

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev

# Frontend (в отдельном терминале)
cd frontend
npm install
npm run dev
```

### 5. Проверка запуска

- Frontend: http://localhost:3001 (или порт, указанный Vite)
- API: http://localhost:3000
- MailHog (если используется через Docker): http://localhost:8025
### 6. Быстрый старт для разработки (альтернатива)

```bash
./setup_script/dev.sh
```

## 🔧 Конфигурация

### Переменные окружения (.env)

```env
# ============ База данных ============
DATABASE_URL=postgresql://postgres:password@localhost:5432/odin_exchange
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=odin_exchange

# ============ Redis ============
REDIS_HOST=localhost
REDIS_PORT=6379

# ============ JWT ============
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ============ Email (SMTP) ============
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@odin-exchange.com

# ============ Telegram бот ============
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_ADMIN_CHAT_ID=your-chat-id

# ============ WhatsApp Business API ============
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_API_TOKEN=your-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-id

# ============ API курсов валют ============
COINGECKO_API_KEY=           # Опционально, для higher rate limits
FIXER_API_KEY=your-fixer-key # Для фиатных курсов

# ============ Stripe ============
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ============ PayPal ============
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-secret
PAYPAL_SANDBOX=true

# ============ Push уведомления ============
# Сгенерировать: npx web-push generate-vapid-keys
VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
VAPID_EMAIL=mailto:admin@odin-exchange.com

# ============ Frontend ============
FRONTEND_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
VITE_API_URL=http://localhost:3000/api/v1

# ============ Rate Limiting ============
THROTTLE_TTL=60
THROTTLE_LIMIT=60
```

## 📁 Структура проекта

```
odin-exchange/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/              # Аутентификация пользователей
│   │   │   ├── admin-auth/        # Аутентификация админов
│   │   │   ├── users/             # Управление пользователями
│   │   │   ├── users-admin/       # Админ управление пользователями
│   │   │   ├── orders/            # Заказы
│   │   │   ├── locations/         # Локации (страны/города)
│   │   │   ├── payment-methods/   # Способы оплаты
│   │   │   ├── transfers/         # Денежные переводы
│   │   │   ├── promo/             # Промокоды
│   │   │   ├── reviews/           # Отзывы
│   │   │   ├── telegram/          # Telegram уведомления
│   │   │   ├── whatsapp/          # WhatsApp уведомления
│   │   │   ├── exchange-rates/    # API курсов валют
│   │   │   │   └── providers/     # CoinGecko, Binance, Fixer
│   │   │   ├── payments/          # Платёжные шлюзы
│   │   │   │   └── providers/     # Stripe, PayPal, Crypto
│   │   │   ├── kyc/               # KYC верификация
│   │   │   ├── referrals/         # Реферальная система
│   │   │   ├── analytics/         # Аналитика
│   │   │   └── push-notifications/# Push уведомления
│   │   ├── common/                # Общие утилиты и guards
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma          # Схема базы данных (50+ моделей)
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/            # React компоненты
│   │   ├── pages/                 # Страницы
│   │   │   ├── KycVerification.tsx
│   │   │   └── ReferralProgram.tsx
│   │   ├── admin/                 # Админ-панель
│   │   │   └── pages/
│   │   │       └── Analytics.tsx
│   │   ├── contexts/              # React контексты
│   │   ├── services/              # API сервисы
│   │   └── i18n/                  # Переводы
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🔌 API Endpoints

### Публичные
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Авторизация
- `POST /api/auth/forgot-password` - Восстановление пароля
- `GET /api/locations/countries` - Список стран
- `GET /api/locations/cities/:countryId` - Города страны
- `GET /api/payment-methods` - Способы оплаты
- `GET /api/reviews` - Отзывы
- `GET /api/exchange-rates` - Текущие курсы валют
- `GET /api/exchange-rates/:base/:quote` - Курс пары

### Защищённые (требуют JWT)
- `GET /api/users/profile` - Профиль пользователя
- `POST /api/orders` - Создание заказа
- `GET /api/orders` - Мои заказы
- `POST /api/transfers` - Создание перевода

### KYC
- `GET /api/kyc/status` - Статус верификации
- `POST /api/kyc/submit` - Отправка данных
- `POST /api/kyc/document` - Загрузка документа
- `POST /api/kyc/submit-for-review` - Отправить на проверку

### Рефералы
- `GET /api/referrals/stats` - Статистика рефералов
- `POST /api/referrals/generate-code` - Создать реф. код
- `GET /api/referrals/my-referrals` - Мои рефералы
- `GET /api/referrals/my-rewards` - Мои вознаграждения
- `POST /api/referrals/apply` - Применить реф. код

### Платежи
- `POST /api/payments` - Создать платёж
- `GET /api/payments/my` - Мои платежи
- `GET /api/payments/:code` - Статус платежа
- `POST /api/payments/webhook/stripe` - Stripe webhook
- `POST /api/payments/webhook/paypal` - PayPal webhook

### Push уведомления
- `POST /api/push/subscribe` - Подписаться
- `DELETE /api/push/unsubscribe` - Отписаться

### Аналитика
- `POST /api/analytics/track` - Трекинг события

### Админ API
- `POST /api/admin/auth/login` - Вход в админку
- `POST /api/admin/auth/verify-2fa` - Подтверждение 2FA
- `GET /api/admin/users` - Список пользователей
- `GET /api/admin/orders` - Все заказы
- `CRUD /api/admin/locations/*` - Управление локациями
- `CRUD /api/admin/payment-methods/*` - Способы оплаты
- `CRUD /api/admin/transfers/*` - Переводы
- `CRUD /api/admin/promo/*` - Промокоды
- `GET /api/admin/kyc` - KYC заявки
- `POST /api/admin/kyc/:id/approve` - Одобрить KYC
- `POST /api/admin/kyc/:id/reject` - Отклонить KYC
- `GET /api/admin/referrals/stats` - Статистика рефералов
- `GET /api/admin/analytics/dashboard` - Дашборд аналитики
- `POST /api/admin/push/send/all` - Отправить push всем

## 🌐 Доступ к сервисам

После запуска через Docker:

| Сервис | URL | Описание |
|--------|-----|----------|
| Frontend | http://localhost:80 | Основной сайт |
| API | http://localhost:3000 | Backend API |
| MailHog | http://localhost:8025 | Просмотр email |
| PostgreSQL | localhost:5432 | База данных |
| Redis | localhost:6379 | Кеш |

## 👤 Доступ в админ-панель

1. Перейдите на `/admin/login`
2. Используйте учётные данные администратора
3. При включённой 2FA введите код из приложения

### Создание первого админа

```bash
# Через Prisma Studio
cd backend
npx prisma studio

# Или через SQL
INSERT INTO "admins" (id, email, password_hash, role, is_2fa_enabled, is_active)
VALUES (
  gen_random_uuid(),
  'admin@example.com',
  '$2b$10$...', -- bcrypt hash пароля
  'SUPER_ADMIN',
  false,
  true
);
```

## 📊 База данных

### Основные модели (50+)

**Пользователи и авторизация:**
- `User`, `UserSession`, `Admin`, `AdminSession`

**Заказы и валюты:**
- `Order`, `OrderStatusHistory`, `Currency`, `ExchangeRate`, `ExchangePair`

**Курсы валют:**
- `LiveExchangeRate`, `RateHistory`

**Платежи:**
- `Payment`, `Refund`, `CryptoWallet`, `CryptoTransaction`

**KYC:**
- `KycVerification`, `KycDocument`

**Рефералы:**
- `Referral`, `ReferralReward`, `ReferralSettings`

**Аналитика:**
- `AnalyticsEvent`, `DailyStats`, `UserAnalytics`

**Уведомления:**
- `NotificationTemplate`, `NotificationLog`, `PushSubscription`, `PushNotification`

**Прочее:**
- `Country`, `City`, `PaymentMethod`, `MoneyTransfer`, `Review`, `Promo`, `PromoUsage`

## 🔒 Безопасность

- ✅ Пароли хешируются с bcrypt (cost factor 10)
- ✅ JWT токены с ограниченным временем жизни
- ✅ Refresh токены для продления сессий
- ✅ 2FA для администраторов (TOTP)
- ✅ Rate limiting на API
- ✅ CORS настройки
- ✅ SQL injection защита через Prisma
- ✅ XSS защита
- ✅ HTTPS в production
- ✅ Webhook signature verification (Stripe, PayPal)
- ✅ AML/KYC проверки пользователей

## 🚀 Дальнейшее развитие

- [ ] Мобильное приложение (React Native)
- [ ] WebSocket для real-time обновлений
- [ ] Интеграция с дополнительными KYC провайдерами
- [ ] Расширенные отчёты и экспорт данных
- [ ] A/B тестирование
- [ ] Multi-tenant архитектура

## 📄 Лицензия

Proprietary - All rights reserved.

## 📞 Поддержка

При возникновении вопросов обращайтесь в техническую поддержку.

## 🚢 Деплой на Ubuntu 24.04

1. Скопируйте `.env.example` в `.env` и заполните секреты (особенно JWT/SMTP/Stripe/PayPal).
2. Запустите автоматический установочный скрипт:
   ```bash
   ./scripts/setup_server.sh
   ```
   Скрипт установит Docker, Docker Compose, Nginx, Certbot, создаст Nginx-конфиг и запустит контейнеры.
3. Для автоматического TLS укажите email:
   ```bash
   CERTBOT_EMAIL=you@example.com ./scripts/setup_server.sh
   ```

⚠️ Перед запуском в продакшене убедитесь, что в `.env` корректно выставлены:
- `FRONTEND_URL=https://ex.odineco.online`
- `VITE_API_URL=https://api.odineco.online/api/v1`
