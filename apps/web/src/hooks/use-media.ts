import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

// ─── Admin ───

export interface MediaFormValues {
  title: string;
  description?: string;
  type: 'VIDEO' | 'PHOTO' | 'INTERVIEW' | 'PODCAST';
  youtubeUrl?: string;
  isPublished?: boolean;
}

export function useAdminMedia(filters: Record<string, any> = {}) {
  return useQuery({
    queryKey: [...mediaKeys.all, 'admin', filters],
    queryFn: async () => (await api.get('/media/admin/all', { params: filters })).data,
  });
}

export function useCreateMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: MediaFormValues) => api.post('/media', dto).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: mediaKeys.all }),
  });
}

export function usePublishMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/media/${id}/publish`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: mediaKeys.all }),
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/media/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: mediaKeys.all }),
  });
}
