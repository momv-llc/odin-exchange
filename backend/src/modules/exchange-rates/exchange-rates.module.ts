import { Module } from '@nestjs/common';
import { RateService } from './application/services/rate.service';
import { RateController } from './presentation/controllers/rate.controller';

@Module({ controllers: [RateController], providers: [RateService], exports: [RateService] })
export class ExchangeRatesModule {}
