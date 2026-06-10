import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const USER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  reputation: true,
};

type ActivityItem = {
  id: string;
  type: 'game' | 'court' | 'news' | 'review';
  title: string;
  href: string;
  actorName: string | null;
  createdAt: Date;
};

@Injectable()
export class CommunityService {
  constructor(private prisma: PrismaService) {}

  /** Single round-trip payload for the homepage — keeps the client fast. */
  async getOverview() {
    const [stats, activity, leaderboard, courtOfWeek] = await Promise.all([
      this.getStats(),
      this.getActivity(8),
      this.getLeaderboard(5),
      this.getCourtOfWeek(),
    ]);

    return {
      stats,
      activity,
      leaderboard,
      featuredPlayer: leaderboard[0] ?? null,
      courtOfWeek,
    };
  }

  async getStats() {
    const now = new Date();
    const weekAhead = new Date(now);
    weekAhead.setDate(weekAhead.getDate() + 7);
    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);

    const [courts, gamesThisWeek, players, news] = await Promise.all([
      this.prisma.court.count({ where: { isActive: true } }),
      this.prisma.openRun.count({
        where: {
          status: { in: ['OPEN', 'CLOSED', 'COMPLETED'] },
          date: { gte: weekStart, lte: weekAhead },
        },
      }),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.news.count({ where: { isPublished: true } }),
    ]);

    return { courts, gamesThisWeek, players, news };
  }

  /** Computed activity feed — unions recent rows from existing tables, so it
   *  feels alive from day one without a dedicated events table. */
  async getActivity(limit = 8): Promise<ActivityItem[]> {
    const [runs, courts, news, reviews] = await Promise.all([
      this.prisma.openRun.findMany({
        where: { status: { in: ['OPEN', 'CLOSED', 'COMPLETED'] } },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          createdAt: true,
          court: { select: { name: true } },
          organizer: { select: { firstName: true, lastName: true } },
        },
      }),
      this.prisma.court.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { id: true, slug: true, name: true, createdAt: true },
      }),
      this.prisma.news.findMany({
        where: { isPublished: true },
        orderBy: { publishedAt: 'desc' },
        take: limit,
        select: { id: true, slug: true, title: true, publishedAt: true, createdAt: true },
      }),
      this.prisma.review.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          rating: true,
          createdAt: true,
          court: { select: { slug: true, name: true } },
          user: { select: { firstName: true, lastName: true } },
        },
      }),
    ]);

    const items: ActivityItem[] = [
      ...runs.map((r) => ({
        id: `game-${r.id}`,
        type: 'game' as const,
        title: `${r.organizer.firstName} организовал игру — ${r.court.name}`,
        href: `/pickup-games/${r.id}`,
        actorName: `${r.organizer.firstName} ${r.organizer.lastName}`,
        createdAt: r.createdAt,
      })),
      ...courts.map((c) => ({
        id: `court-${c.id}`,
        type: 'court' as const,
        title: `Новый корт на карте — ${c.name}`,
        href: `/courts/${c.slug}`,
        actorName: null,
        createdAt: c.createdAt,
      })),
      ...news.map((n) => ({
        id: `news-${n.id}`,
        type: 'news' as const,
        title: n.title,
        href: `/news/${n.slug}`,
        actorName: null,
        createdAt: n.publishedAt ?? n.createdAt,
      })),
      ...reviews.map((rv) => ({
        id: `review-${rv.id}`,
        type: 'review' as const,
        title: `${rv.user.firstName} оценил ${rv.court.name} на ${rv.rating}★`,
        href: `/courts/${rv.court.slug}`,
        actorName: `${rv.user.firstName} ${rv.user.lastName}`,
        createdAt: rv.createdAt,
      })),
    ];

    return items
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /** Top active players. Score blends contributions; cheap for an MVP user base. */
  async getLeaderboard(limit = 10) {
    const users = await this.prisma.user.findMany({
      where: { isActive: true },
      select: {
        ...USER_SELECT,
        _count: {
          select: { organizedRuns: true, participations: true, reviews: true },
        },
      },
    });

    return users
      .map((u) => {
        const games = u._count.organizedRuns;
        const joined = u._count.participations;
        const reviews = u._count.reviews;
        const score = u.reputation + games * 5 + joined * 2 + reviews;
        return {
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          avatarUrl: u.avatarUrl,
          gamesOrganized: games,
          gamesJoined: joined,
          reviews,
          score,
        };
      })
      .filter((u) => u.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /** Most-loved court this week, with a graceful fallback to the newest one. */
  async getCourtOfWeek() {
    const top = await this.prisma.court.findFirst({
      where: { isActive: true, reviewCount: { gt: 0 } },
      orderBy: [{ reviewCount: 'desc' }, { ratingSum: 'desc' }],
      include: { images: { orderBy: { isPrimary: 'desc' }, take: 1 } },
    });

    const court =
      top ??
      (await this.prisma.court.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        include: { images: { orderBy: { isPrimary: 'desc' }, take: 1 } },
      }));

    if (!court) return null;

    const rating =
      court.reviewCount > 0
        ? Math.round((court.ratingSum / court.reviewCount) * 10) / 10
        : 0;

    return {
      id: court.id,
      name: court.name,
      slug: court.slug,
      address: court.address,
      city: court.city,
      type: court.type,
      isFree: court.isFree,
      rating,
      reviewCount: court.reviewCount,
      image: court.images[0]?.thumbnailUrl ?? null,
    };
  }
}
