import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '@/core/database/prisma.service';
import { CodeGenerator } from '@/shared/utils/code-generator.util';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderResponseDto } from '../dto/order-response.dto';
import { OrderStatus, Prisma } from '@prisma/client';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private prisma: PrismaService,
    private codeGen: CodeGenerator,
    private events: EventEmitter2,
  ) {}

  async create(dto: CreateOrderDto) {
    const [from, to] = await Promise.all([
      this.prisma.currency.findFirst({
        where: { code: dto.fromCurrency, isActive: true },
      }),
      this.prisma.currency.findFirst({
        where: { code: dto.toCurrency, isActive: true },
      }),
    ]);

    if (!from) {
      throw new BadRequestException(
        `Currency ${dto.fromCurrency} not found`,
      );
    }

    if (!to) {
      throw new BadRequestException(
        `Currency ${dto.toCurrency} not found`,
      );
    }

    if (dto.fromAmount < Number(from.minAmount)) {
      throw new BadRequestException(`Min: ${from.minAmount}`);
    }

    if (dto.fromAmount > Number(from.maxAmount)) {
      throw new BadRequestException(`Max: ${from.maxAmount}`);
    }

    const rate = await this.prisma.exchangeRate.findUnique({
      where: {
        fromCurrencyId_toCurrencyId: {
          fromCurrencyId: from.id,
          toCurrencyId: to.id,
        },
      },
    });

    if (!rate) {
      throw new BadRequestException('Rate not available');
    }

    const eff = Number(rate.effectiveRate);

    // ====== ГАРАНТИРОВАННАЯ ИНИЦИАЛИЗАЦИЯ CODE ======
    let code: string | null = null;

    for (let i = 0; i < 5; i++) {
      const generated = CodeGenerator.generate(); // без .code

      const exists = await this.prisma.order.findUnique({
        where: { code: generated },
      });

      if (!exists) {
        code = generated;
        break;
      }
    }

    if (!code) {
      throw new BadRequestException(
        'Unable to generate unique order code',
      );
    }
    // =================================================

    const order = await this.prisma.order.create({
      data: {
        code,
        fromCurrencyId: from.id,
        toCurrencyId: to.id,
        fromAmount: dto.fromAmount,
        toAmount: dto.fromAmount * eff,
        exchangeRateId: rate.id,
        lockedRate: eff,
        clientEmail: dto.clientEmail,
        clientPhone: dto.clientPhone,
        clientWallet: dto.clientWallet,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        statusHistory: {
          create: {
            fromStatus: '',
            toStatus: OrderStatus.PENDING,
          },
        },
      },
      include: { fromCurrency: true, toCurrency: true },
    });

    this.events.emit('order.created', {
      orderId: order.id,
      code: order.code,
      email: order.clientEmail,
    });

    this.logger.log(`Order: ${order.code}`);

    return OrderResponseDto.fromEntity(order);
  }

  async findByCode(code: string) {
    const o = await this.prisma.order.findUnique({
      where: { code },
      include: { fromCurrency: true, toCurrency: true },
    });

    if (!o) {
      throw new NotFoundException('Not found');
    }

    return OrderResponseDto.fromEntity(o);
  }

  async findById(id: string) {
    const o = await this.prisma.order.findUnique({
      where: { id },
      include: {
        fromCurrency: true,
        toCurrency: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!o) {
      throw new NotFoundException('Not found');
    }

    return OrderResponseDto.fromEntity(o, true);
  }

  async findAll(p: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    search?: string;
  }) {
    const { page = 1, limit = 20, status, search } = p;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        {
          clientEmail: { contains: search, mode: 'insensitive' },
        },
      ];
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { fromCurrency: true, toCurrency: true },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders.map(o =>
        OrderResponseDto.fromEntity(o, true),
      ),
      meta: {
        total,
        page,
        limit,
        hasMore: skip + orders.length < total,
      },
    };
  }

  async approve(id: string, adminId: string, notes?: string) {
    const o = await this.prisma.order.findUnique({ where: { id } });

    if (!o) {
      throw new NotFoundException('Not found');
    }

    if (o.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Not pending');
    }

    if (new Date() > o.expiresAt) {
      throw new BadRequestException('Expired');
    }

    const u = await this.prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.APPROVED,
        processedBy: adminId,
        adminNotes: notes,
        statusHistory: {
          create: {
            fromStatus: OrderStatus.PENDING,
            toStatus: OrderStatus.APPROVED,
            changedBy: adminId,
            reason: notes,
          },
        },
      },
      include: { fromCurrency: true, toCurrency: true },
    });

    this.events.emit('order.approved', {
      orderId: u.id,
      code: u.code,
      email: u.clientEmail,
    });

    return OrderResponseDto.fromEntity(u, true);
  }

  async reject(id: string, adminId: string, reason: string) {
    const o = await this.prisma.order.findUnique({ where: { id } });

    if (!o) {
      throw new NotFoundException('Not found');
    }

    if (o.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Not pending');
    }

    const u = await this.prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.REJECTED,
        processedBy: adminId,
        adminNotes: reason,
        statusHistory: {
          create: {
            fromStatus: OrderStatus.PENDING,
            toStatus: OrderStatus.REJECTED,
            changedBy: adminId,
            reason,
          },
        },
      },
      include: { fromCurrency: true, toCurrency: true },
    });

    this.events.emit('order.rejected', {
      orderId: u.id,
      code: u.code,
      email: u.clientEmail,
      reason,
    });

    return OrderResponseDto.fromEntity(u, true);
  }

  async complete(id: string, adminId: string, notes?: string) {
    const o = await this.prisma.order.findUnique({ where: { id } });

    if (!o) {
      throw new NotFoundException('Not found');
    }

    if (o.status !== OrderStatus.APPROVED) {
      throw new BadRequestException('Not approved');
    }

    const u = await this.prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.COMPLETED,
        processedBy: adminId,
        adminNotes: o.adminNotes
          ? `${o.adminNotes}\n${notes}`
          : notes,
        statusHistory: {
          create: {
            fromStatus: OrderStatus.APPROVED,
            toStatus: OrderStatus.COMPLETED,
            changedBy: adminId,
            reason: notes,
          },
        },
      },
      include: { fromCurrency: true, toCurrency: true },
    });

    this.events.emit('order.completed', {
      orderId: u.id,
      code: u.code,
      email: u.clientEmail,
    });

    return OrderResponseDto.fromEntity(u, true);
  }
}
