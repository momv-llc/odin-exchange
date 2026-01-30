import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@/core/database/prisma.service';
import { RedisService } from '@/core/cache/redis.service';

@Injectable()
export class RateService implements OnModuleInit {
  private readonly logger = new Logger(RateService.name);
  private readonly KEY = 'rates';
  constructor(private prisma: PrismaService, private redis: RedisService) {}

  async onModuleInit() { await this.fetchRates(); }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async fetchRates() {
    try {
      const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbols=["BTCUSDT","ETHUSDT"]');
      if (!res.ok) throw new Error(`${res.status}`);
      const tickers: { symbol: string; price: string }[] = await res.json();
      for (const t of tickers) {
        const rate = parseFloat(t.price), spread = 0.5, eff = rate * (1 - spread / 100);
        await this.redis.hset(this.KEY, t.symbol, { rate, effectiveRate: eff, spreadPercent: spread, fetchedAt: new Date().toISOString() });
        await this.updateDb(t.symbol, rate, spread);
      }
      await this.redis.expire(this.KEY, 120);
      this.logger.debug(`Fetched ${tickers.length} rates`);
    } catch (e) { this.logger.error('Fetch failed', e); }
  }

  private async updateDb(sym: string, rate: number, spread: number) {
    const code = sym.replace('USDT', '');
    const [from, to] = await Promise.all([this.prisma.currency.findFirst({ where: { code } }), this.prisma.currency.findFirst({ where: { code: 'USD' } })]);
    if (!from || !to) return;
    await this.prisma.exchangeRate.upsert({
      where: { fromCurrencyId_toCurrencyId: { fromCurrencyId: from.id, toCurrencyId: to.id } },
      update: { rate, spreadPercent: spread, effectiveRate: rate * (1 - spread / 100), fetchedAt: new Date() },
      create: { fromCurrencyId: from.id, toCurrencyId: to.id, rate, spreadPercent: spread, effectiveRate: rate * (1 - spread / 100), source: 'binance', fetchedAt: new Date() },
    });
  }

  async getRate(from: string, to: string) {
    const c = await this.redis.hget<any>(this.KEY, `${from}USDT`);
    if (c) return c;
    const [f, t] = await Promise.all([this.prisma.currency.findFirst({ where: { code: from } }), this.prisma.currency.findFirst({ where: { code: to } })]);
    if (!f || !t) return null;
    const r = await this.prisma.exchangeRate.findUnique({ where: { fromCurrencyId_toCurrencyId: { fromCurrencyId: f.id, toCurrencyId: t.id } } });
    return r ? { rate: Number(r.rate), effectiveRate: Number(r.effectiveRate), spreadPercent: Number(r.spreadPercent), fetchedAt: r.fetchedAt.toISOString() } : null;
  }

  async getAllRates() {
    const c = await this.redis.hgetall<any>(this.KEY);
    if (Object.keys(c).length) return Object.entries(c).map(([s, d]) => ({ symbol: s, ...d }));
    const rates = await this.prisma.exchangeRate.findMany({ include: { fromCurrency: true, toCurrency: true } });
    return rates.map(r => ({ symbol: `${r.fromCurrency.code}${r.toCurrency.code}`, rate: Number(r.rate), effectiveRate: Number(r.effectiveRate), spreadPercent: Number(r.spreadPercent), fetchedAt: r.fetchedAt.toISOString() }));
  }
}
