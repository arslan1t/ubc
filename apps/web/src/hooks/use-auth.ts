import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export function useAuth() {
  return useAuthStore();
}

export function useMe() {
  const { isAuthenticated, setUser } = useAuthStore();
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get('/users/me');
      setUser(data);
      return data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      return api
        .post('/users/me/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then((r) => r.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('Фото профиля обновлено');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Не удалось загрузить фото'),
  });
}

export function useLogin() {
  const { setTokens } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (dto: { email: string; password: string }) =>
      api.post('/auth/login', dto).then((r) => r.data),
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('Добро пожаловать!');
      router.push('/');
    },
    onError: () => {
      toast.error('Неверный email или пароль');
    },
  });
}

export function useRegister() {
  const { setTokens } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (dto: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone: string;
    }) => api.post('/auth/register', dto).then((r) => r.data),
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('Аккаунт создан!');
      router.push('/');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ?? 'Ошибка при регистрации',
      );
    },
  });
}

interface TelegramBotStatusResponse {
  status: 'pending' | 'confirmed' | 'expired';
  accessToken?: string;
  refreshToken?: string;
}

export type TelegramBotLoginPhase = 'idle' | 'waiting' | 'expired' | 'error';

export function useTelegramBotLogin() {
  const { setTokens } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [phase, setPhase] = useState<TelegramBotLoginPhase>('idle');
  const handledRef = useRef(false);

  const startMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ token: string; deepLink: string }>(
        '/auth/telegram-bot/start',
      );
      return data;
    },
    onSuccess: (data) => {
      handledRef.current = false;
      setToken(data.token);
      setDeepLink(data.deepLink);
      setPhase('waiting');
      // Best effort — popup blockers often kill window.open from async
      // callbacks, so the UI always renders the deep link as a fallback.
      window.open(data.deepLink, '_blank', 'noopener,noreferrer');
    },
    onError: () => setPhase('error'),
  });

  const statusQuery = useQuery({
    queryKey: ['telegram-bot-login-status', token],
    queryFn: async () => {
      const { data } = await api.get<TelegramBotStatusResponse>(
        `/auth/telegram-bot/status/${token}`,
      );
      return data;
    },
    enabled: phase === 'waiting' && !!token,
    refetchInterval: (query) =>
      query.state.data?.status && query.state.data.status !== 'pending' ? false : 2000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const data = statusQuery.data;
    if (!data || handledRef.current) return;

    if (data.status === 'confirmed' && data.accessToken && data.refreshToken) {
      handledRef.current = true;
      setTokens(data.accessToken, data.refreshToken);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('Добро пожаловать!');
      setPhase('idle');
      router.push('/');
    } else if (data.status === 'expired') {
      handledRef.current = true;
      setPhase('expired');
    }
  }, [statusQuery.data, setTokens, queryClient, router]);

  return {
    start: () => startMutation.mutate(),
    phase,
    deepLink,
    isStarting: startMutation.isPending,
    reset: () => {
      setPhase('idle');
      setDeepLink(null);
      setToken(null);
    },
  };
}

export function useLogout() {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  return () => {
    logout();
    queryClient.clear();
    router.push('/');
    toast.success('Вы вышли из аккаунта');
  };
}
