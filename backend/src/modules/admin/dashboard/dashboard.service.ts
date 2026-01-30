import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(period: '24h' | '7d' | '30d' = '7d') {
    const days = { '24h': 1, '7d': 7, '30d': 30 }[period];
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [total, pending, completed, recent] = await Promise.all([
      this.prisma.order.count({ where: { createdAt: { gte: since } } }),
      this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      this.prisma.order.count({ where: { status: OrderStatus.COMPLETED, createdAt: { gte: since } } }),
      this.prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { fromCurrency: true, toCurrency: true },
      }),
    ]);

    return {
      period,
      totalOrders: total,
      pendingOrders: pending,
      completedOrders: completed,
      recentOrders: recent.map((o) => ({
        id: o.id,
        code: o.code,
        status: o.status,
        fromAmount: o.fromAmount.toString(),
        fromCurrency: o.fromCurrency.code,
        toAmount: o.toAmount.toString(),
        toCurrency: o.toCurrency.code,
        createdAt: o.createdAt,
      })),
    };
  }
}
