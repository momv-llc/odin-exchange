import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import {
  CreateCountryDto,
  UpdateCountryDto,
  CreateCityDto,
  UpdateCityDto,
  QueryCountriesDto,
  QueryCitiesDto,
} from '../dto';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  // ==================== COUNTRIES ====================

  async getCountries(query: QueryCountriesDto) {
    const where: any = {};

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.search) {
      where.OR = [
        { nameEn: { contains: query.search, mode: 'insensitive' } },
        { nameRu: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.country.findMany({
      where,
      include: {
        _count: {
          select: { cities: true },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { nameEn: 'asc' }],
    });
  }

  async getCountryById(id: string) {
    return this.prisma.country.findUnique({
      where: { id },
      include: {
        cities: {
          where: { isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { nameEn: 'asc' }],
        },
      },
    });
  }

  async createCountry(dto: CreateCountryDto) {
    return this.prisma.country.create({
      data: dto,
    });
  }

  async updateCountry(id: string, dto: UpdateCountryDto) {
    return this.prisma.country.update({
      where: { id },
      data: dto,
    });
  }

  async deleteCountry(id: string) {
    // First delete all cities
    await this.prisma.city.deleteMany({
      where: { countryId: id },
    });

    return this.prisma.country.delete({
      where: { id },
    });
  }

  // ==================== CITIES ====================

  async getCities(query: QueryCitiesDto) {
    const where: any = {};

    if (query.countryId) {
      where.countryId = query.countryId;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.isFeatured !== undefined) {
      where.isFeatured = query.isFeatured;
    }

    if (query.search) {
      where.OR = [
        { nameEn: { contains: query.search, mode: 'insensitive' } },
        { nameRu: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.city.findMany({
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
      },
      orderBy: [{ sortOrder: 'asc' }, { nameEn: 'asc' }],
    });
  }

  async getCityById(id: string) {
    return this.prisma.city.findUnique({
      where: { id },
      include: {
        country: true,
        paymentMethods: {
          where: { isActive: true },
        },
      },
    });
  }

  async createCity(dto: CreateCityDto) {
    return this.prisma.city.create({
      data: dto,
      include: {
        country: true,
      },
    });
  }

  async updateCity(id: string, dto: UpdateCityDto) {
    return this.prisma.city.update({
      where: { id },
      data: dto,
      include: {
        country: true,
      },
    });
  }

  async deleteCity(id: string) {
    return this.prisma.city.delete({
      where: { id },
    });
  }

  async getFeaturedCities() {
    return this.prisma.city.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
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
      },
      orderBy: [{ sortOrder: 'asc' }, { nameEn: 'asc' }],
    });
  }

  // ==================== PUBLIC API ====================

  async getActiveCountriesWithCities() {
    return this.prisma.country.findMany({
      where: { isActive: true },
      include: {
        cities: {
          where: { isActive: true },
          orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { nameEn: 'asc' }],
          select: {
            id: true,
            nameEn: true,
            nameRu: true,
            nameUa: true,
            nameDe: true,
            isFeatured: true,
          },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { nameEn: 'asc' }],
    });
  }
}
