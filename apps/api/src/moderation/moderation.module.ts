import { Module } from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { ModerationController } from './moderation.controller';
import { SubmissionsController } from './submissions.controller';

@Module({
  providers: [ModerationService],
  controllers: [ModerationController, SubmissionsController],
})
export class ModerationModule {}
