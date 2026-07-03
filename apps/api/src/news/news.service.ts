import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { UserRole } from '@prisma/client';
import slugify from 'slug';
import { CreateNewsDto, UpdateNewsDto, NewsFiltersDto } from './dto/news.dto';

const NEWS_INCLUDE = {
  author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
  gallery: { orderBy: { order: 'asc' as const } },
};

@Injectable()
export class NewsService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async findAll(filters: NewsFiltersDto, onlyPublished = true) {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(50, filters.limit ?? 12);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (onlyPublished) where.isPublished = true;
    if (filters.category) where.category = filters.category;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { excerpt: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [articles, total] = await Promise.all([
      this.prisma.news.findMany({
        where,
        include: NEWS_INCLUDE,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
      }),
      this.prisma.news.count({ where }),
    ]);

    return {
      data: articles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(slug: string) {
    const article = await this.prisma.news.findUnique({
      where: { slug },
      include: NEWS_INCLUDE,
    });
    if (!article) throw new NotFoundException('Статья не найдена');

    await this.prisma.news.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });

    return article;
  }

  async create(dto: CreateNewsDto, authorId: string) {
    const baseSlug = slugify(dto.title, { locale: 'ru' });
    let slug = baseSlug;
    let i = 1;
    while (await this.prisma.news.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${i++}`;
    }

    return this.prisma.news.create({
      data: {
        title: dto.title,
        slug,
        excerpt: dto.excerpt,
        content: dto.content,
        category: dto.category,
        authorId,
        isPublished: dto.isPublished ?? false,
        publishedAt: dto.isPublished ? new Date() : null,
      },
      include: NEWS_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateNewsDto, userId: string, userRole: UserRole) {
    const article = await this.prisma.news.findUnique({ where: { id } });
    if (!article) throw new NotFoundException('Статья не найдена');

    const canEdit = article.authorId === userId ||
      userRole === UserRole.ADMIN ||
      userRole === UserRole.MODERATOR;
    if (!canEdit) throw new ForbiddenException();

    const publishedAt =
      dto.isPublished && !article.isPublished ? new Date() : article.publishedAt;

    return this.prisma.news.update({
      where: { id },
      data: { ...dto, publishedAt },
      include: NEWS_INCLUDE,
    });
  }

  async delete(id: string, userId: string, userRole: UserRole) {
    const article = await this.prisma.news.findUnique({
      where: { id },
      include: { gallery: true },
    });
    if (!article) throw new NotFoundException('Статья не найдена');

    const canDelete =
      article.authorId === userId ||
      userRole === UserRole.ADMIN ||
      userRole === UserRole.MODERATOR;
    if (!canDelete) throw new ForbiddenException();

    const keysToDelete = [
      ...(article.coverKey ? [article.coverKey] : []),
      ...article.gallery.flatMap((img) => [
        img.storageKey,
        img.storageKey.replace('original', 'medium'),
        img.storageKey.replace('original', 'thumbnail'),
      ]),
    ];

    await this.storage.deleteMany(keysToDelete);
    await this.prisma.news.delete({ where: { id } });
  }

  async uploadCover(
    id: string,
    buffer: Buffer,
    mimeType?: string,
    kind: 'cover' | 'banner' = 'cover',
  ) {
    const article = await this.prisma.news.findUnique({ where: { id } });
    if (!article) throw new NotFoundException('Статья не найдена');

    if (kind === 'cover' && article.coverKey) await this.storage.deleteFile(article.coverKey);

    const result = await this.storage.uploadImage(buffer, `news/${id}/${kind}`, mimeType);
    return this.prisma.news.update({
      where: { id },
      data:
        kind === 'banner'
          ? { bannerUrl: result.url }
          : { coverUrl: result.url, coverKey: result.key },
    });
  }

  async addGalleryImage(id: string, buffer: Buffer, mimeType?: string, caption?: string) {
    const article = await this.prisma.news.findUnique({ where: { id } });
    if (!article) throw new NotFoundException('Статья не найдена');

    const result = await this.storage.uploadImage(buffer, `news/${id}/gallery`, mimeType);
    const count = await this.prisma.newsImage.count({ where: { newsId: id } });

    return this.prisma.newsImage.create({
      data: {
        newsId: id,
        url: result.url,
        mediumUrl: result.mediumUrl,
        thumbnailUrl: result.thumbnailUrl,
        storageKey: result.key,
        caption,
        order: count,
      },
    });
  }

  async deleteGalleryImage(imageId: string) {
    const image = await this.prisma.newsImage.findUnique({ where: { id: imageId } });
    if (!image) throw new NotFoundException('Фото не найдено');

    await this.storage.deleteFile(image.storageKey);
    await this.storage.deleteMany([
      image.storageKey.replace('original', 'medium'),
      image.storageKey.replace('original', 'thumbnail'),
    ]);
    await this.prisma.newsImage.delete({ where: { id: imageId } });
  }
}
