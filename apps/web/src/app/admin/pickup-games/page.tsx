'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Ban, Lock, Pencil } from 'lucide-react';
import {
  useAdminOpenRuns,
  useAdminCancelOpenRun,
  useUpdateOpenRun,
  type OpenRunUpdateDto,
} from '@/hooks/use-open-runs';
import { formatDate, cn } from '@/lib/utils';

const STATUS_META: Record<string, { label: string; cls: string }> = {
  DRAFT: { label: 'Черновик', cls: 'bg-secondary text-muted-foreground' },
  OPEN: { label: 'Открыт', cls: 'bg-emerald-500/15 text-emerald-400' },
  CLOSED: { label: 'Закрыт', cls: 'bg-amber-500/15 text-amber-400' },
  CANCELLED: { label: 'Отменён', cls: 'bg-destructive/15 text-destructive' },
  COMPLETED: { label: 'Завершён', cls: 'bg-secondary text-muted-foreground' },
};

const SKILL_OPTIONS = [
  ['ANY', 'Любой уровень'],
  ['BEGINNER', 'Новички'],
  ['INTERMEDIATE', 'Средний'],
  ['ADVANCED', 'Продвинутый'],
] as const;

const STATUS_OPTIONS = [
  ['OPEN', 'Открыт'],
  ['CLOSED', 'Закрыт'],
  ['COMPLETED', 'Завершён'],
  ['CANCELLED', 'Отменён'],
] as const;

function toDateInput(iso: string) {
  return iso ? new Date(iso).toISOString().slice(0, 10) : '';
}

function EditRunForm({
  run,
  onClose,
}: {
  run: any;
  onClose: () => void;
}) {
  const update = useUpdateOpenRun();
  const [values, setValues] = useState<OpenRunUpdateDto>({
    title: run.title ?? '',
    description: run.description ?? '',
    date: toDateInput(run.date),
    startTime: run.startTime,
    endTime: run.endTime,
    maxParticipants: run.maxParticipants,
    fee: run.fee,
    skillLevel: run.skillLevel,
    status: run.status,
  });

  const set = <K extends keyof OpenRunUpdateDto>(key: K, v: OpenRunUpdateDto[K]) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  const inputCls =
    'w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        update.mutate(
          { id: run.id, dto: values },
          {
            onSuccess: () => {
              toast.success('Игра обновлена');
              onClose();
            },
            onError: (err: any) =>
              toast.error(err?.response?.data?.message ?? 'Не удалось обновить игру'),
          },
        );
      }}
      className="rounded-xl border border-border bg-card p-4 space-y-3 mb-4"
    >
      <h3 className="text-sm font-semibold">
        Редактирование: {run.title ?? run.court.name}
        <span className="text-muted-foreground font-normal"> · организатор {run.organizer.firstName} {run.organizer.lastName}</span>
      </h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">Название</label>
          <input value={values.title ?? ''} onChange={(e) => set('title', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Статус</label>
          <select value={values.status} onChange={(e) => set('status', e.target.value as any)} className={inputCls}>
            {STATUS_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Дата</label>
          <input type="date" value={values.date ?? ''} onChange={(e) => set('date', e.target.value)} className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted-foreground">Начало</label>
            <input type="time" value={values.startTime ?? ''} onChange={(e) => set('startTime', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Конец</label>
            <input type="time" value={values.endTime ?? ''} onChange={(e) => set('endTime', e.target.value)} className={inputCls} />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Макс. участников</label>
          <input type="number" min={2} max={50} value={values.maxParticipants ?? ''}
            onChange={(e) => set('maxParticipants', e.target.value ? parseInt(e.target.value, 10) : undefined)}
            className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Взнос (сум)</label>
          <input type="number" min={0} value={values.fee ?? ''}
            onChange={(e) => set('fee', e.target.value ? parseInt(e.target.value, 10) : 0)}
            className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Уровень</label>
          <select value={values.skillLevel} onChange={(e) => set('skillLevel', e.target.value)} className={inputCls}>
            {SKILL_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Описание</label>
        <textarea rows={2} value={values.description ?? ''} onChange={(e) => set('description', e.target.value)} className={inputCls} />
      </div>
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={update.isPending}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">
          {update.isPending ? 'Сохраняем...' : 'Сохранить'}
        </button>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium">
          Отмена
        </button>
      </div>
    </form>
  );
}

export default function AdminPickupGamesPage() {
  const { data, isLoading } = useAdminOpenRuns();
  const adminCancel = useAdminCancelOpenRun();
  const [editingId, setEditingId] = useState<string | null>(null);
  const runs = data?.data ?? [];

  const editingRun = editingId ? runs.find((r: any) => r.id === editingId) : null;

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

      {editingRun && <EditRunForm run={editingRun} onClose={() => setEditingId(null)} />}

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
                <button onClick={() => setEditingId(editingId === run.id ? null : run.id)}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Редактировать">
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </button>
                {run.status !== 'CANCELLED' && run.status !== 'COMPLETED' && (
                  <button onClick={() => handleCancel(run)} disabled={adminCancel.isPending}
                    className="p-2 rounded-lg hover:bg-destructive/10 transition-colors disabled:opacity-50" title="Отменить игру">
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
