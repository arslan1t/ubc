import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { CreateOpenRunDto } from '@ubc/shared';

export const openRunKeys = {
  all: ['open-runs'] as const,
  list: (filters: any) => [...openRunKeys.all, 'list', filters] as const,
  detail: (id: string) => [...openRunKeys.all, 'detail', id] as const,
};

export function useOpenRuns(filters: Record<string, any> = {}) {
  return useQuery({
    queryKey: openRunKeys.list(filters),
    queryFn: async () => {
      const { data } = await api.get('/open-runs', { params: filters });
      return data;
    },
  });
}

export function useOpenRun(id: string) {
  return useQuery({
    queryKey: openRunKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/open-runs/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateOpenRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateOpenRunDto) =>
      api.post('/open-runs', dto).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: openRunKeys.all });
    },
  });
}

export function useJoinOpenRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.post(`/open-runs/${id}/join`).then((r) => r.data),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: openRunKeys.detail(id) });
    },
  });
}

export function useLeaveOpenRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/open-runs/${id}/leave`).then((r) => r.data),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: openRunKeys.detail(id) });
    },
  });
}

export function useCancelOpenRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch(`/open-runs/${id}/cancel`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: openRunKeys.all });
    },
  });
}
