import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/database/prisma.module';
import { PaymentMethodsService } from './services/payment-methods.service';
import { PaymentMethodsController } from './presentation/controllers/payment-methods.controller';
import { AdminPaymentMethodsController } from './presentation/controllers/admin-payment-methods.controller';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentMethodsController, AdminPaymentMethodsController],
  providers: [PaymentMethodsService],
  exports: [PaymentMethodsService],
})
export class PaymentMethodsModule {}
