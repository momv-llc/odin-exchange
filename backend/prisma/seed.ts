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
