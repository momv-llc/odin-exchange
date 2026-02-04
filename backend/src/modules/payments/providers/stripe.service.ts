import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;
  private webhookSecret: string;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (secretKey) {
      this.stripe = new Stripe(secretKey, { apiVersion: '2023-10-16' });
    }
    this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
  }

  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    paymentId: string;
    customerEmail?: string;
    metadata?: Record<string, string>;
  }) {
    if (!this.stripe) {
      return this.getMockPaymentIntent(params);
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(params.amount * 100), // Convert to cents
        currency: params.currency.toLowerCase(),
        metadata: {
          paymentId: params.paymentId,
          ...params.metadata,
        },
        receipt_email: params.customerEmail,
        automatic_payment_methods: { enabled: true },
      });

      return {
        externalId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        publishableKey: this.configService.get<string>('STRIPE_PUBLISHABLE_KEY'),
      };
    } catch (error) {
      this.logger.error('Stripe createPaymentIntent error:', error);
      throw error;
    }
  }

  async createCheckoutSession(params: {
    amount: number;
    currency: string;
    paymentId: string;
    successUrl: string;
    cancelUrl: string;
    customerEmail?: string;
    productName?: string;
  }) {
    if (!this.stripe) {
      return this.getMockCheckoutSession(params);
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: params.currency.toLowerCase(),
              product_data: {
                name: params.productName || 'Exchange Order',
              },
              unit_amount: Math.round(params.amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        customer_email: params.customerEmail,
        metadata: { paymentId: params.paymentId },
      });

      return {
        externalId: session.id,
        checkoutUrl: session.url,
      };
    } catch (error) {
      this.logger.error('Stripe createCheckoutSession error:', error);
      throw error;
    }
  }

  async handleWebhook(payload: Buffer, signature: string) {
    if (!this.stripe) {
      this.logger.warn('Stripe not configured, skipping webhook');
      return { received: true };
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret,
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          this.logger.log(`PaymentIntent ${paymentIntent.id} succeeded`);
          return {
            type: 'payment_completed',
            paymentId: paymentIntent.metadata.paymentId,
            externalId: paymentIntent.id,
          };

        case 'payment_intent.payment_failed':
          const failedIntent = event.data.object as Stripe.PaymentIntent;
          this.logger.log(`PaymentIntent ${failedIntent.id} failed`);
          return {
            type: 'payment_failed',
            paymentId: failedIntent.metadata.paymentId,
            externalId: failedIntent.id,
            error: failedIntent.last_payment_error?.message,
          };

        case 'checkout.session.completed':
          const session = event.data.object as Stripe.Checkout.Session;
          return {
            type: 'checkout_completed',
            paymentId: session.metadata?.paymentId,
            externalId: session.id,
          };

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error('Webhook error:', error);
      throw error;
    }
  }

  async refund(paymentIntentId: string, amount?: number) {
    if (!this.stripe) {
      return { id: 'mock_refund_' + Date.now() };
    }

    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
      });
      return refund;
    } catch (error) {
      this.logger.error('Stripe refund error:', error);
      throw error;
    }
  }

  async getPaymentIntent(id: string) {
    if (!this.stripe) return null;
    return this.stripe.paymentIntents.retrieve(id);
  }

  private getMockPaymentIntent(params: any) {
    return {
      externalId: 'pi_mock_' + Date.now(),
      clientSecret: 'pi_mock_secret_' + Date.now(),
      publishableKey: 'pk_test_mock',
    };
  }

  private getMockCheckoutSession(params: any) {
    return {
      externalId: 'cs_mock_' + Date.now(),
      checkoutUrl: 'https://checkout.stripe.com/mock',
    };
  }
}
