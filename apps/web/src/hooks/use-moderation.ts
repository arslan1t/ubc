import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export type SubmissionType = 'COURT' | 'NEWS' | 'EVENT' | 'PHOTO' | 'REPORT' | 'RESULT';
export type SubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';

export interface Submission {
  id: string;
  type: SubmissionType;
  status: SubmissionStatus;
  payload: Record<string, any>;
  targetType: string | null;
  targetId: string | null;
  reviewNote: string | null;
  reviewedAt: string | null;
  resultId: string | null;
  createdAt: string;
  submittedBy: { id: string; firstName: string; lastName: string; avatarUrl: string | null };
  reviewedBy: { id: string; firstName: string; lastName: string } | null;
}

export const moderationKeys = {
  all: ['moderation'] as const,
  queue: (f: Record<string, any>) => [...moderationKeys.all, 'queue', f] as const,
  stats: () => [...moderationKeys.all, 'stats'] as const,
};

export function useModerationStats() {
  return useQuery<{ totalPending: number; byType: Record<string, number> }>({
    queryKey: moderationKeys.stats(),
    queryFn: async () => (await api.get('/moderation/stats')).data,
  });
}

export function useModerationQueue(filters: { status?: string; type?: string } = {}) {
  return useQuery<{ data: Submission[]; total: number }>({
    queryKey: moderationKeys.queue(filters),
    queryFn: async () => (await api.get('/moderation/submissions', { params: filters })).data,
  });
}

function useReviewMutation(action: 'approve' | 'reject' | 'request-changes') {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      api.post(`/moderation/submissions/${id}/${action}`, { note }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: moderationKeys.all });
    },
  });
}

export const useApproveSubmission = () => useReviewMutation('approve');
export const useRejectSubmission = () => useReviewMutation('reject');
export const useRequestChanges = () => useReviewMutation('request-changes');

// ─── User management ───

export interface AdminUser {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';
  reputation: number;
  isActive: boolean;
  createdAt: string;
  _count: { organizedRuns: number; reviews: number; submissions: number };
}

export function useAdminUsers(filters: { search?: string; role?: string } = {}) {
  return useQuery<{ data: AdminUser[]; total: number }>({
    queryKey: ['admin', 'users', filters],
    queryFn: async () => (await api.get('/users', { params: filters })).data,
  });
}

export function useSetUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      api.patch(`/users/${id}/role`, { role }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

export function useSetUserActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/users/${id}/active`, { isActive }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}
