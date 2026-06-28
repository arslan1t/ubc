import { Module } from '@nestjs/common';
import { OpenRunsService } from './open-runs.service';
import { OpenRunsController } from './open-runs.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  providers: [OpenRunsService],
  controllers: [OpenRunsController],
})
export class OpenRunsModule {}
