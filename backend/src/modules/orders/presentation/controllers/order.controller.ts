import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '@/core/common/decorators/public.decorator';
import { OrderService } from '../../application/services/order.service';
import { CreateOrderDto } from '../../application/dto/create-order.dto';

@ApiTags('orders')
@Controller({ path: 'orders', version: '1' })
export class OrderController {
  constructor(private svc: OrderService) {}

  @Post() @Public() @Throttle({ default: { limit: 5, ttl: 60000 } }) @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateOrderDto) { return this.svc.create(dto); }

  @Get(':code') @Public()
  findByCode(@Param('code') code: string) { return this.svc.findByCode(code.toUpperCase()); }
}
