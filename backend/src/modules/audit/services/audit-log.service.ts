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
