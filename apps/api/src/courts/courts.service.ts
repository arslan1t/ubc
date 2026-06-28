import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateCourtDto, UpdateCourtDto, CourtFiltersDto, CreateReviewDto } from './dto/court.dto';
import slugify from 'slug';

const COURT_INCLUDE = {
  images: {
    orderBy: [{ isPrimary: 'desc' as const }, { order: 'asc' as const }],
  },
};

@Injectable()
export class CourtsService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async findAll(filters: CourtFiltersDto) {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(50, filters.limit ?? 20);
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };
    if (filters.type) where.type = filters.type;
    if (filters.isFree !== undefined) where.isFree = filters.isFree;
    if (filters.hasLighting !== undefined) where.hasLighting = filters.hasLighting;
    if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' };
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { address: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [courts, total] = await Promise.all([
      this.prisma.court.findMany({
        where,
        include: COURT_INCLUDE,
        skip,
        take: limit,
        orderBy: { reviewCount: 'desc' },
      }),
      this.prisma.court.count({ where }),
    ]);

    return {
      data: courts.map(this.formatCourt),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(slug: string) {
    const court = await this.prisma.court.findUnique({
      where: { slug },
      include: {
        ...COURT_INCLUDE,
        reviews: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!court) throw new NotFoundException('Корт не найден');
    return this.formatCourt(court);
  }

  async create(dto: CreateCourtDto, adminId: string) {
    const baseSlug = slugify(dto.name, { locale: 'ru' });
    let slug = baseSlug;
    let i = 1;
    while (await this.prisma.court.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${i++}`;
    }

    const court = await this.prisma.court.create({
      data: { ...dto, slug },
      include: COURT_INCLUDE,
    });
    return this.formatCourt(court);
  }

  async addImage(courtId: string, buffer: Buffer) {
    const court = await this.prisma.court.findUnique({ where: { id: courtId } });
    if (!court) throw new NotFoundException('Корт не найден');

    const result = await this.storage.uploadImage(buffer, `courts/${courtId}`);

    const imageCount = await this.prisma.courtImage.count({ where: { courtId } });
    const isPrimary = imageCount === 0;

    return this.prisma.courtImage.create({
      data: {
        courtId,
        url: result.url,
        mediumUrl: result.mediumUrl,
        thumbnailUrl: result.thumbnailUrl,
        storageKey: result.key,
        isPrimary,
        order: imageCount,
      },
    });
  }

  async deleteImage(imageId: string, courtId: string) {
    const image = await this.prisma.courtImage.findFirst({
      where: { id: imageId, courtId },
    });
    if (!image) throw new NotFoundException('Изображение не найдено');

    await this.storage.deleteMany([
      image.storageKey,
      image.storageKey.replace('original', 'medium'),
      image.storageKey.replace('original', 'thumbnail'),
    ]);

    await this.prisma.courtImage.delete({ where: { id: imageId } });

    if (image.isPrimary) {
      const next = await this.prisma.courtImage.findFirst({
        where: { courtId },
        orderBy: { order: 'asc' },
      });
      if (next) {
        await this.prisma.courtImage.update({
          where: { id: next.id },
          data: { isPrimary: true },
        });
      }
    }
  }

  async createReview(courtId: string, userId: string, dto: CreateReviewDto) {
    const court = await this.prisma.court.findUnique({ where: { id: courtId } });
    if (!court) throw new NotFoundException('Корт не найден');

    const existing = await this.prisma.review.findUnique({
      where: { courtId_userId: { courtId, userId } },
    });
    if (existing) throw new ConflictException('Вы уже оставили отзыв об этом корте');

    const review = await this.prisma.review.create({
      data: { courtId, userId, rating: dto.rating, comment: dto.comment },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });

    await this.prisma.court.update({
      where: { id: courtId },
      data: {
        ratingSum: { increment: dto.rating },
        reviewCount: { increment: 1 },
      },
    });

    return review;
  }

  async deleteReview(reviewId: string, userId: string) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Отзыв не найден');
    if (review.userId !== userId) throw new ForbiddenException();

    await this.removeReview(review);
  }

  async adminDeleteReview(reviewId: string) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Отзыв не найден');
    await this.removeReview(review);
  }

  private async removeReview(review: { id: string; courtId: string; rating: number }) {
    await this.prisma.$transaction([
      this.prisma.review.delete({ where: { id: review.id } }),
      this.prisma.court.update({
        where: { id: review.courtId },
        data: {
          ratingSum: { decrement: review.rating },
          reviewCount: { decrement: 1 },
        },
      }),
    ]);
  }

  async listReviewsAdmin(page = 1, limit = 30) {
    const skip = (Math.max(1, page) - 1) * limit;
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          court: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.review.count(),
    ]);
    return { data: reviews, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async adminFindAll(filters: CourtFiltersDto) {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(50, filters.limit ?? 20);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { address: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [courts, total] = await Promise.all([
      this.prisma.court.findMany({
        where,
        include: COURT_INCLUDE,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.court.count({ where }),
    ]);

    return {
      data: courts.map(this.formatCourt),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, dto: UpdateCourtDto) {
    const court = await this.prisma.court.findUnique({ where: { id } });
    if (!court) throw new NotFoundException('Корт не найден');

    const updated = await this.prisma.court.update({
      where: { id },
      data: dto,
      include: COURT_INCLUDE,
    });
    return this.formatCourt(updated);
  }

  async remove(id: string) {
    const court = await this.prisma.court.findUnique({ where: { id } });
    if (!court) throw new NotFoundException('Корт не найден');
    await this.prisma.court.delete({ where: { id } });
  }

  private formatCourt(court: any) {
    const rating =
      court.reviewCount > 0
        ? Math.round((court.ratingSum / court.reviewCount) * 10) / 10
        : 0;
    return { ...court, rating };
  }
}
