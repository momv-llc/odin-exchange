import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PaymentMethodsService } from '../../services/payment-methods.service';
import {
  CreatePaymentMethodDto,
  UpdatePaymentMethodDto,
  QueryPaymentMethodsDto,
} from '../../dto';

@Controller('admin/payment-methods')
@UseGuards(JwtAuthGuard)
export class AdminPaymentMethodsController {
  constructor(private paymentMethodsService: PaymentMethodsService) {}

  @Get()
  async getPaymentMethods(@Query() query: QueryPaymentMethodsDto) {
    return this.paymentMethodsService.getPaymentMethods(query);
  }

  @Get(':id')
  async getPaymentMethod(@Param('id') id: string) {
    return this.paymentMethodsService.getPaymentMethodById(id);
  }

  @Post()
  async createPaymentMethod(@Body() dto: CreatePaymentMethodDto) {
    return this.paymentMethodsService.createPaymentMethod(dto);
  }

  @Put(':id')
  async updatePaymentMethod(@Param('id') id: string, @Body() dto: UpdatePaymentMethodDto) {
    return this.paymentMethodsService.updatePaymentMethod(id, dto);
  }

  @Delete(':id')
  async deletePaymentMethod(@Param('id') id: string) {
    return this.paymentMethodsService.deletePaymentMethod(id);
  }
}
