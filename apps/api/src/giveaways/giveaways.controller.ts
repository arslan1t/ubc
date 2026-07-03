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
import { GiveawaysService } from './giveaways.service';
import { CreateGiveawayDto, UpdateGiveawayDto, EnterGiveawayDto, ReviewEntryDto } from './dto/giveaway.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('giveaways')
@Controller('giveaways')
export class GiveawaysController {
  constructor(private giveawaysService: GiveawaysService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Список розыгрышей' })
  findAll() {
    return this.giveawaysService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Розыгрыш: детали + пул одобренных участников' })
  findOne(@Param('id') id: string) {
    return this.giveawaysService.findOne(id);
  }

  @ApiBearerAuth()
  @Post(':id/enter')
  @ApiOperation({ summary: 'Подать заявку на участие' })
  enter(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: EnterGiveawayDto,
  ) {
    return this.giveawaysService.enter(id, userId, dto.comment);
  }

  @ApiBearerAuth()
  @Get(':id/my-entry')
  @ApiOperation({ summary: 'Моя заявка на розыгрыш' })
  myEntry(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.giveawaysService.myEntry(id, userId);
  }

  @ApiBearerAuth()
  @Delete(':id/enter')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Отозвать заявку' })
  leave(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.giveawaysService.leave(id, userId);
  }

  // ─── Admin ───

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Создать розыгрыш (admin)' })
  create(@Body() dto: CreateGiveawayDto) {
    return this.giveawaysService.create(dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Обновить розыгрыш (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateGiveawayDto) {
    return this.giveawaysService.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить розыгрыш (admin)' })
  remove(@Param('id') id: string) {
    return this.giveawaysService.remove(id);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Post(':id/cover')
  @ApiOperation({ summary: 'Загрузить обложку розыгрыша (admin)' })
  async uploadCover(@Param('id') id: string, @Req() req: FastifyRequest) {
    const file = await req.file();
    if (!file) throw new BadRequestException('Файл не найден в запросе');
    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('Допускаются только изображения');
    }
    const buffer = await file.toBuffer();
    return this.giveawaysService.uploadCover(id, buffer, file.mimetype);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Get(':id/entries')
  @ApiOperation({ summary: 'Все заявки на розыгрыш (admin)' })
  entries(@Param('id') id: string) {
    return this.giveawaysService.entries(id);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Patch(':id/entries/:entryId')
  @ApiOperation({ summary: 'Одобрить/отклонить заявку (admin)' })
  reviewEntry(
    @Param('id') id: string,
    @Param('entryId') entryId: string,
    @Body() dto: ReviewEntryDto,
  ) {
    return this.giveawaysService.reviewEntry(id, entryId, dto.status, dto.note);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Delete(':id/entries/:entryId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить заявку участника (admin)' })
  deleteEntry(@Param('id') id: string, @Param('entryId') entryId: string) {
    return this.giveawaysService.deleteEntry(id, entryId);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Post(':id/draw')
  @ApiOperation({ summary: 'Крутануть колесо: случайный победитель из пула (admin)' })
  draw(@Param('id') id: string) {
    return this.giveawaysService.draw(id);
  }
}
