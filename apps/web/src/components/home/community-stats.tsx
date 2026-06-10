'use client';

import { MapPin, Zap, Users, Newspaper } from 'lucide-react';
import { useCommunityOverview } from '@/hooks/use-community';
import { cn } from '@/lib/utils';

const ITEMS = [
  { key: 'courts', label: 'кортов на карте', icon: MapPin },
  { key: 'gamesThisWeek', label: 'игр на этой неделе', icon: Zap },
  { key: 'players', label: 'игроков в сообществе', icon: Users },
  { key: 'news', label: 'материалов', icon: Newspaper },
] as const;

export function CommunityStats({ className }: { className?: string }) {
  const { data, isLoading } = useCommunityOverview();
  const stats = data?.stats;

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-3', className)}>
      {ITEMS.map(({ key, label, icon: Icon }) => {
        const value = stats?.[key];
        return (
          <div
            key={key}
            className="rounded-xl border border-border bg-card/60 p-4 flex flex-col items-center text-center gap-1"
          >
            <Icon className="w-5 h-5 text-primary mb-1" />
            <span className="font-display font-black text-2xl md:text-3xl tabular-nums">
              {isLoading ? '—' : (value ?? 0)}
            </span>
            <span className="text-[11px] md:text-xs text-muted-foreground leading-tight">
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
