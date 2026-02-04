import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { StripeService } from './providers/stripe.service';
import { PayPalService } from './providers/paypal.service';
import { CryptoPaymentService } from './providers/crypto-payment.service';
import { PrismaModule } from '@/core/database/prisma.module';

@Module({
  imports: [
    PrismaModule,
    HttpModule.register({
      timeout: 30000,
    }),
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    StripeService,
    PayPalService,
    CryptoPaymentService,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
