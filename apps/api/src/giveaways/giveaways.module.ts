import { Module } from '@nestjs/common';
import { GiveawaysService } from './giveaways.service';
import { GiveawaysController } from './giveaways.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  providers: [GiveawaysService],
  controllers: [GiveawaysController],
})
export class GiveawaysModule {}
