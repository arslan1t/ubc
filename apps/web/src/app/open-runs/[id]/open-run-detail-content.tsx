'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import { useOpenRun, useJoinOpenRun, useLeaveOpenRun, useCancelOpenRun } from '@/hooks/use-open-runs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import {
  Calendar, Clock, MapPin, Users, Wallet, ArrowLeft,
  User, CheckCircle, XCircle, Lock,
} from 'lucide-react';
import { formatDate, formatPrice, getInitials, pluralize } from '@/lib/utils';

const STATUS_LABELS: Record<string, { label: string; variant: any }> = {
  OPEN: { label: 'Открыт', variant: 'success' },
  CLOSED: { label: 'Регистрация закрыта', variant: 'warning' },
  CANCELLED: { label: 'Отменён', variant: 'destructive' },
  COMPLETED: { label: 'Завершён', variant: 'secondary' },
};

export function OpenRunDetailContent({ id }: { id: string }) {
  const { data: run, isLoading } = useOpenRun(id);
  const { user, isAuthenticated } = useAuth();
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
        <p className="text-muted-foreground">Open Run не найден</p>
      </div>
    );
  }

  const isOrganizer = user?.id === run.organizerId;
  const myParticipation = run.participants?.find((p: any) => p.userId === user?.id);
  const spotsLeft = run.maxParticipants - run.currentParticipants;
  const isFull = spotsLeft <= 0;
  const statusInfo = STATUS_LABELS[run.status] ?? { label: run.status, variant: 'secondary' };

  const handleJoin = () => {
    join(id, {
      onSuccess: () => toast.success('Заявка отправлена!'),
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
    if (!confirm('Отменить Open Run?')) return;
    cancel(id, {
      onSuccess: () => toast.success('Open Run отменён'),
      onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Ошибка'),
    });
  };

  return (
    <div className="container-page py-8 max-w-4xl">
      <Link
        href="/open-runs"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Open Runs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="font-display font-bold text-2xl md:text-3xl">
                {run.title ?? `Open Run`}
              </h1>
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
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
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                        {getInitials(p.user.firstName, p.user.lastName)}
                      </div>
                      <span className="text-sm font-medium">
                        {p.user.firstName} {p.user.lastName}
                      </span>
                    </div>
                    <Badge
                      variant={
                        p.status === 'APPROVED'
                          ? 'success'
                          : p.status === 'PENDING'
                          ? 'warning'
                          : 'destructive'
                      }
                      className="text-xs"
                    >
                      {p.status === 'APPROVED' ? 'Одобрен' : p.status === 'PENDING' ? 'Ожидает' : 'Отклонён'}
                    </Badge>
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {getInitials(run.organizer.firstName, run.organizer.lastName)}
              </div>
              <div>
                <div className="font-medium text-sm">
                  {run.organizer.firstName} {run.organizer.lastName}
                </div>
                <div className="text-xs text-muted-foreground">Организатор</div>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Свободных мест:</span>
              <span className={isFull ? 'text-destructive font-semibold' : 'text-green-400 font-semibold'}>
                {isFull ? '0' : spotsLeft}
              </span>
            </div>

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
                    Отменить Open Run
                  </Button>
                )}
              </div>
            ) : myParticipation ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {myParticipation.status === 'APPROVED' ? (
                    <><CheckCircle className="w-4 h-4 text-green-400" /> Вы участвуете</>
                  ) : myParticipation.status === 'PENDING' ? (
                    <><Clock className="w-4 h-4 text-yellow-400" /> Заявка рассматривается</>
                  ) : (
                    <><XCircle className="w-4 h-4 text-destructive" /> Заявка отклонена</>
                  )}
                </div>
                {['APPROVED', 'PENDING'].includes(myParticipation.status) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleLeave}
                    disabled={leaving}
                  >
                    Отменить участие
                  </Button>
                )}
              </div>
            ) : run.status === 'OPEN' && !isFull ? (
              <Button
                variant="gold"
                className="w-full"
                onClick={handleJoin}
                disabled={joining}
              >
                {joining ? 'Записываемся...' : run.isPublic ? 'Записаться' : 'Подать заявку'}
              </Button>
            ) : run.status !== 'OPEN' ? (
              <p className="text-sm text-center text-muted-foreground">
                Регистрация закрыта
              </p>
            ) : (
              <p className="text-sm text-center text-destructive">
                Мест нет
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
