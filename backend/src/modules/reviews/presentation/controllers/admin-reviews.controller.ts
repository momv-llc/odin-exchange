import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { ReviewsService } from '../../services/reviews.service';
import { UpdateReviewDto, QueryReviewsDto } from '../../dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/core/common/decorators/roles.decorator';

@ApiTags('Admin Reviews')
@Controller('admin/reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATOR')
  @ApiOperation({ summary: 'Get all reviews with filters' })
  async findAll(@Query() query: QueryReviewsDto) {
    return this.reviewsService.findAll(query);
  }

  @Get('stats')
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATOR')
  @ApiOperation({ summary: 'Get reviews statistics' })
  async getStats() {
    return this.reviewsService.getStats();
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATOR')
  @ApiOperation({ summary: 'Get single review details' })
  async findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id/approve')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Approve a review' })
  async approve(
    @Param('id') id: string,
    @Req() req: Request,
    @Body('notes') notes?: string,
  ) {
    return this.reviewsService.approve(id, req.user!.id, notes);
  }

  @Patch(':id/reject')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Reject a review' })
  async reject(
    @Param('id') id: string,
    @Req() req: Request,
    @Body('notes') notes: string,
  ) {
    return this.reviewsService.reject(id, req.user!.id, notes);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Update review' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
    @Req() req: Request,
  ) {
    return this.reviewsService.update(id, dto, req.user!.id);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete a review' })
  async delete(@Param('id') id: string) {
    return this.reviewsService.delete(id);
  }
}
