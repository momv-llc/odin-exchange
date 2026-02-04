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
import { PromoService } from '../../services/promo.service';
import { CreatePromoDto, UpdatePromoDto, QueryPromoDto } from '../../dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/core/common/decorators/roles.decorator';

@ApiTags('Admin Promo')
@Controller('admin/promo')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminPromoController {
  constructor(private promoService: PromoService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Create a new promo code' })
  async create(@Body() dto: CreatePromoDto, @Req() req: Request) {
    return this.promoService.create(dto, req.user!.id);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATOR')
  @ApiOperation({ summary: 'Get all promo codes' })
  async findAll(@Query() query: QueryPromoDto) {
    return this.promoService.findAll(query);
  }

  @Get('stats')
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATOR')
  @ApiOperation({ summary: 'Get promo statistics' })
  async getStats() {
    return this.promoService.getStats();
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATOR')
  @ApiOperation({ summary: 'Get promo details' })
  async findOne(@Param('id') id: string) {
    return this.promoService.findOne(id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Update promo code' })
  async update(@Param('id') id: string, @Body() dto: UpdatePromoDto) {
    return this.promoService.update(id, dto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete promo code' })
  async delete(@Param('id') id: string) {
    return this.promoService.delete(id);
  }
}
