import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ParticipantStatus, UserRole } from '@prisma/client';
import { OpenRunsService } from './open-runs.service';
import { CreateOpenRunDto, OpenRunFiltersDto } from './dto/open-run.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('open-runs')
@Controller('open-runs')
export class OpenRunsController {
  constructor(private openRunsService: OpenRunsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Список Open Runs' })
  findAll(@Query() filters: OpenRunFiltersDto) {
    return this.openRunsService.findAll(filters);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Get('admin/all')
  @ApiOperation({ summary: 'Все игры, включая закрытые/отменённые (admin/moderator)' })
  findAllAdmin(@Query() filters: OpenRunFiltersDto) {
    return this.openRunsService.adminFindAll(filters);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Patch(':id/admin-cancel')
  @ApiOperation({ summary: 'Отменить игру (admin/moderator)' })
  adminCancel(@Param('id') id: string) {
    return this.openRunsService.adminCancel(id);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Open Run по ID' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId?: string) {
    return this.openRunsService.findOne(id, userId);
  }

  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Создать Open Run' })
  create(@Body() dto: CreateOpenRunDto, @CurrentUser('id') userId: string) {
    return this.openRunsService.create(dto, userId);
  }

  @ApiBearerAuth()
  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Отменить Open Run' })
  cancel(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.openRunsService.cancel(id, userId);
  }

  @ApiBearerAuth()
  @Patch(':id/close')
  @ApiOperation({ summary: 'Закрыть регистрацию' })
  closeRegistration(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.openRunsService.closeRegistration(id, userId);
  }

  @ApiBearerAuth()
  @Post(':id/join')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Записаться' })
  join(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.openRunsService.join(id, userId);
  }

  @ApiBearerAuth()
  @Delete(':id/leave')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Отменить участие' })
  leave(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.openRunsService.leave(id, userId);
  }

  @ApiBearerAuth()
  @Patch(':id/participants/:participantId/approve')
  @ApiOperation({ summary: 'Одобрить заявку' })
  approve(
    @Param('id') runId: string,
    @Param('participantId') participantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.openRunsService.updateParticipantStatus(
      runId,
      participantId,
      ParticipantStatus.APPROVED,
      userId,
    );
  }

  @ApiBearerAuth()
  @Patch(':id/participants/:participantId/reject')
  @ApiOperation({ summary: 'Отклонить заявку' })
  reject(
    @Param('id') runId: string,
    @Param('participantId') participantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.openRunsService.updateParticipantStatus(
      runId,
      participantId,
      ParticipantStatus.REJECTED,
      userId,
    );
  }
}
