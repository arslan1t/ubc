import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';

export type EventStatus = 'UPCOMING' | 'REGISTRATION_OPEN' | 'LIVE' | 'COMPLETED';

export interface EventListItem {
  id: string;
  slug: string;
  title: string;
  status: EventStatus;
  startDate: string;
  location: string;
  coverUrl: string | null;
  maxParticipants: number | null;
  registrationCount: number;
}

export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'COMPLETED';

export interface EventRegistrationEntry {
  id: string;
  userId: string;
  createdAt: string;
  status?: RegistrationStatus;
  height?: number | null;
  weight?: number | null;
  age?: number | null;
  highlightUrl?: string | null;
  instagram?: string | null;
  reviewNote?: string | null;
  user: { id?: string; firstName: string; lastName: string; avatarUrl: string | null; telegramUsername?: string | null };
}

export interface MyRegistration {
  id: string;
  status: RegistrationStatus;
  height: number | null;
  weight: number | null;
  age: number | null;
  highlightUrl: string | null;
  instagram: string | null;
  reviewNote: string | null;
}

export interface MatchPlayer {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface BracketMatch {
  id: string;
  round: number;
  slot: number;
  player1: MatchPlayer | null;
  player2: MatchPlayer | null;
  player1Id: string | null;
  player2Id: string | null;
  score1: number | null;
  score2: number | null;
  winnerId: string | null;
  status: MatchStatus;
}

export interface EventApplication {
  height?: number;
  weight?: number;
  age?: number;
  highlightUrl?: string;
  instagram?: string;
}

export interface EventImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  mediumUrl: string;
}

export interface EventDetail extends EventListItem {
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  rules: string | null;
  prizePool: string | null;
  schedule: { time: string; title: string }[] | null;
  sponsors: { name: string; logoUrl?: string; url?: string }[] | null;
  faq: { question: string; answer: string }[] | null;
  resultsSummary: string | null;
  gallery: EventImage[];
  registrations: EventRegistrationEntry[];
}

export function useEvents() {
  return useQuery<EventListItem[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const { data } = await api.get('/events');
      return data;
    },
    staleTime: 60_000,
  });
}

export function useEvent(slug: string) {
  return useQuery<EventDetail>({
    queryKey: ['events', slug],
    queryFn: async () => {
      const { data } = await api.get(`/events/${slug}`);
      return data;
    },
    enabled: !!slug,
  });
}

export function useRegisterForEvent(eventId: string, slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (application: EventApplication) =>
      api.post(`/events/${eventId}/register`, application).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', slug] });
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'my-registration'] });
      toast.success('Заявка отправлена! Мы проверим её и сообщим о результате.');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Не удалось отправить заявку');
    },
  });
}

export function useMyEventRegistration(eventId: string, enabled: boolean) {
  return useQuery<MyRegistration | null>({
    queryKey: ['events', eventId, 'my-registration'],
    queryFn: async () => (await api.get(`/events/${eventId}/my-registration`)).data || null,
    enabled: !!eventId && enabled,
  });
}

export function useUnregisterFromEvent(eventId: string, slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.delete(`/events/${eventId}/register`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', slug] });
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'my-registration'] });
      toast.success('Заявка отменена');
    },
    onError: () => {
      toast.error('Не удалось отменить заявку');
    },
  });
}

/** Live bracket — polls while the tournament is going so viewers see updates in near-real-time. */
export function useBracket(eventId: string, live = false) {
  return useQuery<{ matches: BracketMatch[]; generatedAt: string | null }>({
    queryKey: ['events', eventId, 'bracket'],
    queryFn: async () => (await api.get(`/events/${eventId}/bracket`)).data,
    enabled: !!eventId,
    refetchInterval: live ? 12_000 : false,
    refetchOnWindowFocus: true,
  });
}

// ─── Admin ───

export interface EventFormValues {
  title: string;
  slug?: string;
  status: EventStatus;
  startDate: string;
  location: string;
  address?: string;
  coverUrl?: string;
  description?: string;
  rules?: string;
  prizePool?: string;
  maxParticipants?: number;
  resultsSummary?: string;
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: EventFormValues) => api.post('/events', dto).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Турнир создан');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Не удалось создать турнир');
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<EventFormValues> }) =>
      api.patch(`/events/${id}`, dto).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Турнир обновлён');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Не удалось обновить турнир');
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/events/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Турнир удалён');
    },
    onError: () => {
      toast.error('Не удалось удалить турнир');
    },
  });
}

export function useUploadEventCover() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => {
      const fd = new FormData();
      fd.append('file', file);
      return api
        .post(`/events/${id}/cover`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then((r) => r.data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
    onError: () => toast.error('Не удалось загрузить обложку'),
  });
}

export function useEventRegistrationsAdmin(eventId: string) {
  return useQuery<EventRegistrationEntry[]>({
    queryKey: ['events', eventId, 'registrations'],
    queryFn: async () => (await api.get(`/events/${eventId}/registrations`)).data,
    enabled: !!eventId,
  });
}

export function useReviewRegistration(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ regId, status, note }: { regId: string; status: 'APPROVED' | 'REJECTED'; note?: string }) =>
      api.patch(`/events/${eventId}/registrations/${regId}`, { status, note }).then((r) => r.data),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'registrations'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success(vars.status === 'APPROVED' ? 'Участник зачислен' : 'Заявка отклонена');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Не удалось обработать заявку');
    },
  });
}

export function useDeleteRegistration(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (regId: string) => api.delete(`/events/${eventId}/registrations/${regId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'registrations'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Заявка удалена');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Не удалось удалить заявку');
    },
  });
}

export function useGenerateBracket(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/events/${eventId}/bracket/generate`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'bracket'] });
      toast.success('Сетка сгенерирована');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Не удалось сгенерировать сетку');
    },
  });
}

export function useResetBracket(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete(`/events/${eventId}/bracket`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'bracket'] });
      toast.success('Сетка сброшена');
    },
    onError: () => toast.error('Не удалось сбросить сетку'),
  });
}

export function useUpdateMatch(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ matchId, ...dto }: { matchId: string; score1?: number; score2?: number; status?: MatchStatus; winnerId?: string }) =>
      api.patch(`/events/${eventId}/matches/${matchId}`, dto).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'bracket'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Не удалось обновить матч');
    },
  });
}
