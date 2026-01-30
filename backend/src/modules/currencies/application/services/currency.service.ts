import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';

@Injectable()
export class CurrencyService {
  constructor(private prisma: PrismaService) {}
  async findAll(active = true) { return this.prisma.currency.findMany({ where: active ? { isActive: true } : {}, orderBy: { code: 'asc' } }); }
  async findByCode(code: string) { const c = await this.prisma.currency.findUnique({ where: { code } }); if (!c) throw new NotFoundException(); return c; }
}
