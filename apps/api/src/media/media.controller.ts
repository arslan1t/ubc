import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { MediaService } from './media.service';
import { CreateMediaDto, UpdateMediaDto, MediaFiltersDto } from './dto/media.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Список медиа' })
  findAll(@Query() filters: MediaFiltersDto) {
    return this.mediaService.findAll(filters, true);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Get('admin/all')
  @ApiOperation({ summary: 'Все медиа, включая черновики (admin/moderator)' })
  findAllAdmin(@Query() filters: MediaFiltersDto) {
    return this.mediaService.findAll(filters, false);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Медиа по ID' })
  findOne(@Param('id') id: string) {
    return this.mediaService.findOne(id);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Post()
  @ApiOperation({ summary: 'Создать медиа (moderator+)' })
  create(@Body() dto: CreateMediaDto, @CurrentUser('id') userId: string) {
    return this.mediaService.create(dto, userId);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Patch(':id')
  @ApiOperation({ summary: 'Обновить медиа (moderator+)' })
  update(@Param('id') id: string, @Body() dto: UpdateMediaDto) {
    return this.mediaService.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Post(':id/photo')
  @ApiOperation({ summary: 'Загрузить фото (для типа PHOTO)' })
  async uploadPhoto(@Param('id') id: string, @Req() req: FastifyRequest) {
    const file = await req.file();
    if (!file) throw new BadRequestException('Файл не найден в запросе');
    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('Допускаются только изображения');
    }
    const buffer = await file.toBuffer();
    return this.mediaService.uploadPhoto(id, buffer, file.mimetype);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Post(':id/publish')
  @ApiOperation({ summary: 'Опубликовать' })
  publish(@Param('id') id: string) {
    return this.mediaService.publish(id);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Post(':id/unpublish')
  @ApiOperation({ summary: 'Снять с публикации' })
  unpublish(@Param('id') id: string) {
    return this.mediaService.unpublish(id);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить медиа' })
  delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.mediaService.delete(id, userId, userRole);
  }
}
