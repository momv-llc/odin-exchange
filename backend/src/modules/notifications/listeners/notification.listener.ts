import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from '../services/email.service';

@Injectable()
export class NotificationListener {
  constructor(private email: EmailService) {}

  @OnEvent('order.created')
  async onCreated(e: { orderId: string; code: string; email: string }) {
    await this.email.sendOrderCreated(e.email, e.code);
  }

  @OnEvent('order.approved')
  async onApproved(e: { orderId: string; code: string; email: string }) {
    await this.email.sendOrderApproved(e.email, e.code);
  }

  @OnEvent('order.completed')
  async onCompleted(e: { orderId: string; code: string; email: string }) {
    await this.email.sendOrderCompleted(e.email, e.code);
  }

  @OnEvent('order.rejected')
  async onRejected(e: { orderId: string; code: string; email: string; reason: string }) {
    await this.email.sendOrderRejected(e.email, e.code, e.reason);
  }
}
