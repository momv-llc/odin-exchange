import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { TransfersService } from '../../services/transfers.service';
import { UpdateTransferStatusDto, QueryTransfersDto } from '../../dto';

@Controller('admin/transfers')
@UseGuards(JwtAuthGuard)
export class AdminTransfersController {
  constructor(private transfersService: TransfersService) {}

  @Get()
  async getTransfers(@Query() query: QueryTransfersDto) {
    return this.transfersService.getTransfers(query);
  }

  @Get('stats')
  async getStats() {
    return this.transfersService.getTransferStats();
  }

  @Get(':id')
  async getTransfer(@Param('id') id: string) {
    return this.transfersService.getTransferById(id);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTransferStatusDto,
    @Request() req: any,
  ) {
    return this.transfersService.updateTransferStatus(id, dto, req.user.id);
  }
}
