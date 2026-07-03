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
import { NewsService } from './news.service';
import { CreateNewsDto, UpdateNewsDto, NewsFiltersDto } from './dto/news.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(private newsService: NewsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Список статей (только опубликованные)' })
  findAll(@Query() filters: NewsFiltersDto) {
    return this.newsService.findAll(filters, true);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Get('admin/all')
  @ApiOperation({ summary: 'Все статьи включая черновики (admin/moderator)' })
  findAllAdmin(@Query() filters: NewsFiltersDto) {
    return this.newsService.findAll(filters, false);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Статья по slug' })
  findOne(@Param('slug') slug: string) {
    return this.newsService.findOne(slug);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Post()
  @ApiOperation({ summary: 'Создать статью (moderator+)' })
  create(@Body() dto: CreateNewsDto, @CurrentUser('id') userId: string) {
    return this.newsService.create(dto, userId);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Patch(':id')
  @ApiOperation({ summary: 'Обновить статью (moderator+)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateNewsDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.newsService.update(id, dto, userId, userRole);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить статью (moderator+)' })
  delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.newsService.delete(id, userId, userRole);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Post(':id/cover')
  @ApiOperation({ summary: 'Загрузить обложку/заглавное изображение статьи (moderator+, ?kind=banner)' })
  async uploadCover(
    @Param('id') id: string,
    @Req() req: FastifyRequest,
    @Query('kind') kind?: string,
  ) {
    const file = await req.file();
    if (!file) throw new BadRequestException('Файл не найден в запросе');
    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('Допускаются только изображения');
    }
    const buffer = await file.toBuffer();
    return this.newsService.uploadCover(
      id,
      buffer,
      file.mimetype,
      kind === 'banner' ? 'banner' : 'cover',
    );
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Post(':id/gallery')
  @ApiOperation({ summary: 'Добавить фото в галерею статьи (moderator+)' })
  async addGalleryImage(@Param('id') id: string, @Req() req: FastifyRequest) {
    const file = await req.file();
    if (!file) throw new BadRequestException('Файл не найден в запросе');
    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('Допускаются только изображения');
    }
    const buffer = await file.toBuffer();
    return this.newsService.addGalleryImage(id, buffer, file.mimetype);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Delete('gallery/:imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить фото из галереи (moderator+)' })
  deleteGalleryImage(@Param('imageId') imageId: string) {
    return this.newsService.deleteGalleryImage(imageId);
  }
}
