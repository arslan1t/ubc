import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const courtKeys = {
  all: ['courts'] as const,
  list: (filters: any) => [...courtKeys.all, 'list', filters] as const,
  detail: (slug: string) => [...courtKeys.all, 'detail', slug] as const,
};

export function useCourts(filters: Record<string, any> = {}) {
  return useQuery({
    queryKey: courtKeys.list(filters),
    queryFn: async () => {
      const { data } = await api.get('/courts', { params: filters });
      return data;
    },
  });
}

export function useCourt(slug: string) {
  return useQuery({
    queryKey: courtKeys.detail(slug),
    queryFn: async () => {
      const { data } = await api.get(`/courts/${slug}`);
      return data;
    },
    enabled: !!slug,
  });
}

export function useCreateReview(courtId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: { rating: number; comment?: string }) =>
      api.post(`/courts/${courtId}/reviews`, dto).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courtKeys.all });
    },
  });
}
