#!/bin/bash
cd "$(dirname "$0")/.."

echo "Creating Prisma schema and seed..."

#=== Prisma Schema ===
cat > backend/prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum CurrencyType {
  CRYPTO
  FIAT
}

enum OrderStatus {
  PENDING
  APPROVED
  COMPLETED
  REJECTED
  EXPIRED
  CANCELLED
}

enum AdminRole {
  SUPER_ADMIN
  ADMIN
  OPERATOR
}

model Currency {
  id        String       @id @default(uuid()) @db.Uuid
  code      String       @unique @db.VarChar(10)
  name      String       @db.VarChar(100)
  type      CurrencyType
  isActive  Boolean      @default(true) @map("is_active")
  minAmount Decimal      @map("min_amount") @db.Decimal(20, 8)
  maxAmount Decimal      @map("max_amount") @db.Decimal(20, 8)
  decimals  Int          @default(8)
  network   String?      @db.VarChar(50)
  iconUrl   String?      @map("icon_url")
  createdAt DateTime     @default(now()) @map("created_at")
  updatedAt DateTime     @updatedAt @map("updated_at")

  ordersFrom Order[]        @relation("OrderFrom")
  ordersTo   Order[]        @relation("OrderTo")
  ratesFrom  ExchangeRate[] @relation("RateFrom")
  ratesTo    ExchangeRate[] @relation("RateTo")

  @@map("currencies")
}

model ExchangeRate {
  id             String   @id @default(uuid()) @db.Uuid
  fromCurrencyId String   @map("from_currency_id") @db.Uuid
  toCurrencyId   String   @map("to_currency_id") @db.Uuid
  rate           Decimal  @db.Decimal(20, 8)
  spreadPercent  Decimal  @default(0.5) @map("spread_percent") @db.Decimal(5, 2)
  effectiveRate  Decimal  @map("effective_rate") @db.Decimal(20, 8)
  source         String   @default("binance") @db.VarChar(50)
  fetchedAt      DateTime @map("fetched_at")
  createdAt      DateTime @default(now()) @map("created_at")

  fromCurrency Currency @relation("RateFrom", fields: [fromCurrencyId], references: [id])
  toCurrency   Currency @relation("RateTo", fields: [toCurrencyId], references: [id])
  orders       Order[]

  @@unique([fromCurrencyId, toCurrencyId])
  @@map("exchange_rates")
}

model Order {
  id             String      @id @default(uuid()) @db.Uuid
  code           String      @unique @db.VarChar(20)
  fromCurrencyId String      @map("from_currency_id") @db.Uuid
  toCurrencyId   String      @map("to_currency_id") @db.Uuid
  fromAmount     Decimal     @map("from_amount") @db.Decimal(20, 8)
  toAmount       Decimal     @map("to_amount") @db.Decimal(20, 8)
  exchangeRateId String      @map("exchange_rate_id") @db.Uuid
  lockedRate     Decimal     @map("locked_rate") @db.Decimal(20, 8)
  status         OrderStatus @default(PENDING)
  clientEmail    String      @map("client_email") @db.VarChar(255)
  clientPhone    String?     @map("client_phone") @db.VarChar(50)
  clientWallet   String      @map("client_wallet") @db.VarChar(255)
  adminNotes     String?     @map("admin_notes") @db.Text
  processedBy    String?     @map("processed_by") @db.Uuid
  expiresAt      DateTime    @map("expires_at")
  createdAt      DateTime    @default(now()) @map("created_at")
  updatedAt      DateTime    @updatedAt @map("updated_at")

  fromCurrency     Currency             @relation("OrderFrom", fields: [fromCurrencyId], references: [id])
  toCurrency       Currency             @relation("OrderTo", fields: [toCurrencyId], references: [id])
  exchangeRate     ExchangeRate         @relation(fields: [exchangeRateId], references: [id])
  processedByAdmin Admin?               @relation(fields: [processedBy], references: [id])
  statusHistory    OrderStatusHistory[]

  @@index([status, createdAt])
  @@index([clientEmail])
  @@index([expiresAt])
  @@map("orders")
}

model OrderStatusHistory {
  id         String   @id @default(uuid()) @db.Uuid
  orderId    String   @map("order_id") @db.Uuid
  fromStatus String   @map("from_status") @db.VarChar(50)
  toStatus   String   @map("to_status") @db.VarChar(50)
  changedBy  String?  @map("changed_by") @db.Uuid
  reason     String?  @db.Text
  ipAddress  String?  @map("ip_address") @db.Inet
  createdAt  DateTime @default(now()) @map("created_at")

  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([orderId, createdAt])
  @@map("order_status_history")
}

model Admin {
  id             String    @id @default(uuid()) @db.Uuid
  email          String    @unique @db.VarChar(255)
  passwordHash   String    @map("password_hash")
  role           AdminRole @default(OPERATOR)
  totpSecret     String?   @map("totp_secret")
  is2faEnabled   Boolean   @default(false) @map("is_2fa_enabled")
  isActive       Boolean   @default(true) @map("is_active")
  failedAttempts Int       @default(0) @map("failed_attempts")
  lockedUntil    DateTime? @map("locked_until")
  lastLoginAt    DateTime? @map("last_login_at")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  sessions  AdminSession[]
  auditLogs AuditLog[]
  orders    Order[]

  @@map("admins")
}

model AdminSession {
  id          String   @id @default(uuid()) @db.Uuid
  adminId     String   @map("admin_id") @db.Uuid
  tokenHash   String   @map("token_hash")
  ipAddress   String   @map("ip_address") @db.Inet
  userAgent   String   @map("user_agent") @db.Text
  fingerprint String?
  expiresAt   DateTime @map("expires_at")
  createdAt   DateTime @default(now()) @map("created_at")

  admin Admin @relation(fields: [adminId], references: [id], onDelete: Cascade)

  @@index([tokenHash])
  @@index([expiresAt])
  @@map("admin_sessions")
}

model AuditLog {
  id         String   @id @default(uuid()) @db.Uuid
  adminId    String?  @map("admin_id") @db.Uuid
  action     String   @db.VarChar(100)
  entityType String?  @map("entity_type") @db.VarChar(50)
  entityId   String?  @map("entity_id") @db.Uuid
  oldValue   Json?    @map("old_value")
  newValue   Json?    @map("new_value")
  ipAddress  String?  @map("ip_address") @db.Inet
  userAgent  String?  @map("user_agent") @db.Text
  requestId  String?  @map("request_id") @db.Uuid
  createdAt  DateTime @default(now()) @map("created_at")

  admin Admin? @relation(fields: [adminId], references: [id])

  @@index([entityType, entityId])
  @@index([adminId, createdAt])
  @@index([action, createdAt])
  @@map("audit_logs")
}

model SystemSetting {
  id          String   @id @default(uuid()) @db.Uuid
  key         String   @unique @db.VarChar(100)
  value       Json
  description String?  @db.Text
  updatedBy   String?  @map("updated_by") @db.Uuid
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("system_settings")
}
EOF

#=== Prisma Seed ===
cat > backend/prisma/seed.ts << 'EOF'
import { PrismaClient, CurrencyType, AdminRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create currencies
  const currencies = await Promise.all([
    prisma.currency.upsert({
      where: { code: 'BTC' },
      update: {},
      create: {
        code: 'BTC',
        name: 'Bitcoin',
        type: CurrencyType.CRYPTO,
        minAmount: 0.001,
        maxAmount: 10,
        decimals: 8,
        network: 'bitcoin',
      },
    }),
    prisma.currency.upsert({
      where: { code: 'ETH' },
      update: {},
      create: {
        code: 'ETH',
        name: 'Ethereum',
        type: CurrencyType.CRYPTO,
        minAmount: 0.01,
        maxAmount: 100,
        decimals: 18,
        network: 'ethereum',
      },
    }),
    prisma.currency.upsert({
      where: { code: 'USDT' },
      update: {},
      create: {
        code: 'USDT',
        name: 'Tether USD',
        type: CurrencyType.CRYPTO,
        minAmount: 10,
        maxAmount: 100000,
        decimals: 6,
        network: 'ethereum',
      },
    }),
    prisma.currency.upsert({
      where: { code: 'USDC' },
      update: {},
      create: {
        code: 'USDC',
        name: 'USD Coin',
        type: CurrencyType.CRYPTO,
        minAmount: 10,
        maxAmount: 100000,
        decimals: 6,
        network: 'ethereum',
      },
    }),
    prisma.currency.upsert({
      where: { code: 'USD' },
      update: {},
      create: {
        code: 'USD',
        name: 'US Dollar',
        type: CurrencyType.FIAT,
        minAmount: 10,
        maxAmount: 100000,
        decimals: 2,
      },
    }),
    prisma.currency.upsert({
      where: { code: 'EUR' },
      update: {},
      create: {
        code: 'EUR',
        name: 'Euro',
        type: CurrencyType.FIAT,
        minAmount: 10,
        maxAmount: 100000,
        decimals: 2,
      },
    }),
  ]);

  console.log(`✅ Created ${currencies.length} currencies`);

  // Create exchange rates
  const btc = currencies.find((c) => c.code === 'BTC')!;
  const eth = currencies.find((c) => c.code === 'ETH')!;
  const usd = currencies.find((c) => c.code === 'USD')!;

  await prisma.exchangeRate.upsert({
    where: {
      fromCurrencyId_toCurrencyId: {
        fromCurrencyId: btc.id,
        toCurrencyId: usd.id,
      },
    },
    update: {
      rate: 67500,
      effectiveRate: 67162.5,
      fetchedAt: new Date(),
    },
    create: {
      fromCurrencyId: btc.id,
      toCurrencyId: usd.id,
      rate: 67500,
      spreadPercent: 0.5,
      effectiveRate: 67162.5,
      source: 'seed',
      fetchedAt: new Date(),
    },
  });

  await prisma.exchangeRate.upsert({
    where: {
      fromCurrencyId_toCurrencyId: {
        fromCurrencyId: eth.id,
        toCurrencyId: usd.id,
      },
    },
    update: {
      rate: 3500,
      effectiveRate: 3482.5,
      fetchedAt: new Date(),
    },
    create: {
      fromCurrencyId: eth.id,
      toCurrencyId: usd.id,
      rate: 3500,
      spreadPercent: 0.5,
      effectiveRate: 3482.5,
      source: 'seed',
      fetchedAt: new Date(),
    },
  });

  console.log('✅ Created exchange rates');

  // Create admin user
  const adminPassword = await argon2.hash('admin123456');

  await prisma.admin.upsert({
    where: { email: 'admin@odin.exchange' },
    update: {},
    create: {
      email: 'admin@odin.exchange',
      passwordHash: adminPassword,
      role: AdminRole.SUPER_ADMIN,
      is2faEnabled: false,
    },
  });

  console.log('✅ Created admin user');
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║  Admin: admin@odin.exchange            ║');
  console.log('║  Password: admin123456                 ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
EOF

echo "Prisma schema and seed created!"