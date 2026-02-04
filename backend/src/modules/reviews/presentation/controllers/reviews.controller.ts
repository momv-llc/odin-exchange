import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { ReviewsService } from '../../services/reviews.service';
import { CreateReviewDto, QueryReviewsDto } from '../../dto';
import { UserJwtAuthGuard } from '@/modules/user-auth/guards/user-jwt-auth.guard';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'Get public approved reviews' })
  @ApiResponse({ status: 200, description: 'List of approved reviews' })
  async findPublic(@Query() query: QueryReviewsDto) {
    return this.reviewsService.findPublic(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new review (guest or user)' })
  @ApiResponse({ status: 201, description: 'Review created and pending moderation' })
  async create(@Body() dto: CreateReviewDto, @Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress;
    const userId = req.user?.['id'];
    return this.reviewsService.create(dto, userId, ip);
  }

  @Post('user')
  @UseGuards(UserJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create review as authenticated user' })
  async createAsUser(@Body() dto: CreateReviewDto, @Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress;
    return this.reviewsService.create(dto, req.user!.id, ip);
  }
}
