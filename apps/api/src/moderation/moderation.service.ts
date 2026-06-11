import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  Submission,
  SubmissionStatus,
  SubmissionType,
  CourtType,
  CourtSurface,
  NewsCategory,
} from '@prisma/client';
import slugify from 'slug';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubmissionDto } from './dto/submission.dto';

const SUBMITTER_SELECT = {
  submittedBy: {
    select: { id: true, firstName: true, lastName: true, avatarUrl: true },
  },
  reviewedBy: { select: { id: true, firstName: true, lastName: true } },
};

@Injectable()
export class ModerationService {
  constructor(private prisma: PrismaService) {}

  // ─── User-facing ───

  create(userId: string, dto: CreateSubmissionDto) {
    return this.prisma.submission.create({
      data: {
        type: dto.type,
        payload: dto.payload,
        targetType: dto.targetType,
        targetId: dto.targetId,
        submittedById: userId,
      },
    });
  }

  mySubmissions(userId: string) {
    return this.prisma.submission.findMany({
      where: { submittedById: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Moderator-facing ───

  async list(params: {
    status?: SubmissionStatus;
    type?: SubmissionType;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(50, params.limit ?? 20);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.type) where.type = params.type;

    const [data, total] = await Promise.all([
      this.prisma.submission.findMany({
        where,
        include: SUBMITTER_SELECT,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.submission.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async stats() {
    const grouped = await this.prisma.submission.groupBy({
      by: ['type'],
      where: { status: SubmissionStatus.PENDING },
      _count: { _all: true },
    });

    const byType: Record<string, number> = {};
    let totalPending = 0;
    for (const g of grouped) {
      byType[g.type] = g._count._all;
      totalPending += g._count._all;
    }
    return { totalPending, byType };
  }

  async approve(reviewerId: string, id: string) {
    const sub = await this.getPending(id);
    const resultId = await this.materialize(sub);
    return this.prisma.submission.update({
      where: { id },
      data: {
        status: SubmissionStatus.APPROVED,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        resultId,
      },
      include: SUBMITTER_SELECT,
    });
  }

  reject(reviewerId: string, id: string, note?: string) {
    return this.review(reviewerId, id, SubmissionStatus.REJECTED, note);
  }

  requestChanges(reviewerId: string, id: string, note?: string) {
    return this.review(reviewerId, id, SubmissionStatus.CHANGES_REQUESTED, note);
  }

  private async review(
    reviewerId: string,
    id: string,
    status: SubmissionStatus,
    note?: string,
  ) {
    await this.getPending(id);
    return this.prisma.submission.update({
      where: { id },
      data: {
        status,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        reviewNote: note,
      },
      include: SUBMITTER_SELECT,
    });
  }

  private async getPending(id: string): Promise<Submission> {
    const sub = await this.prisma.submission.findUnique({ where: { id } });
    if (!sub) throw new NotFoundException('Заявка не найдена');
    if (sub.status !== SubmissionStatus.PENDING) {
      throw new BadRequestException('Заявка уже обработана');
    }
    return sub;
  }

  /** Turn an approved submission into a real published entity. */
  private async materialize(sub: Submission): Promise<string | null> {
    const p = (sub.payload ?? {}) as Record<string, any>;

    switch (sub.type) {
      case SubmissionType.COURT: {
        const court = await this.prisma.court.create({
          data: {
            name: p.name,
            slug: await this.uniqueCourtSlug(p.name),
            address: p.address,
            district: p.district ?? null,
            city: p.city || 'Ташкент',
            latitude: Number(p.latitude),
            longitude: Number(p.longitude),
            type: (p.type as CourtType) ?? CourtType.OUTDOOR,
            surface: (p.surface as CourtSurface) ?? CourtSurface.ASPHALT,
            isFree: p.isFree ?? true,
            hasLighting: p.hasLighting ?? false,
            hasChangingRooms: p.hasChangingRooms ?? false,
            hoops: p.hoops ?? 2,
            description: p.description ?? null,
            isVerified: true,
            isActive: true,
          },
        });
        return court.id;
      }

      case SubmissionType.NEWS: {
        const news = await this.prisma.news.create({
          data: {
            title: p.title,
            slug: await this.uniqueNewsSlug(p.title),
            excerpt: p.excerpt ?? null,
            content: p.content ?? '',
            coverUrl: p.coverUrl ?? null,
            category: (p.category as NewsCategory) ?? NewsCategory.NEWS,
            authorId: sub.submittedById,
            isPublished: true,
            publishedAt: new Date(),
          },
        });
        return news.id;
      }

      // EVENT / PHOTO / REPORT / RESULT are materialized once those domains
      // land (Phases 2/5). Approving them only records the decision for now.
      default:
        return null;
    }
  }

  private async uniqueCourtSlug(name: string): Promise<string> {
    const base = slugify(name || 'court', { locale: 'ru' });
    let slug = base;
    let i = 1;
    while (await this.prisma.court.findUnique({ where: { slug } })) {
      slug = `${base}-${i++}`;
    }
    return slug;
  }

  private async uniqueNewsSlug(title: string): Promise<string> {
    const base = slugify(title || 'news', { locale: 'ru' });
    let slug = base;
    let i = 1;
    while (await this.prisma.news.findUnique({ where: { slug } })) {
      slug = `${base}-${i++}`;
    }
    return slug;
  }
}
