import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface CommunityStats {
  courts: number;
  gamesThisWeek: number;
  players: number;
  news: number;
}

export interface ActivityItem {
  id: string;
  type: 'game' | 'court' | 'news' | 'review';
  title: string;
  href: string;
  actorName: string | null;
  createdAt: string;
}

export interface LeaderboardPlayer {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  gamesOrganized: number;
  gamesJoined: number;
  reviews: number;
  score: number;
}

export interface CourtOfWeek {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  type: string;
  isFree: boolean;
  rating: number;
  reviewCount: number;
  image: string | null;
}

export interface CommunityOverview {
  stats: CommunityStats;
  activity: ActivityItem[];
  leaderboard: LeaderboardPlayer[];
  featuredPlayer: LeaderboardPlayer | null;
  courtOfWeek: CourtOfWeek | null;
}

export function useCommunityOverview() {
  return useQuery<CommunityOverview>({
    queryKey: ['community', 'overview'],
    queryFn: async () => {
      const { data } = await api.get('/community/overview');
      return data;
    },
    staleTime: 60_000,
  });
}

export function useLeaderboard(limit = 20) {
  return useQuery<LeaderboardPlayer[]>({
    queryKey: ['community', 'leaderboard', limit],
    queryFn: async () => {
      const { data } = await api.get('/community/leaderboard', { params: { limit } });
      return data;
    },
  });
}
