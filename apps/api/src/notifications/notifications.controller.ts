import { Controller, Get, Post, Patch, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { NotificationsService } from './notifications.service';
import { BroadcastNotificationDto } from './dto/notification.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Мои уведомления' })
  listMine(@CurrentUser('id') userId: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.notificationsService.listMine(
      userId,
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Отметить как прочитанное' })
  markRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.notificationsService.markRead(userId, id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Отметить все как прочитанные' })
  markAllRead(@CurrentUser('id') userId: string) {
    return this.notificationsService.markAllRead(userId);
  }

  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Post('broadcast')
  @ApiOperation({ summary: 'Отправить объявление всем пользователям (admin/moderator)' })
  broadcast(@Body() dto: BroadcastNotificationDto) {
    return this.notificationsService.broadcast(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Get('admin/all')
  @ApiOperation({ summary: 'Все уведомления (admin/moderator)' })
  adminListAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.notificationsService.adminListAll(
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
  }
}
