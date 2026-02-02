import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Headers,
  RawBodyRequest,
} from '@nestjs/common';
import { PaymentsService, CreatePaymentDto } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentGateway } from '@prisma/client';
import { Request } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createPayment(@Body() dto: CreatePaymentDto, @Req() req: any) {
    return this.paymentsService.createPayment({
      ...dto,
      userId: req.user.id,
    });
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  getMyPayments(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.paymentsService.getUserPayments(
      req.user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get(':code')
  getPaymentByCode(@Param('code') code: string) {
    return this.paymentsService.getPaymentByCode(code);
  }

  // Stripe webhook
  @Post('webhook/stripe')
  handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhook(
      PaymentGateway.STRIPE,
      req.rawBody,
      signature,
    );
  }

  // PayPal webhook
  @Post('webhook/paypal')
  handlePayPalWebhook(@Body() payload: any) {
    return this.paymentsService.handleWebhook(PaymentGateway.PAYPAL, payload);
  }

  // Crypto webhook (for monitoring transactions)
  @Post('webhook/crypto')
  handleCryptoWebhook(@Body() payload: any) {
    return this.paymentsService.handleWebhook(PaymentGateway.CRYPTO_DIRECT, payload);
  }
}

// Admin controller
@Controller('admin/payments')
export class AdminPaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  async getAllPayments(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('gateway') gateway?: string,
  ) {
    // Implementation for admin payment listing
    return { message: 'Admin payments endpoint' };
  }

  @Get('stats')
  getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.paymentsService.getPaymentStats(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Post(':id/refund')
  refundPayment(
    @Param('id') id: string,
    @Body() body: { amount?: number; reason?: string },
    @Req() req: any,
  ) {
    return this.paymentsService.refundPayment(
      id,
      body.amount,
      body.reason,
      req.admin?.id,
    );
  }
}
