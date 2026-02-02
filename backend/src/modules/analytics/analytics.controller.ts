import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
  Headers,
} from '@nestjs/common';
import { AnalyticsService, TrackEventDto } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../admin-auth/guards/admin-auth.guard';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('track')
  trackEvent(
    @Body() event: TrackEventDto,
    @Headers('x-session-id') sessionId: string,
    @Headers('x-forwarded-for') forwardedFor: string,
    @Headers('user-agent') userAgent: string,
    @Req() req: any,
  ) {
    const ipAddress = forwardedFor?.split(',')[0] || req.ip;
    const deviceInfo = this.parseUserAgent(userAgent);

    return this.analyticsService.trackEvent(
      req.user?.id || null,
      sessionId || null,
      event,
      {
        ipAddress,
        userAgent,
        ...deviceInfo,
      },
    );
  }

  private parseUserAgent(ua: string): {
    deviceType: string;
    browser: string;
    os: string;
  } {
    // Simple UA parsing (in production use a library like ua-parser-js)
    let deviceType = 'desktop';
    if (/mobile/i.test(ua)) deviceType = 'mobile';
    else if (/tablet/i.test(ua)) deviceType = 'tablet';

    let browser = 'unknown';
    if (/chrome/i.test(ua)) browser = 'Chrome';
    else if (/firefox/i.test(ua)) browser = 'Firefox';
    else if (/safari/i.test(ua)) browser = 'Safari';
    else if (/edge/i.test(ua)) browser = 'Edge';

    let os = 'unknown';
    if (/windows/i.test(ua)) os = 'Windows';
    else if (/mac/i.test(ua)) os = 'macOS';
    else if (/linux/i.test(ua)) os = 'Linux';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/ios/i.test(ua)) os = 'iOS';

    return { deviceType, browser, os };
  }
}

@Controller('admin/analytics')
@UseGuards(AdminAuthGuard)
export class AdminAnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboard() {
    return this.analyticsService.getDashboardData();
  }

  @Get('stats')
  getDetailedStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    return this.analyticsService.getDetailedStats(start, end);
  }

  @Get('top-users')
  getTopUsers(@Query('limit') limit?: string) {
    return this.analyticsService.getTopUsers(limit ? parseInt(limit) : 10);
  }

  @Get('funnel')
  getFunnel(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    return this.analyticsService.getConversionFunnel(start, end);
  }

  @Get('traffic-sources')
  getTrafficSources(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    return this.analyticsService.getTrafficSources(start, end);
  }

  @Post('recalculate-daily')
  recalculateDailyStats() {
    return this.analyticsService.calculateDailyStats();
  }
}
