'use client';

import Link from 'next/link';
import { Zap, MapPin, Newspaper, Star, Radio } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCommunityOverview, type ActivityItem } from '@/hooks/use-community';
import { formatRelativeDate, cn } from '@/lib/utils';

const ICONS: Record<ActivityItem['type'], typeof Zap> = {
  game: Zap,
  court: MapPin,
  news: Newspaper,
  review: Star,
};

const ICON_STYLES: Record<ActivityItem['type'], { bg: string; text: string }> = {
  game: { bg: 'bg-primary/15', text: 'text-primary' },
  court: { bg: 'bg-emerald-400/15', text: 'text-emerald-400' },
  news: { bg: 'bg-sky-400/15', text: 'text-sky-400' },
  review: { bg: 'bg-amber-400/15', text: 'text-amber-400' },
};

export function ActivityFeed({ className }: { className?: string }) {
  const { data, isLoading } = useCommunityOverview();
  const items = data?.activity ?? [];

  return (
    <div className={cn('rounded-2xl border border-border/60 bg-card/50 overflow-hidden', className)}>
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/60">
        <div className="relative flex items-center justify-center">
          <Radio className="w-4 h-4 text-primary relative z-10" />
          <span className="absolute w-2 h-2 rounded-full bg-primary animate-ping opacity-60" />
        </div>
        <h3 className="font-display font-bold text-sm uppercase tracking-widest">
          Активность
        </h3>
        {items.length > 0 && (
          <span className="ml-auto text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            LIVE
          </span>
        )}
      </div>

      <div className="p-3">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-2">
                <div className="w-8 h-8 rounded-full bg-secondary/60 animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-secondary/60 rounded animate-pulse w-4/5" />
                  <div className="h-2.5 bg-secondary/40 rounded animate-pulse w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Пока тихо.</p>
            <p className="text-xs text-muted-foreground mt-1">Организуй первую игру.</p>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {items.map((item, i) => {
              const Icon = ICONS[item.type];
              const style = ICON_STYLES[item.type];
              return (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-secondary/50 transition-colors group"
                  >
                    <span className={cn('shrink-0 w-8 h-8 rounded-full flex items-center justify-center', style.bg)}>
                      <Icon className={cn('w-3.5 h-3.5', style.text)} />
                    </span>
                    <span className="flex-1 min-w-0 text-xs leading-snug text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2">
                      {item.title}
                    </span>
                    <span className="shrink-0 text-[10px] text-muted-foreground/60 tabular-nums">
                      {formatRelativeDate(item.createdAt)}
                    </span>
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
