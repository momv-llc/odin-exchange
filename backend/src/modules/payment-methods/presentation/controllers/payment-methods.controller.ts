import { Controller, Get, Param, Query } from '@nestjs/common';
import { PaymentMethodsService } from '../../services/payment-methods.service';
import { QueryPaymentMethodsDto } from '../../dto';

@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private paymentMethodsService: PaymentMethodsService) {}

  @Get()
  async getPaymentMethods(@Query() query: QueryPaymentMethodsDto) {
    return this.paymentMethodsService.getPaymentMethods({ ...query, isActive: true });
  }

  @Get('by-location')
  async getByLocation(
    @Query('countryId') countryId?: string,
    @Query('cityId') cityId?: string,
  ) {
    return this.paymentMethodsService.getActivePaymentMethods(countryId, cityId);
  }

  @Get('type/:type')
  async getByType(@Param('type') type: string) {
    return this.paymentMethodsService.getPaymentMethodsByType(type);
  }

  @Get(':id')
  async getPaymentMethod(@Param('id') id: string) {
    return this.paymentMethodsService.getPaymentMethodById(id);
  }
}
