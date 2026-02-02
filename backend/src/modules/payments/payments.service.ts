import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StripeService } from './providers/stripe.service';
import { PayPalService } from './providers/paypal.service';
import { CryptoPaymentService } from './providers/crypto-payment.service';
import { PaymentGateway, PaymentStatus } from '@prisma/client';
import { nanoid } from 'nanoid';

export interface CreatePaymentDto {
  userId?: string;
  orderId?: string;
  gateway: PaymentGateway;
  amount: number;
  currency: string;
  customerEmail?: string;
  metadata?: Record<string, any>;
  returnUrl?: string;
  cancelUrl?: string;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private stripe: StripeService,
    private paypal: PayPalService,
    private crypto: CryptoPaymentService,
  ) {}

  async createPayment(dto: CreatePaymentDto) {
    const code = 'PAY-' + nanoid(12).toUpperCase();
    const feeAmount = this.calculateFee(dto.gateway, dto.amount);
    const netAmount = dto.amount - feeAmount;

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        code,
        userId: dto.userId,
        orderId: dto.orderId,
        gateway: dto.gateway,
        amount: dto.amount,
        currency: dto.currency.toUpperCase(),
        feeAmount,
        netAmount,
        status: PaymentStatus.PENDING,
        customerEmail: dto.customerEmail,
        metadata: dto.metadata,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      },
    });

    // Create payment intent/session with provider
    let checkoutData: any;
    switch (dto.gateway) {
      case PaymentGateway.STRIPE:
        checkoutData = await this.stripe.createPaymentIntent({
          amount: dto.amount,
          currency: dto.currency,
          paymentId: payment.id,
          customerEmail: dto.customerEmail,
          metadata: { paymentCode: code, ...dto.metadata },
        });
        break;

      case PaymentGateway.PAYPAL:
        checkoutData = await this.paypal.createOrder({
          amount: dto.amount,
          currency: dto.currency,
          paymentId: payment.id,
          returnUrl: dto.returnUrl,
          cancelUrl: dto.cancelUrl,
        });
        break;

      case PaymentGateway.CRYPTO_DIRECT:
      case PaymentGateway.COINBASE:
        checkoutData = await this.crypto.createPaymentAddress({
          amount: dto.amount,
          currency: dto.currency,
          paymentId: payment.id,
        });
        break;

      default:
        throw new BadRequestException('Unsupported payment gateway');
    }

    // Update payment with external ID
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { externalId: checkoutData.externalId },
    });

    return {
      payment,
      checkout: checkoutData,
    };
  }

  private calculateFee(gateway: PaymentGateway, amount: number): number {
    const feeRates: Record<PaymentGateway, { percent: number; fixed: number }> = {
      [PaymentGateway.STRIPE]: { percent: 2.9, fixed: 0.30 },
      [PaymentGateway.PAYPAL]: { percent: 3.49, fixed: 0.49 },
      [PaymentGateway.COINBASE]: { percent: 1.0, fixed: 0 },
      [PaymentGateway.BINANCE_PAY]: { percent: 0.5, fixed: 0 },
      [PaymentGateway.CRYPTO_DIRECT]: { percent: 0, fixed: 0 },
      [PaymentGateway.MANUAL]: { percent: 0, fixed: 0 },
    };

    const rate = feeRates[gateway] || { percent: 0, fixed: 0 };
    return (amount * rate.percent) / 100 + rate.fixed;
  }

  async handleWebhook(gateway: PaymentGateway, payload: any, signature?: string) {
    this.logger.log(`Processing ${gateway} webhook`);

    switch (gateway) {
      case PaymentGateway.STRIPE:
        return this.stripe.handleWebhook(payload, signature);
      case PaymentGateway.PAYPAL:
        return this.paypal.handleWebhook(payload);
      default:
        throw new BadRequestException('Unsupported gateway webhook');
    }
  }

  async updatePaymentStatus(paymentId: string, status: PaymentStatus, webhookData?: any) {
    const payment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        webhookData,
        paidAt: status === PaymentStatus.COMPLETED ? new Date() : undefined,
      },
    });

    // TODO: Trigger order processing if payment completed
    if (status === PaymentStatus.COMPLETED && payment.orderId) {
      this.logger.log(`Payment ${payment.code} completed, processing order ${payment.orderId}`);
    }

    return payment;
  }

  async getPayment(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { refunds: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async getPaymentByCode(code: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { code },
      include: { refunds: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async getUserPayments(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where: { userId } }),
    ]);
    return { payments, total, page, limit };
  }

  async refundPayment(paymentId: string, amount?: number, reason?: string, adminId?: string) {
    const payment = await this.getPayment(paymentId);
    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Can only refund completed payments');
    }

    const refundAmount = amount || Number(payment.amount);

    // Process refund with provider
    let externalRefundId: string | undefined;
    switch (payment.gateway) {
      case PaymentGateway.STRIPE:
        const stripeRefund = await this.stripe.refund(payment.externalId!, refundAmount);
        externalRefundId = stripeRefund.id;
        break;
      case PaymentGateway.PAYPAL:
        const paypalRefund = await this.paypal.refund(payment.externalId!, refundAmount, payment.currency);
        externalRefundId = paypalRefund.id;
        break;
    }

    // Create refund record
    const refund = await this.prisma.refund.create({
      data: {
        paymentId,
        externalId: externalRefundId,
        amount: refundAmount,
        reason,
        status: PaymentStatus.COMPLETED,
        processedBy: adminId,
        processedAt: new Date(),
      },
    });

    // Update payment status
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.REFUNDED,
        refundedAt: new Date(),
      },
    });

    return refund;
  }

  async getPaymentStats(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [total, completed, failed, refunded] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.count({ where: { ...where, status: PaymentStatus.COMPLETED } }),
      this.prisma.payment.count({ where: { ...where, status: PaymentStatus.FAILED } }),
      this.prisma.payment.count({ where: { ...where, status: PaymentStatus.REFUNDED } }),
    ]);

    const volumeResult = await this.prisma.payment.aggregate({
      where: { ...where, status: PaymentStatus.COMPLETED },
      _sum: { amount: true, feeAmount: true },
    });

    return {
      total,
      completed,
      failed,
      refunded,
      totalVolume: volumeResult._sum.amount || 0,
      totalFees: volumeResult._sum.feeAmount || 0,
    };
  }
}
