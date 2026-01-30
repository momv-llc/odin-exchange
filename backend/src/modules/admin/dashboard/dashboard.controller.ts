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
