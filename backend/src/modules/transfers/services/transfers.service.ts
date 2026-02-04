import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CreateTransferDto,
  UpdateTransferStatusDto,
  QueryTransfersDto,
  TrackTransferDto,
  TransferStatus,
} from '../dto';

@Injectable()
export class TransfersService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  private generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'TR';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private calculateFee(amount: number, currency: string): number {
    // Fee structure: 1.5% with minimum 5 USD/EUR
    const feePercent = 0.015;
    const minFee = currency === 'EUR' ? 5 : 5;
    const calculatedFee = amount * feePercent;
    return Math.max(calculatedFee, minFee);
  }

  async createTransfer(dto: CreateTransferDto, userId?: string) {
    const city = await this.prisma.city.findUnique({
      where: { id: dto.recipientCityId },
      include: { country: true },
    });

    if (!city) {
      throw new BadRequestException('Invalid recipient city');
    }

    const fee = this.calculateFee(dto.amount, dto.currency);
    const totalAmount = dto.amount + fee;

    const transfer = await this.prisma.moneyTransfer.create({
      data: {
        code: this.generateCode(),
        userId,
        senderName: dto.senderName,
        senderPhone: dto.senderPhone,
        senderEmail: dto.senderEmail,
        recipientName: dto.recipientName,
        recipientPhone: dto.recipientPhone,
        recipientCityId: dto.recipientCityId,
        amount: dto.amount,
        currency: dto.currency,
        fee,
        totalAmount,
        notes: dto.notes,
      },
      include: {
        recipientCity: {
          include: {
            country: true,
          },
        },
      },
    });

    // Emit event for notifications
    this.eventEmitter.emit('transfer.created', transfer);

    return transfer;
  }

  async getTransfers(query: QueryTransfersDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.recipientCityId) {
      where.recipientCityId = query.recipientCityId;
    }

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { senderName: { contains: query.search, mode: 'insensitive' } },
        { senderPhone: { contains: query.search, mode: 'insensitive' } },
        { recipientName: { contains: query.search, mode: 'insensitive' } },
        { recipientPhone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [transfers, total] = await Promise.all([
      this.prisma.moneyTransfer.findMany({
        where,
        include: {
          recipientCity: {
            include: {
              country: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.moneyTransfer.count({ where }),
    ]);

    return {
      data: transfers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTransferById(id: string) {
    const transfer = await this.prisma.moneyTransfer.findUnique({
      where: { id },
      include: {
        recipientCity: {
          include: {
            country: true,
          },
        },
      },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }

    return transfer;
  }

  async updateTransferStatus(id: string, dto: UpdateTransferStatusDto, adminId: string) {
    const transfer = await this.prisma.moneyTransfer.findUnique({
      where: { id },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }

    const updateData: any = {
      status: dto.status,
      processedBy: adminId,
    };

    if (dto.adminNotes) {
      updateData.adminNotes = dto.adminNotes;
    }

    if (dto.status === TransferStatus.COMPLETED) {
      updateData.completedAt = new Date();
    }

    const updatedTransfer = await this.prisma.moneyTransfer.update({
      where: { id },
      data: updateData,
      include: {
        recipientCity: {
          include: {
            country: true,
          },
        },
      },
    });

    // Emit event for notifications
    this.eventEmitter.emit('transfer.status-changed', {
      transfer: updatedTransfer,
      oldStatus: transfer.status,
      newStatus: dto.status,
    });

    return updatedTransfer;
  }

  async trackTransfer(dto: TrackTransferDto) {
    const transfer = await this.prisma.moneyTransfer.findFirst({
      where: {
        code: dto.code.toUpperCase(),
        senderPhone: dto.senderPhone,
      },
      include: {
        recipientCity: {
          include: {
            country: {
              select: {
                nameEn: true,
                nameRu: true,
                flagEmoji: true,
              },
            },
          },
        },
      },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer not found or phone number does not match');
    }

    // Return limited info for security
    return {
      code: transfer.code,
      status: transfer.status,
      amount: transfer.amount,
      currency: transfer.currency,
      fee: transfer.fee,
      totalAmount: transfer.totalAmount,
      recipientCity: {
        nameEn: transfer.recipientCity.nameEn,
        nameRu: transfer.recipientCity.nameRu,
        country: transfer.recipientCity.country,
      },
      createdAt: transfer.createdAt,
      completedAt: transfer.completedAt,
    };
  }

  async getTransferStats() {
    const [
      totalCount,
      pendingCount,
      completedCount,
      totalVolume,
    ] = await Promise.all([
      this.prisma.moneyTransfer.count(),
      this.prisma.moneyTransfer.count({ where: { status: 'PENDING' } }),
      this.prisma.moneyTransfer.count({ where: { status: 'COMPLETED' } }),
      this.prisma.moneyTransfer.aggregate({
        _sum: { totalAmount: true },
        where: { status: 'COMPLETED' },
      }),
    ]);

    return {
      totalCount,
      pendingCount,
      completedCount,
      totalVolume: totalVolume._sum.totalAmount || 0,
    };
  }

  async getFeeEstimate(amount: number, currency: string) {
    const fee = this.calculateFee(amount, currency);
    return {
      amount,
      currency,
      fee,
      totalAmount: amount + fee,
      feePercent: '1.5%',
      minFee: currency === 'EUR' ? '5 EUR' : '5 USD',
    };
  }
}
