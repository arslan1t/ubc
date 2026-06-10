import { Module } from '@nestjs/common';
import { OpenRunsService } from './open-runs.service';
import { OpenRunsController } from './open-runs.controller';

@Module({
  providers: [OpenRunsService],
  controllers: [OpenRunsController],
})
export class OpenRunsModule {}
