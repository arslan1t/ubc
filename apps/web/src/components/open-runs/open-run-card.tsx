import Link from 'next/link';
import { Calendar, Clock, MapPin, Users, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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

export function OpenRunCard({ run, compact, className }: OpenRunCardProps) {
  const spotsLeft = run.spotsLeft ?? run.maxParticipants - run.currentParticipants;
  const isFull = spotsLeft <= 0;
  const waitlist = run.waitlistCount ?? 0;
  const skill = run.skillLevel && run.skillLevel !== 'ANY' ? SKILL_META[run.skillLevel] : null;

  return (
    <Link href={`/pickup-games/${run.id}`} className={cn('group block', className)}>
      <div className={cn(
        'rounded-xl border border-border bg-card overflow-hidden card-hover',
        compact ? 'p-3' : 'p-4',
      )}>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              'font-display font-semibold leading-tight group-hover:text-primary transition-colors truncate',
              compact ? 'text-sm' : 'text-base',
            )}>
              {run.title ?? `Pickup Game — ${run.court.name}`}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{run.court.name}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {skill && (
              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', skill.cls)}>
                {skill.short}
              </span>
            )}
            {!run.isPublic && (
              <Badge variant="secondary" className="text-xs">Закрытый</Badge>
            )}
            {run.status === 'CANCELLED' && (
              <Badge variant="destructive" className="text-xs">Отменён</Badge>
            )}
          </div>
        </div>

        <div className={cn(
          'grid gap-2 text-xs text-muted-foreground',
          compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4',
        )}>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary/70 shrink-0" />
            <span>{formatDate(run.date, 'd MMM')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary/70 shrink-0" />
            <span>{run.startTime}–{run.endTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-primary/70 shrink-0" />
            <span className={isFull ? 'text-amber-400' : ''}>
              {run.currentParticipants}/{run.maxParticipants}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-primary/70 shrink-0" />
            <span>{run.fee === 0 ? 'Бесплатно' : formatPrice(run.fee)}</span>
          </div>
        </div>

        {!compact && (
          <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground truncate">
              {run.organizer ? `Организатор: ${run.organizer.firstName} ${run.organizer.lastName}` : ''}
            </span>
            {run.status !== 'OPEN' ? null : !isFull ? (
              <span className="text-xs text-emerald-400 shrink-0">
                {pluralize(spotsLeft, 'место', 'места', 'мест')}
              </span>
            ) : (
              <span className="text-xs text-amber-400 shrink-0">
                {waitlist > 0 ? `Лист ожидания · ${waitlist}` : 'Запись в лист ожидания'}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
