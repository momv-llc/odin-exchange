import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(@InjectQueue('emails') private queue: Queue) {}

  async send(to: string, subject: string, html: string) {
    await this.queue.add('send', { to, subject, html }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
    this.logger.debug(`Email queued: ${subject} -> ${to}`);
  }

  async sendOrderCreated(email: string, code: string) {
    await this.send(
      email,
      `Order ${code} Created`,
      `<h1>Order Created</h1>
       <p>Your order code: <strong>${code}</strong></p>
       <p>This order expires in 30 minutes.</p>
       <p>Please complete your payment to proceed.</p>`
    );
  }

  async sendOrderApproved(email: string, code: string) {
    await this.send(
      email,
      `Order ${code} Approved`,
      `<h1>Order Approved</h1>
       <p>Your order <strong>${code}</strong> has been approved.</p>
       <p>Please proceed with the payment instructions provided.</p>`
    );
  }

  async sendOrderCompleted(email: string, code: string) {
    await this.send(
      email,
      `Order ${code} Completed`,
      `<h1>Order Completed</h1>
       <p>Your order <strong>${code}</strong> has been completed successfully.</p>
       <p>Thank you for using ODIN Exchange!</p>`
    );
  }

  async sendOrderRejected(email: string, code: string, reason: string) {
    await this.send(
      email,
      `Order ${code} Rejected`,
      `<h1>Order Rejected</h1>
       <p>Unfortunately, your order <strong>${code}</strong> has been rejected.</p>
       <p>Reason: ${reason}</p>
       <p>Please contact support if you have questions.</p>`
    );
  }
}
