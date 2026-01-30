import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { OrderService } from './application/services/order.service';
import { OrderController } from './presentation/controllers/order.controller';
import { AdminOrderController } from './presentation/controllers/admin-order.controller';
import { CodeGenerator } from '@/shared/utils/code-generator.util';

@Module({
  imports: [BullModule.registerQueue({ name: 'orders' })],
  controllers: [OrderController, AdminOrderController],
  providers: [OrderService, CodeGenerator],
  exports: [OrderService],
})
export class OrdersModule {}
