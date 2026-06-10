'use client';

import Link from 'next/link';
import { Zap, MapPin, Newspaper, Star, Activity } from 'lucide-react';
import { useCommunityOverview, type ActivityItem } from '@/hooks/use-community';
import { formatRelativeDate, cn } from '@/lib/utils';

const ICONS: Record<ActivityItem['type'], typeof Zap> = {
  game: Zap,
  court: MapPin,
  news: Newspaper,
  review: Star,
};

const ICON_COLORS: Record<ActivityItem['type'], string> = {
  game: 'text-primary bg-primary/10',
  court: 'text-emerald-400 bg-emerald-400/10',
  news: 'text-sky-400 bg-sky-400/10',
  review: 'text-amber-400 bg-amber-400/10',
};

export function ActivityFeed({ className }: { className?: string }) {
  const { data, isLoading } = useCommunityOverview();
  const items = data?.activity ?? [];

  return (
    <div className={cn('rounded-2xl border border-border bg-card/40 p-5', className)}>
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-primary" />
        <h3 className="font-display font-bold text-sm uppercase tracking-wider">
          Активность сообщества
        </h3>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-secondary/40 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          Пока тихо. Организуй первую игру — и стань началом движения.
        </p>
      ) : (
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = ICONS[item.type];
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 -mx-2 hover:bg-secondary/50 transition-colors group"
                >
                  <span
                    className={cn(
                      'shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                      ICON_COLORS[item.type],
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="flex-1 min-w-0 text-sm leading-snug truncate group-hover:text-primary transition-colors">
                    {item.title}
                  </span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {formatRelativeDate(item.createdAt)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
