import { Controller, Get, Query, Param } from '@nestjs/common';
import { ExchangeRatesService } from './exchange-rates.service';

@Controller('exchange-rates')
export class ExchangeRatesController {
  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  @Get('live')
  getLiveRates(@Query('base') baseCurrency?: string) {
    return this.exchangeRatesService.getLiveRates(baseCurrency);
  }

  @Get('pair/:base/:quote')
  getRate(@Param('base') base: string, @Param('quote') quote: string) {
    return this.exchangeRatesService.getRate(base.toUpperCase(), quote.toUpperCase());
  }

  @Get('convert')
  convertAmount(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('amount') amount: string,
  ) {
    return this.exchangeRatesService.convertAmount(
      from.toUpperCase(),
      to.toUpperCase(),
      parseFloat(amount),
    );
  }

  @Get('history/:base/:quote')
  getRateHistory(
    @Param('base') base: string,
    @Param('quote') quote: string,
    @Query('interval') interval?: string,
    @Query('limit') limit?: string,
  ) {
    return this.exchangeRatesService.getRateHistory(
      base.toUpperCase(),
      quote.toUpperCase(),
      interval || '1h',
      limit ? parseInt(limit) : 100,
    );
  }

  @Get('top-cryptos')
  getTopCryptos(@Query('limit') limit?: string) {
    return this.exchangeRatesService.getTopCryptos(limit ? parseInt(limit) : 20);
  }
}
