import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

export interface TrackEventDto {
  eventType: string;
  eventName: string;
  eventData?: Record<string, any>;
  page?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  // Track analytics event
  async trackEvent(
    userId: string | null,
    sessionId: string | null,
    event: TrackEventDto,
    requestInfo: {
      ipAddress?: string;
      userAgent?: string;
      deviceType?: string;
      browser?: string;
      os?: string;
      country?: string;
      city?: string;
    },
  ) {
    return this.prisma.analyticsEvent.create({
      data: {
        userId,
        sessionId,
        eventType: event.eventType,
        eventName: event.eventName,
        eventData: event.eventData,
        page: event.page,
        referrer: event.referrer,
        utmSource: event.utmSource,
        utmMedium: event.utmMedium,
        utmCampaign: event.utmCampaign,
        ipAddress: requestInfo.ipAddress,
        userAgent: requestInfo.userAgent,
        deviceType: requestInfo.deviceType,
        browser: requestInfo.browser,
        os: requestInfo.os,
        country: requestInfo.country,
        city: requestInfo.city,
      },
    });
  }

  // Calculate daily stats at midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async calculateDailyStats() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.logger.log('Calculating daily stats for ' + yesterday.toISOString());

    try {
      // Get order stats
      const orderStats = await this.prisma.order.groupBy({
        by: ['status'],
        where: {
          createdAt: { gte: yesterday, lt: today },
        },
        _count: true,
        _sum: { fromAmount: true },
      });

      const totalOrders = orderStats.reduce((sum, s) => sum + s._count, 0);
      const completedOrders = orderStats.find(s => s.status === 'COMPLETED')?._count || 0;
      const cancelledOrders = orderStats.find(s => s.status === 'CANCELLED')?._count || 0;
      const totalVolume = orderStats
        .filter(s => s.status === 'COMPLETED')
        .reduce((sum, s) => sum + Number(s._sum.fromAmount || 0), 0);

      // Get user stats
      const newUsers = await this.prisma.user.count({
        where: { createdAt: { gte: yesterday, lt: today } },
      });

      const activeUsers = await this.prisma.user.count({
        where: { lastLoginAt: { gte: yesterday, lt: today } },
      });

      // Get referral stats
      const newReferrals = await this.prisma.referral.count({
        where: { createdAt: { gte: yesterday, lt: today } },
      });

      const referralPayouts = await this.prisma.referralReward.aggregate({
        where: {
          paidAt: { gte: yesterday, lt: today },
        },
        _sum: { amount: true },
      });

      // Get visitor stats
      const visitorStats = await this.prisma.analyticsEvent.groupBy({
        by: ['sessionId'],
        where: {
          createdAt: { gte: yesterday, lt: today },
        },
      });
      const uniqueVisitors = visitorStats.length;

      const pageViews = await this.prisma.analyticsEvent.count({
        where: {
          createdAt: { gte: yesterday, lt: today },
          eventType: 'page_view',
        },
      });

      // Calculate conversion rate
      const conversionRate = uniqueVisitors > 0 ? totalOrders / uniqueVisitors : 0;
      const avgOrderValue = totalOrders > 0 ? totalVolume / totalOrders : 0;

      // Get top currency pair
      const topPairResult = await this.prisma.order.groupBy({
        by: ['fromCurrencyId', 'toCurrencyId'],
        where: {
          createdAt: { gte: yesterday, lt: today },
          status: 'COMPLETED',
        },
        _count: true,
        orderBy: { _count: { fromCurrencyId: 'desc' } },
        take: 1,
      });

      // Save daily stats
      await this.prisma.dailyStats.upsert({
        where: { date: yesterday },
        update: {
          totalOrders,
          completedOrders,
          cancelledOrders,
          totalVolume,
          newUsers,
          activeUsers,
          newReferrals,
          referralPayouts: referralPayouts._sum.amount || 0,
          uniqueVisitors,
          pageViews,
          avgOrderValue,
          conversionRate,
        },
        create: {
          date: yesterday,
          totalOrders,
          completedOrders,
          cancelledOrders,
          totalVolume,
          newUsers,
          activeUsers,
          newReferrals,
          referralPayouts: referralPayouts._sum.amount || 0,
          uniqueVisitors,
          pageViews,
          avgOrderValue,
          conversionRate,
        },
      });

      this.logger.log('Daily stats calculated successfully');
    } catch (error) {
      this.logger.error('Failed to calculate daily stats:', error);
    }
  }

  // Update user analytics
  async updateUserAnalytics(userId: string) {
    const orderStats = await this.prisma.order.aggregate({
      where: { userId, status: 'COMPLETED' },
      _count: true,
      _sum: { fromAmount: true },
      _avg: { fromAmount: true },
    });

    const referralStats = await this.prisma.referralReward.aggregate({
      where: { userId, status: 'paid' },
      _sum: { amount: true },
    });

    const referralCount = await this.prisma.referral.count({
      where: { referrerId: userId },
    });

    const firstOrder = await this.prisma.order.findFirst({
      where: { userId, status: 'COMPLETED' },
      orderBy: { createdAt: 'asc' },
    });

    const lastOrder = await this.prisma.order.findFirst({
      where: { userId, status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
    });

    await this.prisma.userAnalytics.upsert({
      where: { userId },
      update: {
        totalOrders: await this.prisma.order.count({ where: { userId } }),
        completedOrders: orderStats._count,
        totalVolume: orderStats._sum.fromAmount || 0,
        avgOrderValue: orderStats._avg.fromAmount || 0,
        referralEarnings: referralStats._sum.amount || 0,
        referralCount,
        firstOrderAt: firstOrder?.createdAt,
        lastOrderAt: lastOrder?.createdAt,
        lifetimeValue: Number(orderStats._sum.fromAmount || 0) + Number(referralStats._sum.amount || 0),
      },
      create: {
        userId,
        totalOrders: await this.prisma.order.count({ where: { userId } }),
        completedOrders: orderStats._count,
        totalVolume: orderStats._sum.fromAmount || 0,
        avgOrderValue: orderStats._avg.fromAmount || 0,
        referralEarnings: referralStats._sum.amount || 0,
        referralCount,
        firstOrderAt: firstOrder?.createdAt,
        lastOrderAt: lastOrder?.createdAt,
        lifetimeValue: Number(orderStats._sum.fromAmount || 0) + Number(referralStats._sum.amount || 0),
      },
    });
  }

  // Get dashboard data
  async getDashboardData() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      todayOrders,
      todayVolume,
      totalUsers,
      activeUsersToday,
      pendingOrders,
      last30DaysStats,
    ] = await Promise.all([
      this.prisma.order.count({
        where: { createdAt: { gte: today } },
      }),
      this.prisma.order.aggregate({
        where: { createdAt: { gte: today }, status: 'COMPLETED' },
        _sum: { fromAmount: true },
      }),
      this.prisma.user.count(),
      this.prisma.user.count({
        where: { lastLoginAt: { gte: today } },
      }),
      this.prisma.order.count({
        where: { status: 'PENDING' },
      }),
      this.prisma.dailyStats.findMany({
        orderBy: { date: 'desc' },
        take: 30,
      }),
    ]);

    return {
      today: {
        orders: todayOrders,
        volume: todayVolume._sum.fromAmount || 0,
        activeUsers: activeUsersToday,
        pendingOrders,
      },
      totals: {
        users: totalUsers,
      },
      chartData: last30DaysStats.reverse(),
    };
  }

  // Get detailed stats for date range
  async getDetailedStats(startDate: Date, endDate: Date) {
    return this.prisma.dailyStats.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });
  }

  // Get top users by volume
  async getTopUsers(limit = 10) {
    return this.prisma.userAnalytics.findMany({
      orderBy: { totalVolume: 'desc' },
      take: limit,
      include: {
        user: {
          select: { email: true, firstName: true, lastName: true },
        },
      },
    });
  }

  // Get conversion funnel
  async getConversionFunnel(startDate: Date, endDate: Date) {
    const [visitors, signups, orders, completedOrders] = await Promise.all([
      this.prisma.analyticsEvent.groupBy({
        by: ['sessionId'],
        where: {
          createdAt: { gte: startDate, lte: endDate },
          eventType: 'page_view',
        },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      this.prisma.order.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      this.prisma.order.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: 'COMPLETED',
        },
      }),
    ]);

    return {
      visitors: visitors.length,
      signups,
      orders,
      completedOrders,
      signupRate: visitors.length > 0 ? (signups / visitors.length * 100).toFixed(2) : 0,
      orderRate: signups > 0 ? (orders / signups * 100).toFixed(2) : 0,
      completionRate: orders > 0 ? (completedOrders / orders * 100).toFixed(2) : 0,
    };
  }

  // Get traffic sources
  async getTrafficSources(startDate: Date, endDate: Date) {
    const sources = await this.prisma.analyticsEvent.groupBy({
      by: ['utmSource', 'utmMedium', 'utmCampaign'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
        utmSource: { not: null },
      },
      _count: true,
      orderBy: { _count: { utmSource: 'desc' } },
      take: 20,
    });

    return sources;
  }
}
