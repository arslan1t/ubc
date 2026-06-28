import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from './use-auth';

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export function useMyNotifications() {
  const { isAuthenticated } = useAuth();
  return useQuery<{ data: NotificationItem[]; total: number; unreadCount: number }>({
    queryKey: ['notifications', 'me'],
    queryFn: async () => (await api.get('/notifications/me')).data,
    enabled: isAuthenticated,
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', 'me'] }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', 'me'] }),
  });
}

// ─── Admin ───

export function useBroadcastNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: { title: string; body?: string; link?: string }) =>
      api.post('/notifications/broadcast', dto).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useAdminNotifications(page = 1) {
  return useQuery({
    queryKey: ['notifications', 'admin', page],
    queryFn: async () => (await api.get('/notifications/admin/all', { params: { page } })).data,
  });
}
