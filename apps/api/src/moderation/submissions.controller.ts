import { BadRequestException, Controller, Get, Post, Body, Req } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ModerationService } from './moderation.service';
import { CreateSubmissionDto } from './dto/submission.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { StorageService } from '../storage/storage.service';

@ApiTags('submissions')
@ApiBearerAuth()
@Controller('submissions')
export class SubmissionsController {
  constructor(
    private moderation: ModerationService,
    private storage: StorageService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Предложить контент (корт, новость, фото, репорт)' })
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSubmissionDto,
  ) {
    return this.moderation.create(userId, dto);
  }

  @Post('upload-image')
  @ApiOperation({ summary: 'Загрузить фото для заявки (до её создания)' })
  async uploadImage(@CurrentUser('id') userId: string, @Req() req: FastifyRequest) {
    const file = await req.file();
    if (!file) throw new BadRequestException('Файл не найден в запросе');
    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('Допускаются только изображения');
    }
    const buffer = await file.toBuffer();
    const result = await this.storage.uploadImage(buffer, `submissions/${userId}`, file.mimetype);
    return {
      url: result.url,
      mediumUrl: result.mediumUrl,
      thumbnailUrl: result.thumbnailUrl,
      key: result.key,
    };
  }

  @Get('mine')
  @ApiOperation({ summary: 'Мои заявки и их статусы' })
  mine(@CurrentUser('id') userId: string) {
    return this.moderation.mySubmissions(userId);
  }
}
