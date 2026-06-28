import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { MediaService } from './media.service';
import { CreateMediaDto, MediaFiltersDto } from './dto/media.dto';
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
  @Post(':id/publish')
  @ApiOperation({ summary: 'Опубликовать' })
  publish(@Param('id') id: string) {
    return this.mediaService.publish(id);
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
