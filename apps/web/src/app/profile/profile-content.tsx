'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuth, useMe, useLogout } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { OpenRunCard } from '@/components/open-runs/open-run-card';
import { MySubmissions } from '@/components/profile/my-submissions';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';
import { getInitials, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  LogOut, Edit3, TrendingUp, Trophy, MapPin, Newspaper,
  Zap, Star, Award, ChevronRight,
} from 'lucide-react';

const ROLE_META: Record<string, { label: string; color: string; bg: string }> = {
  USER:        { label: 'Игрок',       color: 'text-foreground',   bg: 'bg-secondary border-border' },
  MODERATOR:   { label: 'Модератор',   color: 'text-sky-400',      bg: 'bg-sky-400/10 border-sky-400/30' },
  ADMIN:       { label: 'Админ',       color: 'text-primary',      bg: 'bg-primary/10 border-primary/30' },
  SUPER_ADMIN: { label: 'Супер Админ', color: 'text-violet-400',   bg: 'bg-violet-400/10 border-violet-400/30' },
};

const schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().regex(/^\+998[0-9]{9}$/).optional().or(z.literal('')),
  telegramUsername: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;
type Tab = 'profile' | 'runs' | 'participations' | 'submissions';

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
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Ошибка'),
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
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
      <div className="container-page py-20 flex flex-col items-center text-center gap-5">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Star className="w-9 h-9 text-primary" />
        </div>
        <div>
          <h1 className="font-display font-black text-2xl mb-2">Войдите в аккаунт</h1>
          <p className="text-muted-foreground">Чтобы видеть свой профиль и управлять играми</p>
        </div>
        <Button asChild variant="gold" size="lg" className="rounded-2xl shadow-[0_0_30px_hsl(43_85%_53%/0.3)]">
          <Link href="/auth/login">Войти</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container-page py-8 max-w-4xl space-y-4">
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const roleMeta = ROLE_META[user?.role ?? 'USER'] ?? ROLE_META.USER;
  const totalGames = (myRunsData?.length ?? 0) + (participationsData?.length ?? 0);

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: 'profile', label: 'Профиль' },
    { key: 'runs', label: 'Мои игры', count: myRunsData?.length },
    { key: 'participations', label: 'Участия', count: participationsData?.length },
    { key: 'submissions', label: 'Заявки' },
  ];

  return (
    <div className="min-h-screen">
      {/* Profile hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,hsl(43_85%_53%/0.07)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-court-grid opacity-30" />

        <div className="container-page relative py-10 md:py-14 max-w-4xl">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/30 flex items-center justify-center">
                <span className="font-display font-black text-2xl md:text-3xl text-primary">
                  {user?.firstName && user?.lastName ? getInitials(user.firstName, user.lastName) : '?'}
                </span>
              </div>
              {/* Rep indicator */}
              {user?.reputation !== undefined && user.reputation > 0 && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_0_12px_hsl(43_85%_53%/0.5)]">
                  <Award className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>

            {/* Name + stats */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-display font-black text-2xl md:text-3xl">
                  {user?.firstName} {user?.lastName}
                </h1>
                <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold', roleMeta.bg, roleMeta.color)}>
                  {roleMeta.label}
                </span>
              </div>
              <p className="text-muted-foreground text-sm mb-4">{user?.email}</p>

              {/* Mini stats row */}
              <div className="flex flex-wrap gap-4">
                {[
                  { label: 'Игр всего', value: totalGames, icon: Zap, color: 'text-primary' },
                  { label: 'Организовал', value: myRunsData?.length ?? 0, icon: Star, color: 'text-amber-400' },
                  { label: 'Репутация', value: user?.reputation ?? 0, icon: Trophy, color: 'text-violet-400' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon className={cn('w-4 h-4', color)} />
                    <span className="font-display font-black text-lg">{value}</span>
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setEditing(!editing)}>
                <Edit3 className="w-4 h-4 mr-1.5" />
                Изменить
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                onClick={logout}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page py-8 max-w-4xl">
        {/* Tabs */}
        <div className="flex gap-0 p-1 rounded-xl bg-secondary/40 mb-8 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'relative flex-1 min-w-fit whitespace-nowrap py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200',
                tab === t.key
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className="ml-1.5 text-xs text-muted-foreground">({t.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {tab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {editing ? (
              <form
                onSubmit={handleSubmit((d) => updateProfile(d))}
                className="rounded-2xl border border-border/60 bg-card p-6 space-y-5"
              >
                <h2 className="font-display font-bold text-lg">Редактировать профиль</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Имя</Label>
                    <Input {...register('firstName')} className="rounded-xl" />
                    {errors.firstName && <p className="text-xs text-destructive">Минимум 2 символа</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Фамилия</Label>
                    <Input {...register('lastName')} className="rounded-xl" />
                    {errors.lastName && <p className="text-xs text-destructive">Минимум 2 символа</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Телефон</Label>
                  <Input {...register('phone')} placeholder="+998901234567" className="rounded-xl" />
                  {errors.phone && <p className="text-xs text-destructive">Формат: +998XXXXXXXXX</p>}
                </div>
                <div className="space-y-2">
                  <Label>Telegram</Label>
                  <Input {...register('telegramUsername')} placeholder="username" className="rounded-xl" />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" variant="gold" disabled={isPending} className="rounded-xl">
                    {isPending ? 'Сохраняем...' : 'Сохранить'}
                  </Button>
                  <Button type="button" variant="outline" className="rounded-xl" onClick={() => { setEditing(false); reset(); }}>
                    Отмена
                  </Button>
                </div>
              </form>
            ) : (
              <div className="rounded-2xl border border-border/60 bg-card p-6">
                <h2 className="font-display font-semibold text-base mb-4 text-muted-foreground uppercase tracking-wider text-xs">
                  Информация
                </h2>
                <dl className="space-y-0 divide-y divide-border/50">
                  {[
                    { label: 'Имя', value: `${user?.firstName} ${user?.lastName}` },
                    { label: 'Email', value: user?.email ?? '—' },
                    { label: 'Телефон', value: user?.phone ?? '—' },
                    { label: 'Telegram', value: user?.telegramUsername ? `@${user.telegramUsername}` : '—' },
                    { label: 'На платформе с', value: user?.createdAt ? formatDate(user.createdAt) : '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center py-3 text-sm">
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Coming soon sections */}
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10', title: 'Статистика', desc: 'Игровая статистика — очки, передачи, эффективность' },
                { icon: Trophy, color: 'text-violet-400', bg: 'bg-violet-400/10', title: 'Достижения', desc: 'Бейджи, ранги и награды за активность' },
              ].map(({ icon: Icon, color, bg, title, desc }) => (
                <div key={title} className="rounded-2xl border border-dashed border-border/50 bg-card/30 p-5 flex items-start gap-4">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', bg)}>
                    <Icon className={cn('w-5 h-5', color)} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-semibold text-sm">{title}</h3>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Скоро</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* My Runs Tab */}
        {tab === 'runs' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            {myRunsData?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myRunsData.map((run: any) => (
                  <OpenRunCard key={run.id} run={run} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/50 bg-card/20 p-14 text-center flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Zap className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg mb-1">Ещё нет организованных игр</h3>
                  <p className="text-sm text-muted-foreground">Создай первый Pickup Game и зови людей.</p>
                </div>
                <Button asChild variant="gold" className="rounded-xl shadow-[0_0_20px_hsl(43_85%_53%/0.25)]">
                  <Link href="/pickup-games/create">Создать Pickup Game</Link>
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Participations Tab */}
        {tab === 'participations' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            {participationsData?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {participationsData.map((p: any) => (
                  <OpenRunCard key={p.id} run={p.openRun} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/50 bg-card/20 p-14 text-center flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-sky-400/10 flex items-center justify-center">
                  <Star className="w-7 h-7 text-sky-400" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg mb-1">Ты ещё ни в чём не участвовал</h3>
                  <p className="text-sm text-muted-foreground">Записывайся на ближайшие Pickup Games.</p>
                </div>
                <Button asChild variant="outline" className="rounded-xl">
                  <Link href="/pickup-games">Найти игру <ChevronRight className="w-4 h-4 ml-1" /></Link>
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Submissions Tab */}
        {tab === 'submissions' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-3">
              <Link
                href="/courts/suggest"
                className="group flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 hover:border-emerald-400/40 hover:bg-emerald-400/5 transition-all duration-200"
              >
                <span className="w-11 h-11 rounded-xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </span>
                <div>
                  <div className="font-display font-bold text-sm group-hover:text-emerald-400 transition-colors">Предложить корт</div>
                  <div className="text-xs text-muted-foreground">Добавь площадку на карту</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-emerald-400 transition-colors" />
              </Link>
              <Link
                href="/news/suggest"
                className="group flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 hover:border-sky-400/40 hover:bg-sky-400/5 transition-all duration-200"
              >
                <span className="w-11 h-11 rounded-xl bg-sky-400/10 text-sky-400 flex items-center justify-center shrink-0">
                  <Newspaper className="w-5 h-5" />
                </span>
                <div>
                  <div className="font-display font-bold text-sm group-hover:text-sky-400 transition-colors">Предложить новость</div>
                  <div className="text-xs text-muted-foreground">Поделись новостью сообщества</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-sky-400 transition-colors" />
              </Link>
            </div>
            <MySubmissions />
          </motion.div>
        )}
      </div>
    </div>
  );
}
