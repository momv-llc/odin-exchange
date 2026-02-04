import { Global, Module } from '@nestjs/common';
import { AuditLogService } from './services/audit-log.service';
import { AdminAuditController } from './presentation/controllers/admin-audit.controller';

@Global()
@Module({
  controllers: [AdminAuditController],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditModule {}
