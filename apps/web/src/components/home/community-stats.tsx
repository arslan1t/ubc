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
  { key: 'players',      label: 'Players',  sublabel: 'in the community', icon: Users,     color: 'text-sky-400',    bg: 'bg-sky-400/10'    },
  { key: 'courts',       label: 'Courts',   sublabel: 'on the map',       icon: MapPin,    color: 'text-emerald-400',bg: 'bg-emerald-400/10'},
  { key: 'gamesThisWeek',label: 'Games',    sublabel: 'this week',        icon: Zap,       color: 'text-primary',    bg: 'bg-primary/10'    },
  { key: 'news',         label: 'Articles', sublabel: 'published',        icon: Newspaper, color: 'text-violet-400', bg: 'bg-violet-400/10' },
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
        {ITEMS.map(({ key, label, sublabel, icon: Icon, color }) => {
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
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
      className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}
    >
      {ITEMS.map(({ key, label, sublabel, icon: Icon, color, bg }, i) => {
        const value = stats?.[key] ?? 0;
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="group relative overflow-hidden rounded-2xl p-6 cursor-default transition-transform duration-300 hover:-translate-y-1"
            style={{
              background: 'rgba(17,17,17,0.85)',
              border: '1px solid rgba(212,161,30,0.12)',
            }}
          >
            {/* Subtle corner glow on hover */}
            <div
              className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
              style={{ backgroundColor: color.replace('text-', '').includes('primary') ? '#d4a11e' : undefined }}
            />

            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-5', bg)}>
              <Icon className={cn('w-5 h-5', color)} />
            </div>

            <div className="font-display font-black tabular-nums leading-none text-white mb-1.5"
              style={{ fontSize: 'clamp(2.5rem,4vw,3.5rem)' }}
            >
              {isLoading ? (
                <span className="text-white/20">—</span>
              ) : (
                <><AnimatedNumber value={value} />+</>
              )}
            </div>

            <div className={cn('text-xs font-bold uppercase tracking-wider', color)}>
              {label}
            </div>
            <div className="text-xs text-white/30 mt-0.5">{sublabel}</div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
