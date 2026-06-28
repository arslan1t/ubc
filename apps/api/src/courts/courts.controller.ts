import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CourtsService } from './courts.service';
import { CreateCourtDto, UpdateCourtDto, CourtFiltersDto, CreateReviewDto } from './dto/court.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('courts')
@Controller('courts')
export class CourtsController {
  constructor(private courtsService: CourtsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Список кортов' })
  findAll(@Query() filters: CourtFiltersDto) {
    return this.courtsService.findAll(filters);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Get('admin/all')
  @ApiOperation({ summary: 'Все корты, включая неактивные (admin/moderator)' })
  findAllAdmin(@Query() filters: CourtFiltersDto) {
    return this.courtsService.adminFindAll(filters);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Get('reviews/admin')
  @ApiOperation({ summary: 'Все отзывы (admin/moderator)' })
  listReviewsAdmin(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.courtsService.listReviewsAdmin(
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Корт по slug' })
  findOne(@Param('slug') slug: string) {
    return this.courtsService.findOne(slug);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Post()
  @ApiOperation({ summary: 'Создать корт (admin)' })
  create(@Body() dto: CreateCourtDto, @CurrentUser('id') userId: string) {
    return this.courtsService.create(dto, userId);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Patch(':id')
  @ApiOperation({ summary: 'Обновить корт (admin/moderator)' })
  update(@Param('id') id: string, @Body() dto: UpdateCourtDto) {
    return this.courtsService.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить корт (admin)' })
  remove(@Param('id') id: string) {
    return this.courtsService.remove(id);
  }

  @ApiBearerAuth()
  @Post(':id/reviews')
  @ApiOperation({ summary: 'Оставить отзыв' })
  createReview(
    @Param('id') courtId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.courtsService.createReview(courtId, userId, dto);
  }

  @ApiBearerAuth()
  @Delete('reviews/:reviewId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить отзыв' })
  deleteReview(
    @Param('reviewId') reviewId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.courtsService.deleteReview(reviewId, userId);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Delete('reviews/:reviewId/admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить отзыв (admin/moderator)' })
  adminDeleteReview(@Param('reviewId') reviewId: string) {
    return this.courtsService.adminDeleteReview(reviewId);
  }
}
