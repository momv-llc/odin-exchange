import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@/core/common/decorators/public.decorator';
import { CurrencyService } from '../../application/services/currency.service';

@ApiTags('currencies')
@Controller({ path: 'currencies', version: '1' })
export class CurrencyController {
  constructor(private svc: CurrencyService) {}
  @Get() @Public() findAll() { return this.svc.findAll(); }
}
