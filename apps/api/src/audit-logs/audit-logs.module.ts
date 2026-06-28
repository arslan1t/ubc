import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLogInterceptor } from './audit-log.interceptor';

@Module({
  providers: [
    AuditLogsService,
    { provide: APP_INTERCEPTOR, useClass: AuditLogInterceptor },
  ],
  controllers: [AuditLogsController],
})
export class AuditLogsModule {}
