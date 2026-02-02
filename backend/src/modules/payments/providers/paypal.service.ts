import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PayPalService {
  private readonly logger = new Logger(PayPalService.name);
  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    const sandbox = this.configService.get<string>('PAYPAL_SANDBOX') !== 'false';
    this.baseUrl = sandbox
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';
    this.clientId = this.configService.get<string>('PAYPAL_CLIENT_ID') || '';
    this.clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET') || '';
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.clientId || !this.clientSecret) {
      return 'mock_token';
    }

    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/v1/oauth2/token`,
          'grant_type=client_credentials',
          {
            headers: {
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
      return this.accessToken!;
    } catch (error) {
      this.logger.error('Failed to get PayPal access token:', error);
      throw error;
    }
  }

  async createOrder(params: {
    amount: number;
    currency: string;
    paymentId: string;
    returnUrl?: string;
    cancelUrl?: string;
  }) {
    if (!this.clientId) {
      return this.getMockOrder(params);
    }

    try {
      const token = await this.getAccessToken();
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/v2/checkout/orders`,
          {
            intent: 'CAPTURE',
            purchase_units: [
              {
                amount: {
                  currency_code: params.currency.toUpperCase(),
                  value: params.amount.toFixed(2),
                },
                reference_id: params.paymentId,
              },
            ],
            application_context: {
              return_url: params.returnUrl || 'https://example.com/success',
              cancel_url: params.cancelUrl || 'https://example.com/cancel',
              brand_name: 'ODIN Exchange',
              user_action: 'PAY_NOW',
            },
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const approveLink = response.data.links.find(
        (link: any) => link.rel === 'approve',
      );

      return {
        externalId: response.data.id,
        checkoutUrl: approveLink?.href,
        status: response.data.status,
      };
    } catch (error) {
      this.logger.error('PayPal createOrder error:', error);
      throw error;
    }
  }

  async captureOrder(orderId: string) {
    const token = await this.getAccessToken();
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error('PayPal captureOrder error:', error);
      throw error;
    }
  }

  async handleWebhook(payload: any) {
    const eventType = payload.event_type;
    this.logger.log(`PayPal webhook: ${eventType}`);

    switch (eventType) {
      case 'CHECKOUT.ORDER.APPROVED':
        const orderId = payload.resource.id;
        const captured = await this.captureOrder(orderId);
        return {
          type: 'payment_completed',
          externalId: orderId,
          paymentId: payload.resource.purchase_units?.[0]?.reference_id,
          captureData: captured,
        };

      case 'PAYMENT.CAPTURE.COMPLETED':
        return {
          type: 'capture_completed',
          externalId: payload.resource.id,
        };

      case 'PAYMENT.CAPTURE.DENIED':
        return {
          type: 'payment_failed',
          externalId: payload.resource.id,
          error: 'Payment capture denied',
        };

      default:
        this.logger.log(`Unhandled PayPal event: ${eventType}`);
    }

    return { received: true };
  }

  async refund(captureId: string, amount: number, currency: string) {
    if (!this.clientId) {
      return { id: 'mock_paypal_refund_' + Date.now() };
    }

    const token = await this.getAccessToken();
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/v2/payments/captures/${captureId}/refund`,
          {
            amount: {
              value: amount.toFixed(2),
              currency_code: currency.toUpperCase(),
            },
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error('PayPal refund error:', error);
      throw error;
    }
  }

  private getMockOrder(params: any) {
    return {
      externalId: 'PAYPAL_MOCK_' + Date.now(),
      checkoutUrl: 'https://www.sandbox.paypal.com/checkoutnow?token=mock',
      status: 'CREATED',
    };
  }
}
