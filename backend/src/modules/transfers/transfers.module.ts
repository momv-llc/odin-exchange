import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/database/prisma.module';
import { TransfersService } from './services/transfers.service';
import { TransfersController } from './presentation/controllers/transfers.controller';
import { AdminTransfersController } from './presentation/controllers/admin-transfers.controller';

@Module({
  imports: [PrismaModule],
  controllers: [TransfersController, AdminTransfersController],
  providers: [TransfersService],
  exports: [TransfersService],
})
export class TransfersModule {}
