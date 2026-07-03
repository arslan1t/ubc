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

export interface OpenRunUpdateDto {
  courtId?: string;
  title?: string;
  description?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  maxParticipants?: number;
  fee?: number;
  isPublic?: boolean;
  skillLevel?: string;
  status?: 'OPEN' | 'CLOSED' | 'COMPLETED' | 'CANCELLED';
}

export function useUpdateOpenRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: OpenRunUpdateDto }) =>
      api.patch(`/open-runs/${id}`, dto).then((r) => r.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: openRunKeys.all });
      queryClient.invalidateQueries({ queryKey: openRunKeys.detail(id) });
    },
  });
}

export function useRemoveParticipant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ runId, participantId }: { runId: string; participantId: string }) =>
      api.delete(`/open-runs/${runId}/participants/${participantId}`),
    onSuccess: (_, { runId }) => {
      queryClient.invalidateQueries({ queryKey: openRunKeys.detail(runId) });
    },
  });
}

// ─── Admin ───

export function useAdminOpenRuns(filters: Record<string, any> = {}) {
  return useQuery({
    queryKey: [...openRunKeys.all, 'admin', filters],
    queryFn: async () => (await api.get('/open-runs/admin/all', { params: filters })).data,
  });
}

export function useAdminCancelOpenRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/open-runs/${id}/admin-cancel`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: openRunKeys.all }),
  });
}
