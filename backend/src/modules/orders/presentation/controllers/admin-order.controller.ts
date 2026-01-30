import { Controller, Get, Patch, Param, Body, Query, UseGuards, Request, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OrderStatus, AdminRole } from '@prisma/client';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/core/common/decorators/roles.decorator';
import { OrderService } from '../../application/services/order.service';

@ApiTags('admin/orders') @ApiBearerAuth()
@Controller({ path: 'admin/orders', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminOrderController {
  constructor(private svc: OrderService) {}

  @Get() @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OPERATOR)
  findAll(@Query('page') page?: number, @Query('limit') limit?: number, @Query('status') status?: OrderStatus, @Query('search') search?: string) {
    return this.svc.findAll({ page, limit, status, search });
  }

  @Get(':id') @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OPERATOR)
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.svc.findById(id); }

  @Patch(':id/approve') @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  approve(@Param('id', ParseUUIDPipe) id: string, @Body() b: { notes?: string }, @Request() r: any) { return this.svc.approve(id, r.user.id, b.notes); }

  @Patch(':id/reject') @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  reject(@Param('id', ParseUUIDPipe) id: string, @Body() b: { reason: string }, @Request() r: any) { return this.svc.reject(id, r.user.id, b.reason); }

  @Patch(':id/complete') @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  complete(@Param('id', ParseUUIDPipe) id: string, @Body() b: { notes?: string }, @Request() r: any) { return this.svc.complete(id, r.user.id, b.notes); }
}
