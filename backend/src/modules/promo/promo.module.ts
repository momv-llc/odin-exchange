import { Module } from '@nestjs/common';
import { PromoService } from './services/promo.service';
import { PromoController } from './presentation/controllers/promo.controller';
import { AdminPromoController } from './presentation/controllers/admin-promo.controller';

@Module({
  controllers: [PromoController, AdminPromoController],
  providers: [PromoService],
  exports: [PromoService],
})
export class PromoModule {}
