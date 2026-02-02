import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { KycService } from './kyc.service';
import { KycController, AdminKycController } from './kyc.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],
  controllers: [KycController, AdminKycController],
  providers: [KycService],
  exports: [KycService],
})
export class KycModule {}
