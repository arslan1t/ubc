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

export interface EventRegistrationEntry {
  id: string;
  userId: string;
  createdAt: string;
  user: { firstName: string; lastName: string; avatarUrl: string | null };
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
    mutationFn: () => api.post(`/events/${eventId}/register`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', slug] });
      toast.success('Вы зарегистрированы на турнир!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Не удалось зарегистрироваться');
    },
  });
}

export function useUnregisterFromEvent(eventId: string, slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.delete(`/events/${eventId}/register`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', slug] });
      toast.success('Регистрация отменена');
    },
    onError: () => {
      toast.error('Не удалось отменить регистрацию');
    },
  });
}
