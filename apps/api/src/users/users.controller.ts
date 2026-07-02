import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  BadRequestException,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { UsersService } from './users.service';
import { UpdateUserDto, SetRoleDto, SetActiveDto } from './dto/update-user.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Мой профиль' })
  getMe(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Обновить профиль' })
  updateMe(@CurrentUser('id') userId: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Post('me/avatar')
  @ApiOperation({ summary: 'Загрузить фото профиля' })
  async uploadAvatar(@CurrentUser('id') userId: string, @Req() req: FastifyRequest) {
    const file = await req.file();
    if (!file) throw new BadRequestException('Файл не найден в запросе');
    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('Допускаются только изображения');
    }
    const buffer = await file.toBuffer();
    return this.usersService.uploadAvatar(userId, buffer, file.mimetype);
  }

  @Public()
  @Get(':id/public')
  @ApiOperation({ summary: 'Публичный профиль игрока' })
  getPublicProfile(@Param('id') id: string) {
    return this.usersService.getPublicProfile(id);
  }

  @Get('me/open-runs')
  @ApiOperation({ summary: 'Мои Open Runs' })
  getMyOpenRuns(@CurrentUser('id') userId: string) {
    return this.usersService.getMyOpenRuns(userId);
  }

  @Get('me/participations')
  @ApiOperation({ summary: 'Мои участия' })
  getMyParticipations(@CurrentUser('id') userId: string) {
    return this.usersService.getMyParticipations(userId);
  }

  // ─── Admin: user management ───

  @Roles(UserRole.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Список пользователей (admin)' })
  listUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('role') role?: UserRole,
  ) {
    return this.usersService.listUsers({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      role,
    });
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/role')
  @ApiOperation({ summary: 'Изменить роль пользователя (admin/super admin)' })
  setRole(
    @Param('id') targetId: string,
    @Body() dto: SetRoleDto,
    @CurrentUser() actor: { id: string; role: UserRole },
  ) {
    return this.usersService.setRole(actor, targetId, dto.role);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/active')
  @ApiOperation({ summary: 'Заблокировать/разблокировать пользователя (admin/super admin)' })
  setActive(
    @Param('id') targetId: string,
    @Body() dto: SetActiveDto,
    @CurrentUser() actor: { id: string; role: UserRole },
  ) {
    return this.usersService.setActive(actor, targetId, dto.isActive);
  }
}
