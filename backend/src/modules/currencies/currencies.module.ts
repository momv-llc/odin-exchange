import { Module } from '@nestjs/common';
import { CurrencyService } from './application/services/currency.service';
import { CurrencyController } from './presentation/controllers/currency.controller';

@Module({
  controllers: [CurrencyController],
  providers: [CurrencyService],
  exports: [CurrencyService],
})
export class CurrenciesModule {}
