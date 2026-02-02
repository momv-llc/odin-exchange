import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { TransfersService } from '../../services/transfers.service';
import { CreateTransferDto, TrackTransferDto } from '../../dto';

@Controller('transfers')
export class TransfersController {
  constructor(private transfersService: TransfersService) {}

  @Post()
  async createTransfer(@Body() dto: CreateTransferDto) {
    return this.transfersService.createTransfer(dto);
  }

  @Post('track')
  async trackTransfer(@Body() dto: TrackTransferDto) {
    return this.transfersService.trackTransfer(dto);
  }

  @Get('fee-estimate')
  async getFeeEstimate(
    @Query('amount') amount: string,
    @Query('currency') currency: string,
  ) {
    return this.transfersService.getFeeEstimate(parseFloat(amount), currency);
  }
}
