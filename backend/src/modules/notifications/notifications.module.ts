import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EmailService } from './services/email.service';
import { NotificationListener } from './listeners/notification.listener';

@Module({
  imports: [BullModule.registerQueue({ name: 'emails' })],
  providers: [EmailService, NotificationListener],
  exports: [EmailService],
})
export class NotificationsModule {}
