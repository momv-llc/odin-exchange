import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { CreatePromoDto, UpdatePromoDto, QueryPromoDto, ValidatePromoDto } from '../dto';

@Injectable()
export class PromoService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePromoDto, adminId: string) {
    const exists = await this.prisma.promo.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (exists) {
      throw new ConflictException('Promo code already exists');
    }

    return this.prisma.promo.create({
      data: {
        ...dto,
        code: dto.code.toUpperCase(),
        validFrom: new Date(dto.validFrom),
        validUntil: new Date(dto.validUntil),
        createdBy: adminId,
      },
    });
  }

  async findAll(query: QueryPromoDto) {
    const { search, isActive, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [promos, total] = await Promise.all([
      this.prisma.promo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: { id: true, email: true },
          },
          _count: {
            select: { usages: true },
          },
        },
      }),
      this.prisma.promo.count({ where }),
    ]);

    return {
      data: promos,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const promo = await this.prisma.promo.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, email: true },
        },
        usages: {
          take: 10,
          orderBy: { usedAt: 'desc' },
        },
        _count: {
          select: { usages: true },
        },
      },
    });

    if (!promo) {
      throw new NotFoundException('Promo not found');
    }

    return promo;
  }

  async update(id: string, dto: UpdatePromoDto) {
    await this.findOne(id);

    const data: any = { ...dto };
    if (dto.validFrom) data.validFrom = new Date(dto.validFrom);
    if (dto.validUntil) data.validUntil = new Date(dto.validUntil);

    return this.prisma.promo.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prisma.promoUsage.deleteMany({ where: { promoId: id } });
    return this.prisma.promo.delete({ where: { id } });
  }

  async validate(dto: ValidatePromoDto) {
    const promo = await this.prisma.promo.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (!promo) {
      throw new NotFoundException('Promo code not found');
    }

    if (!promo.isActive) {
      throw new BadRequestException('Promo code is not active');
    }

    const now = new Date();
    if (now < promo.validFrom || now > promo.validUntil) {
      throw new BadRequestException('Promo code is expired or not yet valid');
    }

    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      throw new BadRequestException('Promo code usage limit reached');
    }

    if (promo.minAmount && dto.amount < Number(promo.minAmount)) {
      throw new BadRequestException(`Minimum amount for this promo is ${promo.minAmount}`);
    }

    let discount = 0;
    switch (promo.type) {
      case 'DISCOUNT_PERCENT':
        discount = dto.amount * (Number(promo.value) / 100);
        break;
      case 'DISCOUNT_FIXED':
        discount = Math.min(Number(promo.value), dto.amount);
        break;
      case 'BONUS':
        discount = 0;
        break;
    }

    return {
      valid: true,
      promo: {
        code: promo.code,
        type: promo.type,
        value: promo.value,
        description: promo.description,
      },
      discount,
      finalAmount: dto.amount - discount,
    };
  }

  async use(code: string, userId: string | null, orderId: string, discount: number) {
    const promo = await this.prisma.promo.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo) {
      throw new NotFoundException('Promo not found');
    }

    await this.prisma.$transaction([
      this.prisma.promo.update({
        where: { id: promo.id },
        data: { usedCount: { increment: 1 } },
      }),
      this.prisma.promoUsage.create({
        data: {
          promoId: promo.id,
          userId,
          orderId,
          discount,
        },
      }),
    ]);

    return { success: true };
  }

  async getStats() {
    const [total, active, expired, totalUsages, totalDiscount] = await Promise.all([
      this.prisma.promo.count(),
      this.prisma.promo.count({
        where: {
          isActive: true,
          validUntil: { gt: new Date() },
        },
      }),
      this.prisma.promo.count({
        where: { validUntil: { lt: new Date() } },
      }),
      this.prisma.promoUsage.count(),
      this.prisma.promoUsage.aggregate({
        _sum: { discount: true },
      }),
    ]);

    const topPromos = await this.prisma.promo.findMany({
      take: 5,
      orderBy: { usedCount: 'desc' },
      select: {
        code: true,
        type: true,
        value: true,
        usedCount: true,
      },
    });

    return {
      total,
      active,
      expired,
      totalUsages,
      totalDiscount: totalDiscount._sum.discount || 0,
      topPromos,
    };
  }
}
