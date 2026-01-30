import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@/core/common/decorators/public.decorator';
import { RateService } from '../../application/services/rate.service';

@ApiTags('rates')
@Controller({ path: 'rates', version: '1' })
export class RateController {
  constructor(private svc: RateService) {}
  @Get() @Public() getAll() { return this.svc.getAllRates(); }
  @Get('pair') @Public() getPair(@Query('from') from: string, @Query('to') to: string) {
    return this.svc.getRate(from?.toUpperCase(), to?.toUpperCase()).then(r => r ? { from, to, ...r } : { error: 'Not available' });
  }
}
