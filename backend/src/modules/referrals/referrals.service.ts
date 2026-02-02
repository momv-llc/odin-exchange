import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { nanoid } from 'nanoid';

@Injectable()
export class ReferralsService {
  private readonly logger = new Logger(ReferralsService.name);

  constructor(private prisma: PrismaService) {}

  // Generate unique referral code for user
  async generateReferralCode(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.referralCode) {
      return user.referralCode;
    }

    const code = nanoid(8).toUpperCase();
    await this.prisma.user.update({
      where: { id: userId },
      data: { referralCode: code },
    });

    return code;
  }

  // Apply referral code when user registers
  async applyReferralCode(newUserId: string, referralCode: string) {
    const referrer = await this.prisma.user.findUnique({
      where: { referralCode: referralCode.toUpperCase() },
    });

    if (!referrer) {
      throw new BadRequestException('Invalid referral code');
    }

    if (referrer.id === newUserId) {
      throw new BadRequestException('Cannot use your own referral code');
    }

    // Check if user already has a referral
    const existingReferral = await this.prisma.referral.findUnique({
      where: { referredId: newUserId },
    });

    if (existingReferral) {
      throw new BadRequestException('User already has a referral');
    }

    // Get referral settings
    const settings = await this.getActiveSettings();

    // Create referral record
    const referral = await this.prisma.referral.create({
      data: {
        referrerId: referrer.id,
        referredId: newUserId,
        code: referralCode.toUpperCase(),
        status: 'pending',
        referredBonus: settings ? settings.referredBonusPercent : null,
      },
    });

    // Update referred user
    await this.prisma.user.update({
      where: { id: newUserId },
      data: { referredBy: referrer.id },
    });

    return referral;
  }

  // Process referral reward when order is completed
  async processReferralReward(userId: string, orderId: string, orderAmount: number, currency: string) {
    const referral = await this.prisma.referral.findUnique({
      where: { referredId: userId },
    });

    if (!referral) return null;

    const settings = await this.getActiveSettings();
    if (!settings) return null;

    const rewardAmount = (orderAmount * Number(settings.referrerRewardPercent)) / 100;

    // Create reward for referrer
    const reward = await this.prisma.referralReward.create({
      data: {
        userId: referral.referrerId,
        referralId: referral.id,
        orderId,
        rewardType: 'commission',
        amount: rewardAmount,
        currency,
        percentage: settings.referrerRewardPercent,
        status: 'pending',
      },
    });

    // Mark referral as converted if first order
    if (referral.status === 'pending') {
      await this.prisma.referral.update({
        where: { id: referral.id },
        data: {
          status: 'converted',
          conversionDate: new Date(),
        },
      });
    }

    this.logger.log('Created referral reward: ' + reward.id + ' for user ' + referral.referrerId);
    return reward;
  }

  // Get user's referral stats
  async getUserReferralStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });

    const [totalReferrals, convertedReferrals, pendingRewards, paidRewards] = await Promise.all([
      this.prisma.referral.count({ where: { referrerId: userId } }),
      this.prisma.referral.count({ where: { referrerId: userId, status: 'converted' } }),
      this.prisma.referralReward.aggregate({
        where: { userId, status: 'pending' },
        _sum: { amount: true },
      }),
      this.prisma.referralReward.aggregate({
        where: { userId, status: 'paid' },
        _sum: { amount: true },
      }),
    ]);

    return {
      referralCode: user?.referralCode,
      totalReferrals,
      convertedReferrals,
      pendingRewards: pendingRewards._sum.amount || 0,
      paidRewards: paidRewards._sum.amount || 0,
      referralLink: user?.referralCode 
        ? process.env.FRONTEND_URL + '?ref=' + user.referralCode 
        : null,
    };
  }

  // Get user's referrals list
  async getUserReferrals(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [referrals, total] = await Promise.all([
      this.prisma.referral.findMany({
        where: { referrerId: userId },
        include: {
          referred: {
            select: { email: true, createdAt: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.referral.count({ where: { referrerId: userId } }),
    ]);

    // Mask emails for privacy
    const maskedReferrals = referrals.map(r => ({
      ...r,
      referred: {
        email: this.maskEmail(r.referred.email),
        createdAt: r.referred.createdAt,
      },
    }));

    return { referrals: maskedReferrals, total, page, limit };
  }

  // Get user's rewards list
  async getUserRewards(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [rewards, total] = await Promise.all([
      this.prisma.referralReward.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.referralReward.count({ where: { userId } }),
    ]);

    return { rewards, total, page, limit };
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    const maskedLocal = local.charAt(0) + '***' + local.charAt(local.length - 1);
    return maskedLocal + '@' + domain;
  }

  // Admin methods
  async getActiveSettings() {
    return this.prisma.referralSettings.findFirst({
      where: { isActive: true },
      orderBy: { minReferrals: 'asc' },
    });
  }

  async getAllSettings() {
    return this.prisma.referralSettings.findMany({
      orderBy: { minReferrals: 'asc' },
    });
  }

  async createSettings(data: {
    tierName: string;
    minReferrals: number;
    referrerRewardPercent: number;
    referredBonusPercent: number;
    lifetimeCommission?: boolean;
    commissionDurationDays?: number;
  }) {
    return this.prisma.referralSettings.create({
      data: {
        tierName: data.tierName,
        minReferrals: data.minReferrals,
        referrerRewardPercent: data.referrerRewardPercent,
        referredBonusPercent: data.referredBonusPercent,
        lifetimeCommission: data.lifetimeCommission || false,
        commissionDurationDays: data.commissionDurationDays,
      },
    });
  }

  async updateSettings(id: string, data: Partial<{
    tierName: string;
    minReferrals: number;
    referrerRewardPercent: number;
    referredBonusPercent: number;
    lifetimeCommission: boolean;
    commissionDurationDays: number;
    isActive: boolean;
  }>) {
    return this.prisma.referralSettings.update({
      where: { id },
      data,
    });
  }

  async getAllReferrals(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [referrals, total] = await Promise.all([
      this.prisma.referral.findMany({
        where,
        include: {
          referrer: { select: { email: true } },
          referred: { select: { email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.referral.count({ where }),
    ]);

    return { referrals, total, page, limit };
  }

  async getPendingRewards(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [rewards, total] = await Promise.all([
      this.prisma.referralReward.findMany({
        where: { status: 'pending' },
        include: {
          user: { select: { email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.referralReward.count({ where: { status: 'pending' } }),
    ]);

    return { rewards, total, page, limit };
  }

  async payReward(rewardId: string) {
    return this.prisma.referralReward.update({
      where: { id: rewardId },
      data: {
        status: 'paid',
        paidAt: new Date(),
      },
    });
  }

  async getReferralStats() {
    const [
      totalReferrals,
      convertedReferrals,
      totalRewardsPending,
      totalRewardsPaid,
    ] = await Promise.all([
      this.prisma.referral.count(),
      this.prisma.referral.count({ where: { status: 'converted' } }),
      this.prisma.referralReward.aggregate({
        where: { status: 'pending' },
        _sum: { amount: true },
      }),
      this.prisma.referralReward.aggregate({
        where: { status: 'paid' },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalReferrals,
      convertedReferrals,
      conversionRate: totalReferrals > 0 ? (convertedReferrals / totalReferrals * 100).toFixed(2) : 0,
      totalRewardsPending: totalRewardsPending._sum.amount || 0,
      totalRewardsPaid: totalRewardsPaid._sum.amount || 0,
    };
  }
}
