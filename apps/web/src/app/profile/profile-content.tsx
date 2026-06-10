'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth, useMe, useLogout } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { OpenRunCard } from '@/components/open-runs/open-run-card';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';
import { getInitials, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { LogOut, Edit3, TrendingUp, Trophy } from 'lucide-react';

const schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().regex(/^\+998[0-9]{9}$/).optional().or(z.literal('')),
  telegramUsername: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Tab = 'profile' | 'runs' | 'participations';

export function ProfileContent() {
  const { isAuthenticated } = useAuth();
  const { data: user, isLoading } = useMe();
  const logout = useLogout();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('profile');
  const [editing, setEditing] = useState(false);

  const { data: myRunsData } = useQuery({
    queryKey: ['me', 'runs'],
    queryFn: () => api.get('/users/me/open-runs').then((r) => r.data),
    enabled: isAuthenticated,
  });

  const { data: participationsData } = useQuery({
    queryKey: ['me', 'participations'],
    queryFn: () => api.get('/users/me/participations').then((r) => r.data),
    enabled: isAuthenticated,
  });

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: (data: FormValues) => api.patch('/users/me', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('Профиль обновлён');
      setEditing(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Ошибка');
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      phone: user?.phone ?? '',
      telegramUsername: user?.telegramUsername ?? '',
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="font-display font-bold text-2xl mb-4">Войдите в аккаунт</h1>
        <Button asChild variant="gold">
          <Link href="/auth/login">Войти</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container-page py-8 max-w-4xl space-y-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'profile', label: 'Профиль' },
    { key: 'runs', label: `Open Runs (${myRunsData?.length ?? 0})` },
    { key: 'participations', label: `Участия (${participationsData?.length ?? 0})` },
  ];

  return (
    <div className="container-page py-8 max-w-4xl">
      {/* Header */}
      <div className="rounded-xl border border-border bg-card p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
              {user?.firstName && user?.lastName
                ? getInitials(user.firstName, user.lastName)
                : '?'}
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl">
                {user?.firstName} {user?.lastName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {user?.email && (
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                )}
                <Badge variant={user?.role === 'ADMIN' ? 'gold' : 'outline'} className="text-xs">
                  {user?.role === 'ADMIN' ? 'Администратор' : user?.role === 'MODERATOR' ? 'Модератор' : 'Игрок'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
              <Edit3 className="w-4 h-4 mr-1.5" />
              Изменить
            </Button>
            <Button variant="ghost" size="sm" onClick={logout} className="text-destructive hover:text-destructive">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-secondary/30 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
              tab === t.key
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="space-y-6">
          {editing ? (
            <form onSubmit={handleSubmit((d) => updateProfile(d))} className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="font-display font-semibold text-lg">Редактировать профиль</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Имя</Label>
                  <Input {...register('firstName')} />
                  {errors.firstName && <p className="text-xs text-destructive">Минимум 2 символа</p>}
                </div>
                <div className="space-y-2">
                  <Label>Фамилия</Label>
                  <Input {...register('lastName')} />
                  {errors.lastName && <p className="text-xs text-destructive">Минимум 2 символа</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Телефон</Label>
                <Input {...register('phone')} placeholder="+998901234567" />
                {errors.phone && <p className="text-xs text-destructive">Формат: +998XXXXXXXXX</p>}
              </div>
              <div className="space-y-2">
                <Label>Telegram</Label>
                <Input {...register('telegramUsername')} placeholder="@username" />
              </div>
              <div className="flex gap-3">
                <Button type="submit" variant="gold" disabled={isPending}>
                  {isPending ? 'Сохраняем...' : 'Сохранить'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setEditing(false); reset(); }}>
                  Отмена
                </Button>
              </div>
            </form>
          ) : (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-display font-semibold text-lg mb-4">Информация</h2>
              <dl className="space-y-3">
                {[
                  { label: 'Имя', value: `${user?.firstName} ${user?.lastName}` },
                  { label: 'Email', value: user?.email ?? '—' },
                  { label: 'Телефон', value: user?.phone ?? '—' },
                  { label: 'Telegram', value: user?.telegramUsername ? `@${user.telegramUsername}` : '—' },
                  { label: 'На платформе с', value: user?.createdAt ? formatDate(user.createdAt) : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm py-2 border-b border-border/50 last:border-0">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Coming Soon sections */}
          {[
            { icon: TrendingUp, title: 'Статистика', desc: 'Ваша игровая статистика появится здесь' },
            { icon: Trophy, title: 'Ранг', desc: 'Рейтинг и достижения скоро появятся' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-border/50 bg-card/30 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Icon className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-display font-semibold">{title}</h3>
                <Badge variant="secondary" className="text-xs">Скоро</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* My Open Runs Tab */}
      {tab === 'runs' && (
        <div>
          {myRunsData?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myRunsData.map((run: any) => (
                <OpenRunCard key={run.id} run={run} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 bg-card/30 p-12 text-center">
              <p className="text-muted-foreground mb-4">Вы ещё не создавали Open Runs</p>
              <Button asChild variant="gold">
                <Link href="/open-runs/create">Создать Open Run</Link>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Participations Tab */}
      {tab === 'participations' && (
        <div>
          {participationsData?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {participationsData.map((p: any) => (
                <OpenRunCard key={p.id} run={p.openRun} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 bg-card/30 p-12 text-center">
              <p className="text-muted-foreground mb-4">Вы ещё не участвовали в Open Runs</p>
              <Button asChild variant="outline">
                <Link href="/open-runs">Найти игру</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
