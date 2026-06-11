import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubmissionStatus, SubmissionType, UserRole } from '@prisma/client';
import { ModerationService } from './moderation.service';
import { ReviewSubmissionDto } from './dto/submission.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('moderation')
@ApiBearerAuth()
@Roles(UserRole.MODERATOR)
@Controller('moderation')
export class ModerationController {
  constructor(private moderation: ModerationService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Счётчики ожидающих заявок (moderator+)' })
  stats() {
    return this.moderation.stats();
  }

  @Get('submissions')
  @ApiOperation({ summary: 'Очередь модерации (moderator+)' })
  list(
    @Query('status') status?: SubmissionStatus,
    @Query('type') type?: SubmissionType,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.moderation.list({
      status,
      type,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post('submissions/:id/approve')
  @ApiOperation({ summary: 'Одобрить и опубликовать (moderator+)' })
  approve(@Param('id') id: string, @CurrentUser('id') reviewerId: string) {
    return this.moderation.approve(reviewerId, id);
  }

  @Post('submissions/:id/reject')
  @ApiOperation({ summary: 'Отклонить заявку (moderator+)' })
  reject(
    @Param('id') id: string,
    @CurrentUser('id') reviewerId: string,
    @Body() dto: ReviewSubmissionDto,
  ) {
    return this.moderation.reject(reviewerId, id, dto.note);
  }

  @Post('submissions/:id/request-changes')
  @ApiOperation({ summary: 'Запросить доработку (moderator+)' })
  requestChanges(
    @Param('id') id: string,
    @CurrentUser('id') reviewerId: string,
    @Body() dto: ReviewSubmissionDto,
  ) {
    return this.moderation.requestChanges(reviewerId, id, dto.note);
  }
}
