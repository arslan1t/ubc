import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async overview() {
    const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalCourts,
      totalOpenRuns,
      openRunsByStatus,
      totalEvents,
      totalEventRegistrations,
      totalNews,
      publishedNews,
      totalMedia,
      publishedMedia,
      totalReviews,
      newUsersLast30d,
      topCourts,
      topOrganizers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.court.count(),
      this.prisma.openRun.count(),
      this.prisma.openRun.groupBy({ by: ['status'], _count: true }),
      this.prisma.event.count(),
      this.prisma.eventRegistration.count(),
      this.prisma.news.count(),
      this.prisma.news.count({ where: { isPublished: true } }),
      this.prisma.media.count(),
      this.prisma.media.count({ where: { isPublished: true } }),
      this.prisma.review.count(),
      this.prisma.user.findMany({
        where: { createdAt: { gte: since30d } },
        select: { createdAt: true },
      }),
      this.prisma.court.findMany({
        orderBy: { reviewCount: 'desc' },
        take: 5,
        select: { id: true, name: true, reviewCount: true, ratingSum: true },
      }),
      this.prisma.openRun.groupBy({
        by: ['organizerId'],
        _count: true,
        orderBy: { _count: { organizerId: 'desc' } },
        take: 5,
      }),
    ]);

    const signupsByDay: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      signupsByDay[d.toISOString().slice(0, 10)] = 0;
    }
    for (const u of newUsersLast30d) {
      const key = u.createdAt.toISOString().slice(0, 10);
      if (key in signupsByDay) signupsByDay[key]++;
    }

    const organizerIds = topOrganizers.map((o) => o.organizerId);
    const organizers = await this.prisma.user.findMany({
      where: { id: { in: organizerIds } },
      select: { id: true, firstName: true, lastName: true },
    });

    return {
      totals: {
        users: totalUsers,
        courts: totalCourts,
        pickupGames: totalOpenRuns,
        events: totalEvents,
        eventRegistrations: totalEventRegistrations,
        news: totalNews,
        publishedNews,
        media: totalMedia,
        publishedMedia,
        reviews: totalReviews,
      },
      pickupGamesByStatus: openRunsByStatus.map((g) => ({ status: g.status, count: g._count })),
      signupsLast30Days: Object.entries(signupsByDay).map(([date, count]) => ({ date, count })),
      topCourts: topCourts.map((c) => ({
        ...c,
        rating: c.reviewCount > 0 ? Math.round((c.ratingSum / c.reviewCount) * 10) / 10 : 0,
      })),
      topOrganizers: topOrganizers.map((o) => {
        const user = organizers.find((u) => u.id === o.organizerId);
        return { userId: o.organizerId, name: user ? `${user.firstName} ${user.lastName}` : 'Удалён', gamesOrganized: o._count };
      }),
    };
  }
}
