'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { MapPin, Zap, Users, Newspaper } from 'lucide-react';
import { useCommunityOverview } from '@/hooks/use-community';
import { cn } from '@/lib/utils';

function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-20px' });

  useEffect(() => {
    if (!inView || value === 0) return;
    let start = 0;
    const duration = 1200;
    const step = 16;
    const increment = value / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, step);
    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <span ref={ref} className={className}>
      {inView ? display : 0}
    </span>
  );
}

const ITEMS = [
  { key: 'courts', label: 'кортов', sublabel: 'на карте', icon: MapPin, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { key: 'gamesThisWeek', label: 'игр', sublabel: 'на этой неделе', icon: Zap, color: 'text-primary', bg: 'bg-primary/10' },
  { key: 'players', label: 'игроков', sublabel: 'в сообществе', icon: Users, color: 'text-sky-400', bg: 'bg-sky-400/10' },
  { key: 'news', label: 'материалов', sublabel: 'о баскетболе', icon: Newspaper, color: 'text-violet-400', bg: 'bg-violet-400/10' },
] as const;

export function CommunityStats({ className, inline }: { className?: string; inline?: boolean }) {
  const { data, isLoading } = useCommunityOverview();
  const stats = data?.stats;

  if (inline) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className={cn(
          'flex items-center divide-x divide-white/[0.07] rounded-2xl overflow-hidden liquid-glass-bar',
          className,
        )}
      >
        {ITEMS.map(({ key, label, sublabel, icon: Icon, color }, i) => {
          const value = stats?.[key] ?? 0;
          return (
            <div key={key} className="flex items-center gap-3 px-5 py-3.5 flex-1">
              <Icon className={cn('w-4 h-4 shrink-0', color)} />
              <div>
                <div className="font-display font-black text-xl tabular-nums leading-none text-white">
                  {isLoading ? '—' : <AnimatedNumber value={value} />}
                </div>
                <div className="text-[10px] text-white/40 mt-0.5 leading-none">
                  <span className={cn('font-semibold', color)}>{label}</span>
                  {' '}{sublabel}
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={cn('grid grid-cols-2 md:grid-cols-4 gap-3', className)}
    >
      {ITEMS.map(({ key, label, sublabel, icon: Icon, color, bg }, i) => {
        const value = stats?.[key] ?? 0;
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 + i * 0.07 }}
            className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-4 flex flex-col gap-2.5"
          >
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', bg)}>
              <Icon className={cn('w-4.5 h-4.5', color)} />
            </div>

            <div>
              <div className="font-display font-black text-3xl md:text-4xl tabular-nums leading-none">
                {isLoading ? (
                  <span className="text-muted-foreground/30">—</span>
                ) : (
                  <AnimatedNumber value={value} />
                )}
              </div>
              <div className="mt-1">
                <span className={cn('text-xs font-semibold', color)}>{label}</span>
                <span className="text-xs text-muted-foreground"> {sublabel}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
