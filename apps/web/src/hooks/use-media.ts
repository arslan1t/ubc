import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export const mediaKeys = {
  all: ['media'] as const,
  list: (filters: any) => [...mediaKeys.all, 'list', filters] as const,
  detail: (id: string) => [...mediaKeys.all, 'detail', id] as const,
};

export function useMedia(filters: Record<string, any> = {}) {
  return useQuery({
    queryKey: mediaKeys.list(filters),
    queryFn: async () => {
      const { data } = await api.get('/media', { params: filters });
      return data;
    },
  });
}

export function useMediaItem(id: string) {
  return useQuery({
    queryKey: mediaKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/media/${id}`);
      return data;
    },
    enabled: !!id,
  });
}
