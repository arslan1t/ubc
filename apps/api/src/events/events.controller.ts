import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
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
  @Get(':id/registrations')
  @ApiOperation({ summary: 'Список регистраций (admin)' })
  registrations(@Param('id') id: string) {
    return this.eventsService.registrations(id);
  }

  @ApiBearerAuth()
  @Post(':id/register')
  @ApiOperation({ summary: 'Зарегистрироваться на турнир' })
  register(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.eventsService.register(id, userId);
  }

  @ApiBearerAuth()
  @Delete(':id/register')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Отменить регистрацию' })
  unregister(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.eventsService.unregister(id, userId);
  }
}
