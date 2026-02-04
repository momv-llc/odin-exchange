import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { ExchangeRatesService } from './exchange-rates.service';
import { ExchangeRatesController } from './exchange-rates.controller';
import { CoinGeckoService } from './providers/coingecko.service';
import { FixerService } from './providers/fixer.service';
import { BinanceService } from './providers/binance.service';
import { PrismaModule } from '@/core/database/prisma.module';

@Module({
  imports: [
    PrismaModule,
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 3,
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [ExchangeRatesController],
  providers: [
    ExchangeRatesService,
    CoinGeckoService,
    FixerService,
    BinanceService,
  ],
  exports: [ExchangeRatesService],
})
export class ExchangeRatesModule {}
