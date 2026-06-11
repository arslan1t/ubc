'use client';

import Link from 'next/link';
import { MapPin, Newspaper, Flag, Camera, Calendar, Trophy } from 'lucide-react';
import { useMySubmissions } from '@/hooks/use-submissions';
import type { SubmissionType, SubmissionStatus } from '@/hooks/use-moderation';
import { formatRelativeDate, cn } from '@/lib/utils';

const TYPE_META: Record<SubmissionType, { label: string; icon: typeof MapPin }> = {
  COURT: { label: 'Корт', icon: MapPin },
  NEWS: { label: 'Новость', icon: Newspaper },
  REPORT: { label: 'Жалоба', icon: Flag },
  PHOTO: { label: 'Фото', icon: Camera },
  EVENT: { label: 'Событие', icon: Calendar },
  RESULT: { label: 'Результат', icon: Trophy },
};

const STATUS_META: Record<SubmissionStatus, { label: string; cls: string }> = {
  PENDING: { label: 'На модерации', cls: 'text-amber-400 bg-amber-400/10' },
  APPROVED: { label: 'Одобрено', cls: 'text-emerald-400 bg-emerald-400/10' },
  REJECTED: { label: 'Отклонено', cls: 'text-red-400 bg-red-400/10' },
  CHANGES_REQUESTED: { label: 'На доработке', cls: 'text-sky-400 bg-sky-400/10' },
};

function title(s: { type: SubmissionType; payload: Record<string, any> }) {
  const p = s.payload ?? {};
  if (s.type === 'COURT') return p.name ?? 'Корт';
  if (s.type === 'NEWS') return p.title ?? 'Новость';
  if (s.type === 'REPORT') return p.reason ?? 'Жалоба';
  return TYPE_META[s.type].label;
}

export function MySubmissions() {
  const { data: submissions, isLoading } = useMySubmissions();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-secondary/40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!submissions?.length) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/30 p-10 text-center">
        <p className="text-muted-foreground mb-4">Ты ещё ничего не предлагал сообществу</p>
        <div className="flex flex-wrap gap-2 justify-center">
          <Link href="/courts/suggest" className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors">
            Предложить корт
          </Link>
          <Link href="/news/suggest" className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary/50 transition-colors">
            Предложить новость
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {submissions.map((s) => {
        const meta = TYPE_META[s.type];
        const Icon = meta.icon;
        const status = STATUS_META[s.status];
        return (
          <div key={s.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <span className="shrink-0 w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
              <Icon className="w-4 h-4" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{title(s)}</div>
              <div className="text-xs text-muted-foreground">
                {meta.label} · {formatRelativeDate(s.createdAt)}
                {s.status === 'APPROVED' && s.resultId && s.type === 'COURT' && (
                  <> · опубликован</>
                )}
              </div>
              {s.reviewNote && (
                <p className="text-xs text-muted-foreground mt-1 italic">«{s.reviewNote}»</p>
              )}
            </div>
            <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-xs font-medium', status.cls)}>
              {status.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
