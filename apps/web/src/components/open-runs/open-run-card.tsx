import Link from 'next/link';
import { Clock, MapPin, Users, Wallet, Lock, ChevronRight } from 'lucide-react';
import { formatDate, formatPrice, pluralize, cn } from '@/lib/utils';
import { SKILL_META, type SkillLevel } from '@/lib/pickup';

interface OpenRunCardProps {
  run: {
    id: string;
    title?: string;
    court: { name: string; address: string; city: string };
    organizer?: { firstName: string; lastName: string };
    date: string;
    startTime: string;
    endTime: string;
    maxParticipants: number;
    currentParticipants: number;
    waitlistCount?: number;
    spotsLeft?: number;
    fee: number;
    isPublic: boolean;
    status: string;
    skillLevel?: SkillLevel;
  };
  compact?: boolean;
  className?: string;
}

function getDateParts(dateStr: string) {
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = d.toLocaleString('ru-RU', { month: 'short' }).replace('.', '');
  const weekday = d.toLocaleString('ru-RU', { weekday: 'short' });
  return { day, month, weekday };
}

export function OpenRunCard({ run, compact, className }: OpenRunCardProps) {
  const spotsLeft = run.spotsLeft ?? run.maxParticipants - run.currentParticipants;
  const isFull = spotsLeft <= 0;
  const waitlist = run.waitlistCount ?? 0;
  const skill = run.skillLevel && run.skillLevel !== 'ANY' ? SKILL_META[run.skillLevel] : null;
  const isCancelled = run.status === 'CANCELLED';
  const { day, month, weekday } = getDateParts(run.date);
  const fillPercent = Math.min(100, (run.currentParticipants / run.maxParticipants) * 100);

  if (compact) {
    return (
      <Link href={`/pickup-games/${run.id}`} className={cn('group block', className)}>
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 p-3 hover:border-primary/40 hover:bg-card transition-all duration-200">
          {/* Date badge */}
          <div className="shrink-0 w-10 text-center">
            <div className="font-display font-black text-xl leading-none text-primary">{day}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{month}</div>
          </div>
          <div className="w-px h-8 bg-border/60 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
              {run.title ?? run.court.name}
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {run.startTime}–{run.endTime}
              <span className="text-border">·</span>
              <Users className="w-3 h-3" />
              {run.currentParticipants}/{run.maxParticipants}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/pickup-games/${run.id}`} className={cn('group block', className)}>
      <div className={cn(
        'relative rounded-2xl border overflow-hidden transition-all duration-300',
        isCancelled
          ? 'border-border/40 opacity-60'
          : 'border-border/60 hover:border-primary/40 hover:-translate-y-1 hover:shadow-[0_8px_32px_hsl(43_85%_53%/0.1)]',
      )}>
        {/* Top color strip — varies by status */}
        <div className={cn(
          'h-1 w-full',
          isCancelled ? 'bg-destructive/40' :
          isFull ? 'bg-amber-500/60' :
          'bg-gradient-to-r from-primary/80 via-primary to-primary/60',
        )} />

        <div className="bg-card p-4 md:p-5">
          <div className="flex gap-4">
            {/* Date column */}
            <div className="shrink-0 flex flex-col items-center justify-center w-14 rounded-xl bg-primary/10 border border-primary/20 py-2">
              <span className="font-display font-black text-2xl leading-none text-primary">{day}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70 mt-0.5">{month}</span>
              <span className="text-[10px] text-muted-foreground mt-0.5 capitalize">{weekday}</span>
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display font-bold text-base leading-tight group-hover:text-primary transition-colors line-clamp-1">
                  {run.title ?? `Pickup Game · ${run.court.name}`}
                </h3>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {skill && (
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', skill.cls)}>
                      {skill.short}
                    </span>
                  )}
                  {!run.isPublic && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Lock className="w-3 h-3" />
                      Закрытый
                    </span>
                  )}
                  {isCancelled && (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-destructive/15 text-destructive border border-destructive/30">
                      Отменён
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3 shrink-0 text-primary/60" />
                <span className="truncate">{run.court.name}, {run.court.address}</span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-xs">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 text-primary/60" />
                  {run.startTime}–{run.endTime}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Wallet className="w-3.5 h-3.5 text-primary/60" />
                  {run.fee === 0 ? (
                    <span className="text-emerald-400 font-semibold">Бесплатно</span>
                  ) : formatPrice(run.fee)}
                </span>
              </div>
            </div>
          </div>

          {/* Participation bar */}
          <div className="mt-4 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between mb-1.5 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                <span className="font-semibold text-foreground">{run.currentParticipants}</span>
                <span>/ {run.maxParticipants}</span>
              </span>
              {!isCancelled && (
                isFull ? (
                  <span className="font-semibold text-amber-400">
                    {waitlist > 0 ? `+${waitlist} в очереди` : 'Мест нет'}
                  </span>
                ) : (
                  <span className="font-semibold text-emerald-400">
                    {pluralize(spotsLeft, 'место', 'места', 'мест')} свободно
                  </span>
                )
              )}
            </div>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  isFull ? 'bg-amber-500' : 'bg-primary',
                )}
                style={{ width: `${fillPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
