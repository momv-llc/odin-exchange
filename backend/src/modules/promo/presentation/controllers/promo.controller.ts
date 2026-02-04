import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PromoService } from '../../services/promo.service';
import { ValidatePromoDto } from '../../dto';

@ApiTags('Promo')
@Controller('promo')
export class PromoController {
  constructor(private promoService: PromoService) {}

  @Post('validate')
  @ApiOperation({ summary: 'Validate a promo code' })
  @ApiResponse({ status: 200, description: 'Promo validation result' })
  async validate(@Body() dto: ValidatePromoDto) {
    return this.promoService.validate(dto);
  }
}
