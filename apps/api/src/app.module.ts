import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CourtsModule } from './courts/courts.module';
import { OpenRunsModule } from './open-runs/open-runs.module';
import { NewsModule } from './news/news.module';
import { MediaModule } from './media/media.module';
import { StorageModule } from './storage/storage.module';
import { CommunityModule } from './community/community.module';
import { ModerationModule } from './moderation/moderation.module';
import { EventsModule } from './events/events.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { TelegramBotModule } from './telegram-bot/telegram-bot.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    StorageModule,
    TelegramBotModule,
    AuthModule,
    UsersModule,
    CourtsModule,
    OpenRunsModule,
    NewsModule,
    MediaModule,
    CommunityModule,
    ModerationModule,
    EventsModule,
    NotificationsModule,
    AuditLogsModule,
    AnalyticsModule,
  ],
  providers: [
    // Without this the ThrottlerModule config above is a no-op.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
