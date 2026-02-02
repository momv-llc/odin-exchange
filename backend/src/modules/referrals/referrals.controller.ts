import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../admin-auth/guards/admin-auth.guard';

@Controller('referrals')
@UseGuards(JwtAuthGuard)
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get('stats')
  getMyStats(@Req() req: any) {
    return this.referralsService.getUserReferralStats(req.user.id);
  }

  @Post('generate-code')
  generateCode(@Req() req: any) {
    return this.referralsService.generateReferralCode(req.user.id);
  }

  @Get('my-referrals')
  getMyReferrals(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.referralsService.getUserReferrals(
      req.user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('my-rewards')
  getMyRewards(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.referralsService.getUserRewards(
      req.user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Post('apply')
  applyCode(@Req() req: any, @Body() body: { code: string }) {
    return this.referralsService.applyReferralCode(req.user.id, body.code);
  }
}

@Controller('admin/referrals')
@UseGuards(AdminAuthGuard)
export class AdminReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get('stats')
  getStats() {
    return this.referralsService.getReferralStats();
  }

  @Get()
  getAllReferrals(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.referralsService.getAllReferrals(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      status,
    );
  }

  @Get('settings')
  getSettings() {
    return this.referralsService.getAllSettings();
  }

  @Post('settings')
  createSettings(@Body() data: {
    tierName: string;
    minReferrals: number;
    referrerRewardPercent: number;
    referredBonusPercent: number;
    lifetimeCommission?: boolean;
    commissionDurationDays?: number;
  }) {
    return this.referralsService.createSettings(data);
  }

  @Post('settings/:id')
  updateSettings(@Param('id') id: string, @Body() data: any) {
    return this.referralsService.updateSettings(id, data);
  }

  @Get('pending-rewards')
  getPendingRewards(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.referralsService.getPendingRewards(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Post('rewards/:id/pay')
  payReward(@Param('id') id: string) {
    return this.referralsService.payReward(id);
  }
}
