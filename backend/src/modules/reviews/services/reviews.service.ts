import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { CreateReviewDto, UpdateReviewDto, QueryReviewsDto, ReviewStatus } from '../dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateReviewDto, userId?: string, ip?: string) {
    return this.prisma.review.create({
      data: {
        ...dto,
        userId,
        ipAddress: ip,
      },
    });
  }

  async findAll(query: QueryReviewsDto) {
    const { status, page = 1, limit = 20, rating } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (rating) where.rating = rating;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findPublic(query: QueryReviewsDto) {
    const { page = 1, limit = 20, rating } = query;
    const skip = (page - 1) * limit;

    const where: any = { status: 'APPROVED' };
    if (rating) where.rating = rating;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          authorName: true,
          rating: true,
          title: true,
          content: true,
          createdAt: true,
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    const avgRating = await this.prisma.review.aggregate({
      where: { status: 'APPROVED' },
      _avg: { rating: true },
      _count: true,
    });

    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        averageRating: avgRating._avg.rating || 0,
        totalReviews: avgRating._count,
      },
    };
  }

  async findOne(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        moderator: {
          select: { id: true, email: true },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async approve(id: string, adminId: string, notes?: string) {
    const review = await this.findOne(id);

    return this.prisma.review.update({
      where: { id },
      data: {
        status: 'APPROVED',
        moderatedBy: adminId,
        moderatedAt: new Date(),
        adminNotes: notes,
      },
    });
  }

  async reject(id: string, adminId: string, notes: string) {
    const review = await this.findOne(id);

    return this.prisma.review.update({
      where: { id },
      data: {
        status: 'REJECTED',
        moderatedBy: adminId,
        moderatedAt: new Date(),
        adminNotes: notes,
      },
    });
  }

  async update(id: string, dto: UpdateReviewDto, adminId: string) {
    const review = await this.findOne(id);

    return this.prisma.review.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.status && {
          moderatedBy: adminId,
          moderatedAt: new Date(),
        }),
      },
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.review.delete({ where: { id } });
  }

  async getStats() {
    const [total, pending, approved, rejected, avgRating] = await Promise.all([
      this.prisma.review.count(),
      this.prisma.review.count({ where: { status: 'PENDING' } }),
      this.prisma.review.count({ where: { status: 'APPROVED' } }),
      this.prisma.review.count({ where: { status: 'REJECTED' } }),
      this.prisma.review.aggregate({
        where: { status: 'APPROVED' },
        _avg: { rating: true },
      }),
    ]);

    const ratingDistribution = await this.prisma.review.groupBy({
      by: ['rating'],
      where: { status: 'APPROVED' },
      _count: true,
    });

    return {
      total,
      pending,
      approved,
      rejected,
      averageRating: avgRating._avg.rating || 0,
      ratingDistribution: ratingDistribution.reduce(
        (acc, item) => ({ ...acc, [item.rating]: item._count }),
        { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      ),
    };
  }
}
