import { Module } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { ReferralsController, AdminReferralsController } from './referrals.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReferralsController, AdminReferralsController],
  providers: [ReferralsService],
  exports: [ReferralsService],
})
export class ReferralsModule {}
