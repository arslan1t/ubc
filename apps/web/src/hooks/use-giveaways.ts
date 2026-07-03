import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';

export type GiveawayStatus = 'OPEN' | 'COMPLETED';
export type EntryStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface GiveawayUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface GiveawayListItem {
  id: string;
  title: string;
  description: string | null;
  conditions: string | null;
  prize: string;
  coverUrl: string | null;
  status: GiveawayStatus;
  winnerId: string | null;
  winner: GiveawayUser | null;
  drawnAt: string | null;
  createdAt: string;
  poolCount: number;
}

export interface GiveawayEntry {
  id: string;
  userId: string;
  createdAt: string;
  user: GiveawayUser;
}

export interface GiveawayDetail extends GiveawayListItem {
  entries: GiveawayEntry[];
}

export interface MyGiveawayEntry {
  id: string;
  status: EntryStatus;
  comment: string | null;
}

export function useGiveaways() {
  return useQuery<GiveawayListItem[]>({
    queryKey: ['giveaways'],
    queryFn: async () => (await api.get('/giveaways')).data,
    staleTime: 30_000,
  });
}

export function useGiveaway(id: string, poll = false) {
  return useQuery<GiveawayDetail>({
    queryKey: ['giveaways', id],
    queryFn: async () => (await api.get(`/giveaways/${id}`)).data,
    enabled: !!id,
    refetchInterval: poll ? 10_000 : false,
  });
}

export function useMyGiveawayEntry(id: string, enabled: boolean) {
  return useQuery<MyGiveawayEntry | null>({
    queryKey: ['giveaways', id, 'my-entry'],
    queryFn: async () => (await api.get(`/giveaways/${id}/my-entry`)).data || null,
    enabled: !!id && enabled,
  });
}

export function useEnterGiveaway(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (comment?: string) =>
      api.post(`/giveaways/${id}/enter`, { comment }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['giveaways', id] });
      qc.invalidateQueries({ queryKey: ['giveaways', id, 'my-entry'] });
      toast.success('Заявка отправлена! После проверки ты попадёшь в пул.');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Не удалось отправить заявку'),
  });
}

export function useLeaveGiveaway(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete(`/giveaways/${id}/enter`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['giveaways', id] });
      qc.invalidateQueries({ queryKey: ['giveaways', id, 'my-entry'] });
      toast.success('Заявка отозвана');
    },
    onError: () => toast.error('Не удалось отозвать заявку'),
  });
}

// ─── Admin ───

export interface AdminGiveawayEntry extends GiveawayEntry {
  status: EntryStatus;
  comment: string | null;
  user: GiveawayUser & { telegramUsername?: string | null; instagramUsername?: string | null };
}

export function useGiveawayEntriesAdmin(id: string) {
  return useQuery<AdminGiveawayEntry[]>({
    queryKey: ['giveaways', id, 'entries'],
    queryFn: async () => (await api.get(`/giveaways/${id}/entries`)).data,
    enabled: !!id,
  });
}

export function useReviewGiveawayEntry(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ entryId, status, note }: { entryId: string; status: 'APPROVED' | 'REJECTED'; note?: string }) =>
      api.patch(`/giveaways/${id}/entries/${entryId}`, { status, note }).then((r) => r.data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['giveaways', id] });
      toast.success(vars.status === 'APPROVED' ? 'Участник в пуле' : 'Заявка отклонена');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Не удалось обработать заявку'),
  });
}

export function useDeleteGiveawayEntry(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) => api.delete(`/giveaways/${id}/entries/${entryId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['giveaways', id] });
      toast.success('Заявка удалена');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Не удалось удалить заявку'),
  });
}

export interface GiveawayFormValues {
  title: string;
  prize: string;
  description?: string;
  conditions?: string;
  coverUrl?: string;
}

export function useCreateGiveaway() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: GiveawayFormValues) => api.post('/giveaways', dto).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['giveaways'] });
      toast.success('Розыгрыш создан');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Не удалось создать'),
  });
}

export function useUpdateGiveaway() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<GiveawayFormValues> & { status?: GiveawayStatus } }) =>
      api.patch(`/giveaways/${id}`, dto).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['giveaways'] });
      toast.success('Розыгрыш обновлён');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Не удалось обновить'),
  });
}

export function useDeleteGiveaway() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/giveaways/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['giveaways'] });
      toast.success('Розыгрыш удалён');
    },
    onError: () => toast.error('Не удалось удалить'),
  });
}

export function useUploadGiveawayCover() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => {
      const fd = new FormData();
      fd.append('file', file);
      return api
        .post(`/giveaways/${id}/cover`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then((r) => r.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['giveaways'] }),
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Не удалось загрузить обложку'),
  });
}

/** Returns the giveaway with winnerIndex — the wheel animates to that segment. */
export function useDrawGiveaway(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/giveaways/${id}/draw`).then((r) => r.data),
    onSuccess: () => {
      // Deliberately NOT invalidating immediately — the wheel spins first,
      // the caller invalidates after the animation completes.
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Не удалось запустить розыгрыш'),
  });
}
