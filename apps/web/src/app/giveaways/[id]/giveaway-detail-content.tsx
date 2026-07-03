'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Gift, Trophy, Users, CheckCircle2, Clock3, XCircle,
  ListChecks, Sparkles,
} from 'lucide-react';
import {
  useGiveaway,
  useMyGiveawayEntry,
  useEnterGiveaway,
  useLeaveGiveaway,
  useDrawGiveaway,
} from '@/hooks/use-giveaways';
import { useAuth } from '@/hooks/use-auth';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FortuneWheel } from '@/components/giveaways/fortune-wheel';
import { getInitials, cn } from '@/lib/utils';

export function GiveawayDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const { data: g, isLoading } = useGiveaway(id, true);
  const { data: myEntry } = useMyGiveawayEntry(id, isAuthenticated);
  const enter = useEnterGiveaway(id);
  const leave = useLeaveGiveaway(id);
  const draw = useDrawGiveaway(id);

  const [comment, setComment] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [spinTarget, setSpinTarget] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [revealedWinner, setRevealedWinner] = useState<{ firstName: string; lastName: string } | null>(null);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  if (isLoading) {
    return (
      <div className="container-page py-8 max-w-3xl space-y-4">
        <Skeleton className="h-56 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  if (!g) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-muted-foreground mb-4">Розыгрыш не найден</p>
        <Link href="/giveaways" className="text-primary hover:underline text-sm">
          Все розыгрыши →
        </Link>
      </div>
    );
  }

  const pool = g.entries;
  const segments = pool.map((e) => ({
    id: e.userId,
    label: `${e.user.firstName} ${e.user.lastName.charAt(0)}.`.trim(),
  }));

  const handleDraw = () => {
    if (!window.confirm(`Крутим колесо? В пуле ${pool.length} участников. Отменить будет нельзя.`)) return;
    draw.mutate(undefined, {
      onSuccess: (data) => {
        setSpinTarget(data.winnerIndex);
        setSpinning(true);
        setRevealedWinner(null);
        // Winner name is revealed by onSpinEnd, not immediately.
        setTimeout(() => {
          setRevealedWinner(data.winner ? { firstName: data.winner.firstName, lastName: data.winner.lastName } : null);
        }, 6200);
      },
    });
  };

  const handleSpinEnd = () => {
    setSpinning(false);
    queryClient.invalidateQueries({ queryKey: ['giveaways', id] });
    queryClient.invalidateQueries({ queryKey: ['giveaways'] });
  };

  const showWheel = pool.length > 0;
  const drawDone = g.status === 'COMPLETED' && g.winner;

  return (
    <div className="container-page py-8 max-w-3xl">
      <Link
        href="/giveaways"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Все розыгрыши
      </Link>

      {/* Hero */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden mb-6">
        <div className="relative aspect-[21/9] bg-gradient-to-br from-primary/20 to-primary/5">
          {(g.bannerUrl ?? g.coverUrl) ? (
            <Image src={(g.bannerUrl ?? g.coverUrl)!} alt={g.title} fill className="object-cover" priority quality={90} sizes="(max-width: 768px) 100vw, 768px" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Gift className="w-16 h-16 text-primary/40" />
            </div>
          )}
          <span
            className={cn(
              'absolute top-4 left-4 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider border',
              g.status === 'OPEN'
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-white/10 text-white/60 border-white/15',
            )}
          >
            {g.status === 'OPEN' ? 'Идёт набор участников' : 'Розыгрыш завершён'}
          </span>
        </div>
        <div className="p-5 md:p-6">
          <h1 className="font-display font-black text-2xl md:text-3xl mb-2">{g.title}</h1>
          <p className="flex items-center gap-2 text-primary font-bold mb-3">
            <Trophy className="w-4 h-4" /> Приз: {g.prize}
          </p>
          {g.description && (
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{g.description}</p>
          )}
        </div>
      </div>

      {/* Conditions */}
      {g.conditions && (
        <div className="rounded-2xl border border-primary/25 bg-primary/5 p-5 mb-6">
          <h2 className="flex items-center gap-2 font-display font-bold text-sm uppercase tracking-widest mb-3">
            <ListChecks className="w-4 h-4 text-primary" /> Условия участия
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{g.conditions}</p>
        </div>
      )}

      {/* Entry status / apply */}
      {g.status === 'OPEN' && (
        <div className="rounded-2xl border border-border/60 bg-card p-5 mb-6">
          {!isAuthenticated ? (
            <Button variant="gold" className="w-full" onClick={() => router.push(`/auth/login?redirect=/giveaways/${id}`)}>
              Войти и участвовать
            </Button>
          ) : myEntry?.status === 'PENDING' ? (
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-amber-400 font-semibold text-sm">
                <Clock3 className="w-4 h-4" /> Заявка на проверке
              </div>
              <p className="text-xs text-muted-foreground">Мы проверим выполнение условий и добавим тебя в пул.</p>
              <button
                onClick={() => leave.mutate()}
                disabled={leave.isPending}
                className="text-xs text-muted-foreground hover:text-destructive underline transition-colors"
              >
                Отозвать заявку
              </button>
            </div>
          ) : myEntry?.status === 'APPROVED' ? (
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-2 text-emerald-400 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4" /> Ты в пуле розыгрыша!
              </div>
              <p className="text-xs text-muted-foreground">Осталось дождаться колеса. Удачи! 🍀</p>
            </div>
          ) : myEntry?.status === 'REJECTED' && !showForm ? (
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-red-400 font-semibold text-sm">
                <XCircle className="w-4 h-4" /> Заявка отклонена
              </div>
              <p className="text-xs text-muted-foreground">Проверь условия и попробуй ещё раз.</p>
              <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
                Подать снова
              </Button>
            </div>
          ) : showForm || !myEntry ? (
            showForm ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  enter.mutate(comment || undefined, { onSuccess: () => setShowForm(false) });
                }}
                className="space-y-3"
              >
                <label className="text-xs text-muted-foreground block">
                  Подтверждение условий (ссылка на репост, ник и т.п.) — необязательно
                </label>
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={300}
                  placeholder="Например: @my_username, репост в сторис"
                  className="w-full h-10 rounded-lg border border-input bg-input px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <div className="flex gap-2">
                  <Button type="submit" variant="gold" className="flex-1" disabled={enter.isPending}>
                    {enter.isPending ? 'Отправляем…' : 'Отправить заявку'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Отмена
                  </Button>
                </div>
              </form>
            ) : (
              <Button variant="gold" className="w-full" onClick={() => setShowForm(true)}>
                Участвовать в розыгрыше
              </Button>
            )
          ) : null}
        </div>
      )}

      {/* Wheel */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 mb-6">
        <h2 className="flex items-center gap-2 font-display font-bold text-sm uppercase tracking-widest mb-5 justify-center">
          <Sparkles className="w-4 h-4 text-primary" /> Колесо розыгрыша
        </h2>

        {drawDone && !spinning && !revealedWinner ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-sm text-muted-foreground mb-1">Победитель</p>
            <p className="font-display font-black text-2xl text-primary">
              {g.winner!.firstName} {g.winner!.lastName}
            </p>
          </div>
        ) : showWheel ? (
          <>
            <FortuneWheel
              segments={segments}
              spinning={spinning}
              targetIndex={spinTarget}
              onSpinEnd={handleSpinEnd}
            />
            {revealedWinner && (
              <div className="text-center mt-5">
                <p className="text-sm text-muted-foreground mb-1">🎉 Победитель</p>
                <p className="font-display font-black text-2xl text-primary">
                  {revealedWinner.firstName} {revealedWinner.lastName}
                </p>
              </div>
            )}
            {isAdmin && g.status === 'OPEN' && !spinning && (
              <div className="mt-6 text-center">
                <Button variant="gold" size="lg" onClick={handleDraw} disabled={draw.isPending}>
                  {draw.isPending ? 'Запускаем…' : `Крутить колесо (${pool.length})`}
                </Button>
                <p className="text-[11px] text-muted-foreground mt-2">
                  Победителя выбирает сервер криптослучайно — колесо покажет результат
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">
            Пул пока пуст — участники появятся здесь после проверки заявок
          </p>
        )}
      </div>

      {/* Pool */}
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <h2 className="flex items-center gap-2 font-display font-bold text-sm uppercase tracking-widest mb-4">
          <Users className="w-4 h-4 text-primary" /> Пул участников ({pool.length})
        </h2>
        {pool.length === 0 ? (
          <p className="text-sm text-muted-foreground">Пока никого — будь первым!</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {pool.map((e) => (
              <Link
                key={e.id}
                href={`/players/${e.userId}`}
                className={cn(
                  'flex items-center gap-2 rounded-full bg-white/5 pl-1 pr-3 py-1 hover:bg-white/10 transition-colors',
                  g.winnerId === e.userId && 'ring-1 ring-primary bg-primary/10',
                )}
              >
                {e.user.avatarUrl ? (
                  <Image src={e.user.avatarUrl} alt="" width={24} height={24} className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                    {getInitials(e.user.firstName, e.user.lastName)}
                  </span>
                )}
                <span className="text-xs font-medium">
                  {e.user.firstName}
                  {g.winnerId === e.userId && ' 🏆'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
