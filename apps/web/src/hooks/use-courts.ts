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

// ─── Admin ───

export interface CourtFormValues {
  name: string;
  address: string;
  district?: string;
  city?: string;
  latitude: number;
  longitude: number;
  type: 'INDOOR' | 'OUTDOOR';
  surface?: 'HARDWOOD' | 'ASPHALT' | 'CONCRETE' | 'RUBBER' | 'OTHER';
  isFree?: boolean;
  hasLighting?: boolean;
  hasChangingRooms?: boolean;
  hoops?: number;
  description?: string;
  isVerified?: boolean;
  isActive?: boolean;
}

export function useAdminCourts(filters: Record<string, any> = {}) {
  return useQuery({
    queryKey: [...courtKeys.all, 'admin', filters],
    queryFn: async () => (await api.get('/courts/admin/all', { params: filters })).data,
  });
}

export function useCreateCourt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CourtFormValues) => api.post('/courts', dto).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: courtKeys.all }),
  });
}

export function useUpdateCourt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CourtFormValues> }) =>
      api.patch(`/courts/${id}`, dto).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: courtKeys.all }),
  });
}

export function useDeleteCourt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/courts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: courtKeys.all }),
  });
}

export function useAdminReviews(page = 1) {
  return useQuery({
    queryKey: ['reviews', 'admin', page],
    queryFn: async () => (await api.get('/courts/reviews/admin', { params: { page } })).data,
  });
}

export function useAdminDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => api.delete(`/courts/reviews/${reviewId}/admin`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews', 'admin'] }),
  });
}
