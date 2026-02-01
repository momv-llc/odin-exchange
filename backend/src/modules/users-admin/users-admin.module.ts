import { Module } from '@nestjs/common';
import { UsersAdminService } from './services/users-admin.service';
import { UsersAdminController } from './presentation/controllers/users-admin.controller';

@Module({
  controllers: [UsersAdminController],
  providers: [UsersAdminService],
  exports: [UsersAdminService],
})
export class UsersAdminModule {}
