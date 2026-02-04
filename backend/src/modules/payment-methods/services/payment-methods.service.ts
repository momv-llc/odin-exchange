import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import {
  CreatePaymentMethodDto,
  UpdatePaymentMethodDto,
  QueryPaymentMethodsDto,
} from '../dto';

@Injectable()
export class PaymentMethodsService {
  constructor(private prisma: PrismaService) {}

  async getPaymentMethods(query: QueryPaymentMethodsDto) {
    const where: any = {};

    if (query.type) {
      where.type = query.type;
    }

    if (query.countryId) {
      where.countryId = query.countryId;
    }

    if (query.cityId) {
      where.cityId = query.cityId;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.search) {
      where.OR = [
        { nameEn: { contains: query.search, mode: 'insensitive' } },
        { nameRu: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.paymentMethod.findMany({
      where,
      include: {
        country: {
          select: {
            id: true,
            code: true,
            nameEn: true,
            nameRu: true,
            flagEmoji: true,
          },
        },
        city: {
          select: {
            id: true,
            nameEn: true,
            nameRu: true,
          },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { nameEn: 'asc' }],
    });
  }

  async getPaymentMethodById(id: string) {
    return this.prisma.paymentMethod.findUnique({
      where: { id },
      include: {
        country: true,
        city: true,
      },
    });
  }

  async createPaymentMethod(dto: CreatePaymentMethodDto) {
    return this.prisma.paymentMethod.create({
      data: dto as any,
      include: {
        country: true,
        city: true,
      },
    });
  }

  async updatePaymentMethod(id: string, dto: UpdatePaymentMethodDto) {
    return this.prisma.paymentMethod.update({
      where: { id },
      data: dto as any,
      include: {
        country: true,
        city: true,
      },
    });
  }

  async deletePaymentMethod(id: string) {
    return this.prisma.paymentMethod.delete({
      where: { id },
    });
  }

  async getActivePaymentMethods(countryId?: string, cityId?: string) {
    const where: any = { isActive: true };

    if (cityId) {
      where.OR = [
        { cityId },
        { cityId: null, countryId },
        { cityId: null, countryId: null },
      ];
    } else if (countryId) {
      where.OR = [
        { countryId },
        { countryId: null },
      ];
    }

    return this.prisma.paymentMethod.findMany({
      where,
      orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  async getPaymentMethodsByType(type: string) {
    return this.prisma.paymentMethod.findMany({
      where: {
        type: type as any,
        isActive: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { nameEn: 'asc' }],
    });
  }
}
