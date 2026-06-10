import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CourtsModule } from './courts/courts.module';
import { OpenRunsModule } from './open-runs/open-runs.module';
import { NewsModule } from './news/news.module';
import { MediaModule } from './media/media.module';
import { StorageModule } from './storage/storage.module';
import { CommunityModule } from './community/community.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    StorageModule,
    AuthModule,
    UsersModule,
    CourtsModule,
    OpenRunsModule,
    NewsModule,
    MediaModule,
    CommunityModule,
  ],
})
export class AppModule {}
