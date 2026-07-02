import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { UserRole, MediaType } from '@prisma/client';
import { CreateMediaDto, UpdateMediaDto, MediaFiltersDto } from './dto/media.dto';

const MEDIA_INCLUDE = {
  author: { select: { id: true, firstName: true, lastName: true } },
};

@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async findAll(filters: MediaFiltersDto, onlyPublished = true) {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(50, filters.limit ?? 20);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (onlyPublished) where.isPublished = true;
    if (filters.type) where.type = filters.type;
    if (filters.search) {
      where.title = { contains: filters.search, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        include: MEDIA_INCLUDE,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
      }),
      this.prisma.media.count({ where }),
    ]);

    return {
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.media.findUnique({
      where: { id },
      include: MEDIA_INCLUDE,
    });
    if (!item) throw new NotFoundException('Медиа не найдено');

    await this.prisma.media.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return item;
  }

  async create(dto: CreateMediaDto, authorId: string) {
    let youtubeThumbnail: string | null = null;
    if (dto.youtubeUrl) {
      const videoId = this.extractYoutubeId(dto.youtubeUrl);
      if (videoId) {
        youtubeThumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }

    return this.prisma.media.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        youtubeUrl: dto.youtubeUrl,
        youtubeThumbnail,
        authorId,
        isPublished: dto.isPublished ?? false,
        publishedAt: dto.isPublished ? new Date() : null,
      },
      include: MEDIA_INCLUDE,
    });
  }

  async uploadPhoto(id: string, buffer: Buffer, mimeType?: string) {
    const item = await this.prisma.media.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Медиа не найдено');
    if (item.type !== MediaType.PHOTO) {
      throw new ForbiddenException('Загрузка фото доступна только для типа PHOTO');
    }

    if (item.photoStorageKey) {
      await this.storage.deleteMany([
        item.photoStorageKey,
        item.photoStorageKey.replace('original', 'medium'),
        item.photoStorageKey.replace('original', 'thumbnail'),
      ]);
    }

    const result = await this.storage.uploadImage(buffer, `media/${id}`, mimeType);
    return this.prisma.media.update({
      where: { id },
      data: {
        photoUrl: result.url,
        photoMediumUrl: result.mediumUrl,
        photoThumbnailUrl: result.thumbnailUrl,
        photoStorageKey: result.key,
      },
      include: MEDIA_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateMediaDto) {
    const item = await this.prisma.media.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Медиа не найдено');

    let youtubeThumbnail = item.youtubeThumbnail;
    if (dto.youtubeUrl && dto.youtubeUrl !== item.youtubeUrl) {
      const videoId = this.extractYoutubeId(dto.youtubeUrl);
      youtubeThumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
    }

    const publishedAt =
      dto.isPublished && !item.isPublished ? new Date() : item.publishedAt;

    return this.prisma.media.update({
      where: { id },
      data: { ...dto, youtubeThumbnail, publishedAt },
      include: MEDIA_INCLUDE,
    });
  }

  async publish(id: string) {
    return this.prisma.media.update({
      where: { id },
      data: { isPublished: true, publishedAt: new Date() },
      include: MEDIA_INCLUDE,
    });
  }

  async unpublish(id: string) {
    return this.prisma.media.update({
      where: { id },
      data: { isPublished: false },
      include: MEDIA_INCLUDE,
    });
  }

  async delete(id: string, userId: string, userRole: UserRole) {
    const item = await this.prisma.media.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Медиа не найдено');

    const canDelete =
      item.authorId === userId ||
      userRole === UserRole.ADMIN ||
      userRole === UserRole.MODERATOR;
    if (!canDelete) throw new ForbiddenException();

    if (item.photoStorageKey) {
      await this.storage.deleteMany([
        item.photoStorageKey,
        item.photoStorageKey.replace('original', 'medium'),
        item.photoStorageKey.replace('original', 'thumbnail'),
      ]);
    }

    await this.prisma.media.delete({ where: { id } });
  }

  private extractYoutubeId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }
}
