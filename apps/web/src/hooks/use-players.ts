import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface PublicPlayer {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  bio: string | null;
  city: string | null;
  reputation: number;
  telegramUsername: string | null;
  instagramUsername: string | null;
  createdAt: string;
  stats: {
    gamesOrganized: number;
    gamesJoined: number;
    reviews: number;
  };
  upcomingRuns: Array<{
    id: string;
    title: string | null;
    date: string;
    startTime: string;
    court: { name: string; city: string };
  }>;
}

export function usePlayerProfile(id: string) {
  return useQuery<PublicPlayer>({
    queryKey: ['players', id],
    queryFn: () => api.get(`/users/${id}/public`).then((r) => r.data),
    enabled: !!id,
    staleTime: 60 * 1000,
    retry: (failureCount, error: any) =>
      error?.response?.status !== 404 && failureCount < 2,
  });
}
