'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import { useOpenRun, useJoinOpenRun, useLeaveOpenRun, useCancelOpenRun, useRemoveParticipant } from '@/hooks/use-open-runs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import {
  Calendar, Clock, MapPin, Users, Wallet, ArrowLeft,
  User, CheckCircle, XCircle, Lock, X,
} from 'lucide-react';
import { formatDate, formatPrice, getInitials } from '@/lib/utils';
import { SKILL_META, type SkillLevel } from '@/lib/pickup';

const STATUS_LABELS: Record<string, { label: string; variant: any }> = {
  OPEN: { label: 'Открыт', variant: 'success' },
  CLOSED: { label: 'Регистрация закрыта', variant: 'warning' },
  CANCELLED: { label: 'Отменён', variant: 'destructive' },
  COMPLETED: { label: 'Завершён', variant: 'secondary' },
};

export function OpenRunDetailContent({ id }: { id: string }) {
  const { data: run, isLoading } = useOpenRun(id);
  const { user, isAuthenticated } = useAuth();
  const removeParticipant = useRemoveParticipant();
  const { mutate: join, isPending: joining } = useJoinOpenRun();
  const { mutate: leave, isPending: leaving } = useLeaveOpenRun();
  const { mutate: cancel, isPending: cancelling } = useCancelOpenRun();

  if (isLoading) {
    return (
      <div className="container-page py-8 max-w-4xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!run) {
    return (
      <div className="container-page py-8 text-center">
        <p className="text-muted-foreground">Игра не найдена</p>
      </div>
    );
  }

  const isOrganizer = user?.id === run.organizerId;
  const myParticipation = run.participants?.find((p: any) => p.userId === user?.id);
  const spotsLeft = run.spotsLeft ?? run.maxParticipants - run.currentParticipants;
  const isFull = spotsLeft <= 0;
  const waitlistCount = run.waitlistCount ?? 0;
  const skill = run.skillLevel && run.skillLevel !== 'ANY' ? SKILL_META[run.skillLevel as SkillLevel] : null;
  const statusInfo = STATUS_LABELS[run.status] ?? { label: run.status, variant: 'secondary' };

  const handleJoin = () => {
    join(id, {
      onSuccess: (p: any) => {
        if (p?.status === 'WAITLISTED') {
          toast.success('Вы в листе ожидания — освободится место, и вы в игре');
        } else if (p?.status === 'PENDING') {
          toast.success('Заявка отправлена организатору');
        } else {
          toast.success('Вы записались на игру!');
        }
      },
      onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Ошибка'),
    });
  };

  const handleLeave = () => {
    leave(id, {
      onSuccess: () => toast.success('Участие отменено'),
      onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Ошибка'),
    });
  };

  const handleCancel = () => {
    if (!confirm('Отменить игру?')) return;
    cancel(id, {
      onSuccess: () => toast.success('Игра отменена'),
      onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Ошибка'),
    });
  };

  return (
    <div className="container-page py-8 max-w-4xl">
      <Link
        href="/pickup-games"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Pickup Games
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="font-display font-bold text-2xl md:text-3xl">
                {run.title ?? 'Pickup Game'}
              </h1>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                {skill && (
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${skill.cls}`}>
                    {skill.label}
                  </span>
                )}
              </div>
            </div>

            <Link
              href={`/courts/${run.court?.slug ?? run.courtId}`}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="text-sm">{run.court.name} — {run.court.address}</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Calendar, label: 'Дата', value: formatDate(run.date, 'd MMMM yyyy') },
              { icon: Clock, label: 'Время', value: `${run.startTime}–${run.endTime}` },
              {
                icon: Users,
                label: 'Участники',
                value: `${run.currentParticipants} / ${run.maxParticipants}`,
              },
              {
                icon: Wallet,
                label: 'Взнос',
                value: run.fee === 0 ? 'Бесплатно' : formatPrice(run.fee),
              },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-lg border border-border bg-card/50 p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <Icon className="w-3.5 h-3.5 text-primary/70" />
                  {label}
                </div>
                <div className="font-semibold text-sm">{value}</div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-card/30 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {run.isPublic ? (
                <><Users className="w-4 h-4 text-green-400" /> Открытый — все могут записаться</>
              ) : (
                <><Lock className="w-4 h-4 text-yellow-400" /> Закрытый — участие по одобрению организатора</>
              )}
            </div>
          </div>

          {run.description && (
            <div>
              <h2 className="font-display font-semibold text-lg mb-2">Описание</h2>
              <p className="text-muted-foreground">{run.description}</p>
            </div>
          )}

          {/* Participants list (for organizer) */}
          {isOrganizer && run.participants?.length > 0 && (
            <div>
              <h2 className="font-display font-semibold text-lg mb-3">Участники</h2>
              <div className="space-y-2">
                {run.participants.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-card/30 p-3">
                    <Link href={`/players/${p.userId}`} className="flex items-center gap-2 group">
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                        {getInitials(p.user.firstName, p.user.lastName)}
                      </div>
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">
                        {p.user.firstName} {p.user.lastName}
                      </span>
                    </Link>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          p.status === 'APPROVED'
                            ? 'success'
                            : p.status === 'PENDING'
                            ? 'warning'
                            : p.status === 'WAITLISTED'
                            ? 'secondary'
                            : 'destructive'
                        }
                        className="text-xs"
                      >
                        {p.status === 'APPROVED'
                          ? 'В игре'
                          : p.status === 'PENDING'
                          ? 'Ожидает'
                          : p.status === 'WAITLISTED'
                          ? 'Лист ожидания'
                          : 'Отклонён'}
                      </Badge>
                      <button
                        onClick={() => {
                          if (!window.confirm(`Убрать ${p.user.firstName} ${p.user.lastName} из игры?`)) return;
                          removeParticipant.mutate(
                            { runId: run.id, participantId: p.id },
                            {
                              onSuccess: () => toast.success('Участник убран из игры'),
                              onError: (err: any) =>
                                toast.error(err?.response?.data?.message ?? 'Не удалось убрать участника'),
                            },
                          );
                        }}
                        disabled={removeParticipant.isPending}
                        title="Убрать из игры"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Organizer */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-display font-semibold text-sm mb-3">Организатор</h3>
            <Link href={`/players/${run.organizerId}`} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {getInitials(run.organizer.firstName, run.organizer.lastName)}
              </div>
              <div>
                <div className="font-medium text-sm group-hover:text-primary transition-colors">
                  {run.organizer.firstName} {run.organizer.lastName}
                </div>
                <div className="text-xs text-muted-foreground">Организатор</div>
              </div>
            </Link>
          </div>

          {/* Action */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Свободных мест:</span>
              <span className={isFull ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                {isFull ? '0' : spotsLeft}
              </span>
            </div>
            {waitlistCount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">В листе ожидания:</span>
                <span className="text-amber-400 font-semibold">{waitlistCount}</span>
              </div>
            )}

            {!isAuthenticated ? (
              <Button asChild className="w-full" variant="gold">
                <Link href="/auth/login">Войти для записи</Link>
              </Button>
            ) : isOrganizer ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center">Вы организатор</p>
                {run.status === 'OPEN' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={handleCancel}
                    disabled={cancelling}
                  >
                    Отменить игру
                  </Button>
                )}
              </div>
            ) : myParticipation ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {myParticipation.status === 'APPROVED' ? (
                    <><CheckCircle className="w-4 h-4 text-emerald-400" /> Вы в игре</>
                  ) : myParticipation.status === 'WAITLISTED' ? (
                    <><Clock className="w-4 h-4 text-amber-400" /> Вы в листе ожидания</>
                  ) : myParticipation.status === 'PENDING' ? (
                    <><Clock className="w-4 h-4 text-yellow-400" /> Заявка рассматривается</>
                  ) : (
                    <><XCircle className="w-4 h-4 text-destructive" /> Заявка отклонена</>
                  )}
                </div>
                {['APPROVED', 'PENDING', 'WAITLISTED'].includes(myParticipation.status) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleLeave}
                    disabled={leaving}
                  >
                    {myParticipation.status === 'WAITLISTED' ? 'Выйти из листа ожидания' : 'Отменить участие'}
                  </Button>
                )}
              </div>
            ) : run.status === 'OPEN' ? (
              <Button
                variant={isFull ? 'outline' : 'gold'}
                className="w-full"
                onClick={handleJoin}
                disabled={joining}
              >
                {joining
                  ? 'Записываемся...'
                  : isFull
                    ? 'В лист ожидания'
                    : run.isPublic
                      ? 'Записаться'
                      : 'Подать заявку'}
              </Button>
            ) : (
              <p className="text-sm text-center text-muted-foreground">
                Регистрация закрыта
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
