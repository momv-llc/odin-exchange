import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/core/common/decorators/roles.decorator';
import { AdminRole } from '@prisma/client';
import { AuditLogService } from '../../services/audit-log.service';
import { QueryAuditLogsDto } from '../../dto';

@ApiTags('Admin Audit')
@ApiBearerAuth()
@Controller({ path: 'admin/audit', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminAuditController {
  constructor(private auditLogService: AuditLogService) {}

  @Get('logs')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OPERATOR)
  async getLogs(@Query() query: QueryAuditLogsDto) {
    return this.auditLogService.findAll(query);
  }

  @Get('admins')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OPERATOR)
  async getAdmins() {
    return this.auditLogService.listAdmins();
  }
}
