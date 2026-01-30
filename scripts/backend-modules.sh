#!/bin/bash
cd "$(dirname "$0")/.."

echo "Creating backend modules..."

#=== Orders Module ===
cat > backend/src/modules/orders/orders.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { OrderService } from './application/services/order.service';
import { OrderController } from './presentation/controllers/order.controller';
import { AdminOrderController } from './presentation/controllers/admin-order.controller';
import { CodeGenerator } from '@/shared/utils/code-generator.util';

@Module({
  imports: [BullModule.registerQueue({ name: 'orders' })],
  controllers: [OrderController, AdminOrderController],
  providers: [OrderService, CodeGenerator],
  exports: [OrderService],
})
export class OrdersModule {}
EOF

cat > backend/src/modules/orders/application/dto/create-order.dto.ts << 'EOF'
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateOrderDto {
  @IsString() @IsNotEmpty() fromCurrency: string;
  @IsString() @IsNotEmpty() toCurrency: string;
  @IsNumber() @IsPositive() fromAmount: number;
  @IsEmail() clientEmail: string;
  @IsOptional() @IsString() @MaxLength(50) clientPhone?: string;
  @IsString() @MinLength(20) @MaxLength(255) clientWallet: string;
}
EOF

cat > backend/src/modules/orders/application/dto/order-response.dto.ts << 'EOF'
import { OrderStatus } from '@prisma/client';

export class OrderResponseDto {
  id: string; code: string; fromCurrency: string; toCurrency: string;
  fromAmount: string; toAmount: string; lockedRate: string;
  status: OrderStatus; expiresAt: Date; createdAt: Date;
  clientEmail?: string; clientPhone?: string; clientWallet?: string; adminNotes?: string;

  static fromEntity(e: any, priv = false): OrderResponseDto {
    const d = new OrderResponseDto();
    d.id = e.id; d.code = e.code;
    d.fromCurrency = e.fromCurrency?.code || e.fromCurrencyId;
    d.toCurrency = e.toCurrency?.code || e.toCurrencyId;
    d.fromAmount = e.fromAmount.toString(); d.toAmount = e.toAmount.toString();
    d.lockedRate = e.lockedRate.toString(); d.status = e.status;
    d.expiresAt = e.expiresAt; d.createdAt = e.createdAt;
    if (priv) { d.clientEmail = e.clientEmail; d.clientPhone = e.clientPhone; d.clientWallet = e.clientWallet; d.adminNotes = e.adminNotes; }
    return d;
  }
}
EOF

cat > backend/src/modules/orders/application/services/order.service.ts << 'EOF'
import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '@/core/database/prisma.service';
import { CodeGenerator } from '@/shared/utils/code-generator.util';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderResponseDto } from '../dto/order-response.dto';
import { OrderStatus, Prisma } from '@prisma/client';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  constructor(private prisma: PrismaService, private codeGen: CodeGenerator, private events: EventEmitter2) {}

  async create(dto: CreateOrderDto) {
    const [from, to] = await Promise.all([
      this.prisma.currency.findFirst({ where: { code: dto.fromCurrency, isActive: true } }),
      this.prisma.currency.findFirst({ where: { code: dto.toCurrency, isActive: true } }),
    ]);
    if (!from) throw new BadRequestException(`Currency ${dto.fromCurrency} not found`);
    if (!to) throw new BadRequestException(`Currency ${dto.toCurrency} not found`);
    if (dto.fromAmount < Number(from.minAmount)) throw new BadRequestException(`Min: ${from.minAmount}`);
    if (dto.fromAmount > Number(from.maxAmount)) throw new BadRequestException(`Max: ${from.maxAmount}`);

    const rate = await this.prisma.exchangeRate.findUnique({
      where: { fromCurrencyId_toCurrencyId: { fromCurrencyId: from.id, toCurrencyId: to.id } },
    });
    if (!rate) throw new BadRequestException('Rate not available');

    const eff = Number(rate.effectiveRate);
    let code: string;
    for (let i = 0; i < 5; i++) { code = this.codeGen.generate().code; if (!(await this.prisma.order.findUnique({ where: { code } }))) break; }

    const order = await this.prisma.order.create({
      data: {
        code, fromCurrencyId: from.id, toCurrencyId: to.id,
        fromAmount: dto.fromAmount, toAmount: dto.fromAmount * eff,
        exchangeRateId: rate.id, lockedRate: eff,
        clientEmail: dto.clientEmail, clientPhone: dto.clientPhone, clientWallet: dto.clientWallet,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        statusHistory: { create: { fromStatus: '', toStatus: OrderStatus.PENDING } },
      },
      include: { fromCurrency: true, toCurrency: true },
    });
    this.events.emit('order.created', { orderId: order.id, code: order.code, email: order.clientEmail });
    this.logger.log(`Order: ${order.code}`);
    return OrderResponseDto.fromEntity(order);
  }

  async findByCode(code: string) {
    const o = await this.prisma.order.findUnique({ where: { code }, include: { fromCurrency: true, toCurrency: true } });
    if (!o) throw new NotFoundException('Not found');
    return OrderResponseDto.fromEntity(o);
  }

  async findById(id: string) {
    const o = await this.prisma.order.findUnique({ where: { id }, include: { fromCurrency: true, toCurrency: true, statusHistory: { orderBy: { createdAt: 'asc' } } } });
    if (!o) throw new NotFoundException('Not found');
    return OrderResponseDto.fromEntity(o, true);
  }

  async findAll(p: { page?: number; limit?: number; status?: OrderStatus; search?: string }) {
    const { page = 1, limit = 20, status, search } = p;
    const skip = (page - 1) * limit;
    const where: Prisma.OrderWhereInput = {};
    if (status) where.status = status;
    if (search) where.OR = [{ code: { contains: search, mode: 'insensitive' } }, { clientEmail: { contains: search, mode: 'insensitive' } }];
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { fromCurrency: true, toCurrency: true } }),
      this.prisma.order.count({ where }),
    ]);
    return { data: orders.map(o => OrderResponseDto.fromEntity(o, true)), meta: { total, page, limit, hasMore: skip + orders.length < total } };
  }

  async approve(id: string, adminId: string, notes?: string) {
    const o = await this.prisma.order.findUnique({ where: { id } });
    if (!o) throw new NotFoundException('Not found');
    if (o.status !== OrderStatus.PENDING) throw new BadRequestException('Not pending');
    if (new Date() > o.expiresAt) throw new BadRequestException('Expired');
    const u = await this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.APPROVED, processedBy: adminId, adminNotes: notes, statusHistory: { create: { fromStatus: OrderStatus.PENDING, toStatus: OrderStatus.APPROVED, changedBy: adminId, reason: notes } } },
      include: { fromCurrency: true, toCurrency: true },
    });
    this.events.emit('order.approved', { orderId: u.id, code: u.code, email: u.clientEmail });
    return OrderResponseDto.fromEntity(u, true);
  }

  async reject(id: string, adminId: string, reason: string) {
    const o = await this.prisma.order.findUnique({ where: { id } });
    if (!o) throw new NotFoundException('Not found');
    if (o.status !== OrderStatus.PENDING) throw new BadRequestException('Not pending');
    const u = await this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.REJECTED, processedBy: adminId, adminNotes: reason, statusHistory: { create: { fromStatus: OrderStatus.PENDING, toStatus: OrderStatus.REJECTED, changedBy: adminId, reason } } },
      include: { fromCurrency: true, toCurrency: true },
    });
    this.events.emit('order.rejected', { orderId: u.id, code: u.code, email: u.clientEmail, reason });
    return OrderResponseDto.fromEntity(u, true);
  }

  async complete(id: string, adminId: string, notes?: string) {
    const o = await this.prisma.order.findUnique({ where: { id } });
    if (!o) throw new NotFoundException('Not found');
    if (o.status !== OrderStatus.APPROVED) throw new BadRequestException('Not approved');
    const u = await this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.COMPLETED, processedBy: adminId, adminNotes: o.adminNotes ? `${o.adminNotes}\n${notes}` : notes, statusHistory: { create: { fromStatus: OrderStatus.APPROVED, toStatus: OrderStatus.COMPLETED, changedBy: adminId, reason: notes } } },
      include: { fromCurrency: true, toCurrency: true },
    });
    this.events.emit('order.completed', { orderId: u.id, code: u.code, email: u.clientEmail });
    return OrderResponseDto.fromEntity(u, true);
  }
}
EOF

cat > backend/src/modules/orders/presentation/controllers/order.controller.ts << 'EOF'
import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '@/core/common/decorators/public.decorator';
import { OrderService } from '../../application/services/order.service';
import { CreateOrderDto } from '../../application/dto/create-order.dto';

@ApiTags('orders')
@Controller({ path: 'orders', version: '1' })
export class OrderController {
  constructor(private svc: OrderService) {}

  @Post() @Public() @Throttle({ default: { limit: 5, ttl: 60000 } }) @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateOrderDto) { return this.svc.create(dto); }

  @Get(':code') @Public()
  findByCode(@Param('code') code: string) { return this.svc.findByCode(code.toUpperCase()); }
}
EOF

cat > backend/src/modules/orders/presentation/controllers/admin-order.controller.ts << 'EOF'
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
EOF

echo "Orders module created!"