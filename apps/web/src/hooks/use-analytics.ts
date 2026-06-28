import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface AnalyticsOverview {
  totals: {
    users: number;
    courts: number;
    pickupGames: number;
    events: number;
    eventRegistrations: number;
    news: number;
    publishedNews: number;
    media: number;
    publishedMedia: number;
    reviews: number;
  };
  pickupGamesByStatus: { status: string; count: number }[];
  signupsLast30Days: { date: string; count: number }[];
  topCourts: { id: string; name: string; reviewCount: number; rating: number }[];
  topOrganizers: { userId: string; name: string; gamesOrganized: number }[];
}

export function useAnalyticsOverview() {
  return useQuery<AnalyticsOverview>({
    queryKey: ['analytics', 'overview'],
    queryFn: async () => (await api.get('/analytics/overview')).data,
  });
}
