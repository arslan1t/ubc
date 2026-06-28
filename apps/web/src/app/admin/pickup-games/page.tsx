'use client';

import { Ban, Lock } from 'lucide-react';
import { useAdminOpenRuns, useAdminCancelOpenRun } from '@/hooks/use-open-runs';
import { formatDate, cn } from '@/lib/utils';

const STATUS_META: Record<string, { label: string; cls: string }> = {
  DRAFT: { label: 'Черновик', cls: 'bg-secondary text-muted-foreground' },
  OPEN: { label: 'Открыт', cls: 'bg-emerald-500/15 text-emerald-400' },
  CLOSED: { label: 'Закрыт', cls: 'bg-amber-500/15 text-amber-400' },
  CANCELLED: { label: 'Отменён', cls: 'bg-destructive/15 text-destructive' },
  COMPLETED: { label: 'Завершён', cls: 'bg-secondary text-muted-foreground' },
};

export default function AdminPickupGamesPage() {
  const { data, isLoading } = useAdminOpenRuns();
  const adminCancel = useAdminCancelOpenRun();
  const runs = data?.data ?? [];

  const handleCancel = (run: any) => {
    if (!window.confirm(`Отменить игру "${run.title ?? run.court.name}"?`)) return;
    adminCancel.mutate(run.id);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl md:text-3xl">Pickup Games</h1>
        <p className="text-muted-foreground text-sm mt-1">Все игры на платформе, включая закрытые и приватные</p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-secondary/40 animate-pulse" />)}
        </div>
      ) : runs.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-12">Игр пока нет</p>
      ) : (
        <div className="space-y-2">
          {runs.map((run: any) => {
            const status = STATUS_META[run.status] ?? { label: run.status, cls: 'bg-secondary text-muted-foreground' };
            return (
              <div key={run.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate flex items-center gap-1.5">
                    {run.title ?? run.court.name}
                    {!run.isPublic && <Lock className="w-3 h-3 text-muted-foreground" />}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {run.court.name} · {formatDate(run.date, 'd MMM yyyy')}, {run.startTime}–{run.endTime} ·
                    {' '}{run.organizer.firstName} {run.organizer.lastName} ·
                    {' '}{run.currentParticipants}/{run.maxParticipants}
                  </div>
                </div>
                <span className={cn('text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1', status.cls)}>
                  {status.label}
                </span>
                {run.status !== 'CANCELLED' && run.status !== 'COMPLETED' && (
                  <button onClick={() => handleCancel(run)} disabled={adminCancel.isPending}
                    className="p-2 rounded-lg hover:bg-destructive/10 transition-colors disabled:opacity-50">
                    <Ban className="w-4 h-4 text-destructive" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
