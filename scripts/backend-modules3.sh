#!/bin/bash
cd "$(dirname "$0")/.."

echo "Creating admin, audit, notifications, health modules..."

#=== Admin Module ===
cat > backend/src/modules/admin/admin.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard/dashboard.controller';
import { DashboardService } from './dashboard/dashboard.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class AdminModule {}
EOF

cat > backend/src/modules/admin/dashboard/dashboard.service.ts << 'EOF'
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
EOF

cat > backend/src/modules/admin/dashboard/dashboard.controller.ts << 'EOF'
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/core/common/decorators/roles.decorator';
import { AdminRole } from '@prisma/client';
import { DashboardService } from './dashboard.service';

@ApiTags('admin/dashboard')
@ApiBearerAuth()
@Controller({ path: 'admin/dashboard', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private svc: DashboardService) {}

  @Get('stats')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OPERATOR)
  getStats(@Query('period') period?: '24h' | '7d' | '30d') {
    return this.svc.getStats(period);
  }
}
EOF

#=== Audit Module ===
cat > backend/src/modules/audit/audit.module.ts << 'EOF'
import { Global, Module } from '@nestjs/common';
import { AuditLogService } from './services/audit-log.service';

@Global()
@Module({
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditModule {}
EOF

cat > backend/src/modules/audit/services/audit-log.service.ts << 'EOF'
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private prisma: PrismaService) {}

  async log(entry: {
    adminId?: string;
    action: string;
    entityType?: string;
    entityId?: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
    requestId?: string;
  }) {
    try {
      await this.prisma.auditLog.create({ data: entry });
    } catch (e) {
      this.logger.error('Audit failed', e);
    }
  }

  async findAll(params: { page?: number; limit?: number; adminId?: string; action?: string }) {
    const { page = 1, limit = 50, adminId, action } = params;
    const where: any = {};
    if (adminId) where.adminId = adminId;
    if (action) where.action = { contains: action };

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { admin: { select: { email: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data: logs, meta: { total, page, limit } };
  }
}
EOF

#=== Notifications Module ===
cat > backend/src/modules/notifications/notifications.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EmailService } from './services/email.service';
import { NotificationListener } from './listeners/notification.listener';

@Module({
  imports: [BullModule.registerQueue({ name: 'emails' })],
  providers: [EmailService, NotificationListener],
  exports: [EmailService],
})
export class NotificationsModule {}
EOF

cat > backend/src/modules/notifications/services/email.service.ts << 'EOF'
import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(@InjectQueue('emails') private queue: Queue) {}

  async send(to: string, subject: string, html: string) {
    await this.queue.add('send', { to, subject, html }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
    this.logger.debug(`Email queued: ${subject} -> ${to}`);
  }

  async sendOrderCreated(email: string, code: string) {
    await this.send(
      email,
      `Order ${code} Created`,
      `<h1>Order Created</h1>
       <p>Your order code: <strong>${code}</strong></p>
       <p>This order expires in 30 minutes.</p>
       <p>Please complete your payment to proceed.</p>`
    );
  }

  async sendOrderApproved(email: string, code: string) {
    await this.send(
      email,
      `Order ${code} Approved`,
      `<h1>Order Approved</h1>
       <p>Your order <strong>${code}</strong> has been approved.</p>
       <p>Please proceed with the payment instructions provided.</p>`
    );
  }

  async sendOrderCompleted(email: string, code: string) {
    await this.send(
      email,
      `Order ${code} Completed`,
      `<h1>Order Completed</h1>
       <p>Your order <strong>${code}</strong> has been completed successfully.</p>
       <p>Thank you for using ODIN Exchange!</p>`
    );
  }

  async sendOrderRejected(email: string, code: string, reason: string) {
    await this.send(
      email,
      `Order ${code} Rejected`,
      `<h1>Order Rejected</h1>
       <p>Unfortunately, your order <strong>${code}</strong> has been rejected.</p>
       <p>Reason: ${reason}</p>
       <p>Please contact support if you have questions.</p>`
    );
  }
}
EOF

cat > backend/src/modules/notifications/listeners/notification.listener.ts << 'EOF'
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from '../services/email.service';

@Injectable()
export class NotificationListener {
  constructor(private email: EmailService) {}

  @OnEvent('order.created')
  async onCreated(e: { orderId: string; code: string; email: string }) {
    await this.email.sendOrderCreated(e.email, e.code);
  }

  @OnEvent('order.approved')
  async onApproved(e: { orderId: string; code: string; email: string }) {
    await this.email.sendOrderApproved(e.email, e.code);
  }

  @OnEvent('order.completed')
  async onCompleted(e: { orderId: string; code: string; email: string }) {
    await this.email.sendOrderCompleted(e.email, e.code);
  }

  @OnEvent('order.rejected')
  async onRejected(e: { orderId: string; code: string; email: string; reason: string }) {
    await this.email.sendOrderRejected(e.email, e.code, e.reason);
  }
}
EOF

#=== Health Module ===
cat > backend/src/health/health.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
})
export class HealthModule {}
EOF

cat > backend/src/health/health.controller.ts << 'EOF'
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { Public } from '@/core/common/decorators/public.decorator';
import { PrismaService } from '@/core/database/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
    ]);
  }
}
EOF

echo "Admin, Audit, Notifications, Health modules created!"