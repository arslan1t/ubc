'use client';

import { useState } from 'react';
import { Check, X, RotateCcw, MapPin, Newspaper, Camera, Flag, Trophy, Calendar } from 'lucide-react';
import {
  useModerationQueue,
  useApproveSubmission,
  useRejectSubmission,
  useRequestChanges,
  type Submission,
  type SubmissionType,
} from '@/hooks/use-moderation';
import { formatRelativeDate, getInitials, cn } from '@/lib/utils';

const STATUS_TABS = [
  { key: 'PENDING', label: 'Ожидают' },
  { key: 'CHANGES_REQUESTED', label: 'На доработке' },
  { key: 'APPROVED', label: 'Одобрено' },
  { key: 'REJECTED', label: 'Отклонено' },
];

const TYPE_TABS: { key: SubmissionType | ''; label: string }[] = [
  { key: '', label: 'Все типы' },
  { key: 'COURT', label: 'Корты' },
  { key: 'NEWS', label: 'Новости' },
  { key: 'PHOTO', label: 'Фото' },
  { key: 'REPORT', label: 'Жалобы' },
  { key: 'EVENT', label: 'События' },
  { key: 'RESULT', label: 'Результаты' },
];

const TYPE_META: Record<SubmissionType, { label: string; icon: typeof MapPin; color: string }> = {
  COURT: { label: 'Корт', icon: MapPin, color: 'text-emerald-400 bg-emerald-400/10' },
  NEWS: { label: 'Новость', icon: Newspaper, color: 'text-sky-400 bg-sky-400/10' },
  PHOTO: { label: 'Фото', icon: Camera, color: 'text-pink-400 bg-pink-400/10' },
  REPORT: { label: 'Жалоба', icon: Flag, color: 'text-red-400 bg-red-400/10' },
  EVENT: { label: 'Событие', icon: Calendar, color: 'text-purple-400 bg-purple-400/10' },
  RESULT: { label: 'Результат', icon: Trophy, color: 'text-amber-400 bg-amber-400/10' },
};

function payloadSummary(s: Submission): { title: string; lines: string[] } {
  const p = s.payload ?? {};
  switch (s.type) {
    case 'COURT':
      return { title: p.name ?? 'Без названия', lines: [p.address, p.type, p.isFree ? 'Бесплатно' : 'Платный'].filter(Boolean) };
    case 'NEWS':
      return { title: p.title ?? 'Без заголовка', lines: [p.category, p.excerpt].filter(Boolean) };
    case 'REPORT':
      return { title: 'Жалоба', lines: [p.reason, p.message].filter(Boolean) };
    default:
      return { title: TYPE_META[s.type].label, lines: [JSON.stringify(p).slice(0, 120)] };
  }
}

export default function ModerationPage() {
  const [status, setStatus] = useState('PENDING');
  const [type, setType] = useState<SubmissionType | ''>('');
  const { data, isLoading } = useModerationQueue(type ? { status, type } : { status });
  const approve = useApproveSubmission();
  const reject = useRejectSubmission();
  const requestChanges = useRequestChanges();
  const items = data?.data ?? [];

  const handleReject = (id: string) => {
    const note = window.prompt('Причина отклонения (необязательно):');
    if (note === null) return; // cancelled — do NOT reject
    reject.mutate({ id, note: note || undefined });
  };
  const handleChanges = (id: string) => {
    const note = window.prompt('Что нужно доработать?');
    if (note === null) return; // cancelled — do NOT request changes
    requestChanges.mutate({ id, note: note || undefined });
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl md:text-3xl">Модерация</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Заявки сообщества — одобряй, отклоняй или возвращай на доработку
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setStatus(t.key)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              status === t.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/50 text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {TYPE_TABS.map((t) => (
          <button
            key={t.key || 'all'}
            onClick={() => setType(t.key)}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
              type === t.key
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground/70 hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-secondary/40 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card/30 p-12 text-center">
          <Check className="w-10 h-10 text-emerald-400/60 mx-auto mb-3" />
          <p className="text-muted-foreground">Здесь пусто — всё обработано 👌</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((s) => {
            const meta = TYPE_META[s.type];
            const Icon = meta.icon;
            const summary = payloadSummary(s);
            const busy = approve.isPending || reject.isPending || requestChanges.isPending;
            return (
              <div key={s.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  <span className={cn('shrink-0 w-9 h-9 rounded-lg flex items-center justify-center', meta.color)}>
                    <Icon className="w-4.5 h-4.5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                        {meta.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground">·</span>
                      <span className="text-[11px] text-muted-foreground">
                        {formatRelativeDate(s.createdAt)}
                      </span>
                    </div>
                    <h3 className="font-display font-semibold mt-0.5 truncate">{summary.title}</h3>
                    {summary.lines.map((l, i) => (
                      <p key={i} className="text-sm text-muted-foreground truncate">{l}</p>
                    ))}

                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                        {getInitials(s.submittedBy.firstName, s.submittedBy.lastName)}
                      </span>
                      {s.submittedBy.firstName} {s.submittedBy.lastName}
                    </div>

                    {s.reviewNote && (
                      <p className="mt-2 text-xs rounded-lg bg-secondary/50 px-3 py-2 text-muted-foreground">
                        Комментарий: {s.reviewNote}
                      </p>
                    )}
                  </div>

                  {s.status === 'PENDING' && (
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        disabled={busy}
                        onClick={() => approve.mutate({ id: s.id })}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 text-emerald-400 px-3 py-1.5 text-xs font-medium hover:bg-emerald-500/25 disabled:opacity-50 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" /> Одобрить
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => handleChanges(s.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-amber-500/15 text-amber-400 px-3 py-1.5 text-xs font-medium hover:bg-amber-500/25 disabled:opacity-50 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Доработать
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => handleReject(s.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-500/15 text-red-400 px-3 py-1.5 text-xs font-medium hover:bg-red-500/25 disabled:opacity-50 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" /> Отклонить
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
