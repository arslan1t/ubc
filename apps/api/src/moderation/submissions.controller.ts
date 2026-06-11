import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ModerationService } from './moderation.service';
import { CreateSubmissionDto } from './dto/submission.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('submissions')
@ApiBearerAuth()
@Controller('submissions')
export class SubmissionsController {
  constructor(private moderation: ModerationService) {}

  @Post()
  @ApiOperation({ summary: 'Предложить контент (корт, новость, фото, репорт)' })
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSubmissionDto,
  ) {
    return this.moderation.create(userId, dto);
  }

  @Get('mine')
  @ApiOperation({ summary: 'Мои заявки и их статусы' })
  mine(@CurrentUser('id') userId: string) {
    return this.moderation.mySubmissions(userId);
  }
}
