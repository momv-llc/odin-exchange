import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { CoinGeckoService } from './providers/coingecko.service';
import { FixerService } from './providers/fixer.service';
import { BinanceService } from './providers/binance.service';
import { RateSource } from '@prisma/client';

@Injectable()
export class ExchangeRatesService {
  private readonly logger = new Logger(ExchangeRatesService.name);

  constructor(
    private prisma: PrismaService,
    private coinGecko: CoinGeckoService,
    private fixer: FixerService,
    private binance: BinanceService,
  ) {}

  // Update crypto rates every minute
  @Cron(CronExpression.EVERY_MINUTE)
  async updateCryptoRates() {
    this.logger.log('Updating crypto rates...');
    try {
      const rates = await this.binance.getRates();
      await this.saveRates(rates, RateSource.BINANCE);
      
      const geckoRates = await this.coinGecko.getRates();
      await this.saveRates(geckoRates, RateSource.COINGECKO);
    } catch (error) {
      this.logger.error('Failed to update crypto rates', error);
    }
  }

  // Update fiat rates every hour
  @Cron(CronExpression.EVERY_HOUR)
  async updateFiatRates() {
    this.logger.log('Updating fiat rates...');
    try {
      const rates = await this.fixer.getRates();
      await this.saveRates(rates, RateSource.FIXER);
    } catch (error) {
      this.logger.error('Failed to update fiat rates', error);
    }
  }

  private async saveRates(rates: Array<{
    baseCurrency: string;
    quoteCurrency: string;
    rate: number;
    change24h?: number;
    high24h?: number;
    low24h?: number;
    volume24h?: number;
    marketCap?: number;
  }>, source: RateSource) {
    for (const rate of rates) {
      await this.prisma.liveExchangeRate.upsert({
        where: {
          baseCurrency_quoteCurrency_source: {
            baseCurrency: rate.baseCurrency,
            quoteCurrency: rate.quoteCurrency,
            source,
          },
        },
        update: {
          rate: rate.rate,
          change24h: rate.change24h,
          high24h: rate.high24h,
          low24h: rate.low24h,
          volume24h: rate.volume24h,
          marketCap: rate.marketCap,
          lastUpdated: new Date(),
        },
        create: {
          baseCurrency: rate.baseCurrency,
          quoteCurrency: rate.quoteCurrency,
          rate: rate.rate,
          source,
          change24h: rate.change24h,
          high24h: rate.high24h,
          low24h: rate.low24h,
          volume24h: rate.volume24h,
          marketCap: rate.marketCap,
          lastUpdated: new Date(),
        },
      });

      // Save to history
      await this.prisma.rateHistory.create({
        data: {
          baseCurrency: rate.baseCurrency,
          quoteCurrency: rate.quoteCurrency,
          rate: rate.rate,
          high: rate.high24h,
          low: rate.low24h,
          volume: rate.volume24h,
          timestamp: new Date(),
          interval: '1m',
        },
      });
    }
  }

  async getLiveRates(baseCurrency?: string) {
    const where = baseCurrency ? { baseCurrency } : {};
    return this.prisma.liveExchangeRate.findMany({
      where,
      orderBy: { lastUpdated: 'desc' },
    });
  }

  async getRate(baseCurrency: string, quoteCurrency: string) {
    return this.prisma.liveExchangeRate.findFirst({
      where: { baseCurrency, quoteCurrency },
      orderBy: { lastUpdated: 'desc' },
    });
  }

  async getRateHistory(
    baseCurrency: string,
    quoteCurrency: string,
    interval: string = '1h',
    limit: number = 100,
  ) {
    return this.prisma.rateHistory.findMany({
      where: { baseCurrency, quoteCurrency, interval },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  async convertAmount(
    fromCurrency: string,
    toCurrency: string,
    amount: number,
  ): Promise<{ rate: number; result: number }> {
    const rateData = await this.getRate(fromCurrency, toCurrency);
    if (!rateData) {
      // Try reverse rate
      const reverseRate = await this.getRate(toCurrency, fromCurrency);
      if (reverseRate) {
        const rate = 1 / Number(reverseRate.rate);
        return { rate, result: amount * rate };
      }
      throw new Error(`Rate not found for ${fromCurrency}/${toCurrency}`);
    }
    const rate = Number(rateData.rate);
    return { rate, result: amount * rate };
  }

  async getTopCryptos(limit: number = 20) {
    return this.prisma.liveExchangeRate.findMany({
      where: {
        quoteCurrency: 'USD',
        source: RateSource.COINGECKO,
      },
      orderBy: { marketCap: 'desc' },
      take: limit,
    });
  }
}
