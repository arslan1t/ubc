import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { EventsService } from './events.service';
import {
  CreateEventDto,
  UpdateEventDto,
  RegisterEventDto,
  ReviewRegistrationDto,
  UpdateMatchDto,
} from './dto/event.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Список событий/турниров' })
  findAll() {
    return this.eventsService.findAll();
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Турнир по slug' })
  findOne(@Param('slug') slug: string) {
    return this.eventsService.findOne(slug);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Создать турнир (admin)' })
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Обновить турнир (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить турнир (admin)' })
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Post(':id/cover')
  @ApiOperation({ summary: 'Загрузить обложку турнира (admin)' })
  async uploadCover(@Param('id') id: string, @Req() req: FastifyRequest) {
    const file = await req.file();
    if (!file) throw new BadRequestException('Файл не найден в запросе');
    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('Допускаются только изображения');
    }
    const buffer = await file.toBuffer();
    return this.eventsService.uploadCover(id, buffer, file.mimetype);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Post(':id/gallery')
  @ApiOperation({ summary: 'Добавить фото в галерею турнира (admin)' })
  async addGalleryImage(@Param('id') id: string, @Req() req: FastifyRequest) {
    const file = await req.file();
    if (!file) throw new BadRequestException('Файл не найден в запросе');
    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('Допускаются только изображения');
    }
    const buffer = await file.toBuffer();
    return this.eventsService.addGalleryImage(id, buffer, file.mimetype);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Delete('gallery/:imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить фото из галереи турнира (admin)' })
  deleteGalleryImage(@Param('imageId') imageId: string) {
    return this.eventsService.deleteGalleryImage(imageId);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Get(':id/registrations')
  @ApiOperation({ summary: 'Список регистраций (admin)' })
  registrations(@Param('id') id: string) {
    return this.eventsService.registrations(id);
  }

  @ApiBearerAuth()
  @Post(':id/register')
  @ApiOperation({ summary: 'Подать заявку на участие (анкета + хайлайт/Instagram)' })
  register(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: RegisterEventDto,
  ) {
    return this.eventsService.register(id, userId, dto);
  }

  @ApiBearerAuth()
  @Get(':id/my-registration')
  @ApiOperation({ summary: 'Моя заявка на турнир (статус анкеты)' })
  myRegistration(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.eventsService.myRegistration(id, userId);
  }

  @ApiBearerAuth()
  @Delete(':id/register')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Отменить заявку/регистрацию' })
  unregister(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.eventsService.unregister(id, userId);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Patch(':id/registrations/:regId')
  @ApiOperation({ summary: 'Одобрить/отклонить заявку участника (admin)' })
  reviewRegistration(
    @Param('id') id: string,
    @Param('regId') regId: string,
    @Body() dto: ReviewRegistrationDto,
  ) {
    return this.eventsService.reviewRegistration(id, regId, dto.status, dto.note);
  }

  // ─── Bracket ───

  @Public()
  @Get(':id/bracket')
  @ApiOperation({ summary: 'Турнирная сетка (public)' })
  getBracket(@Param('id') id: string) {
    return this.eventsService.getBracket(id);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Post(':id/bracket/generate')
  @ApiOperation({ summary: 'Сгенерировать сетку из одобренных участников (admin)' })
  generateBracket(@Param('id') id: string) {
    return this.eventsService.generateBracket(id);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Delete(':id/bracket')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Сбросить сетку (admin)' })
  resetBracket(@Param('id') id: string) {
    return this.eventsService.resetBracket(id);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Patch(':id/matches/:matchId')
  @ApiOperation({ summary: 'Обновить матч: счёт/статус/победитель (admin)' })
  updateMatch(
    @Param('id') id: string,
    @Param('matchId') matchId: string,
    @Body() dto: UpdateMatchDto,
  ) {
    return this.eventsService.updateMatch(id, matchId, dto);
  }
}
