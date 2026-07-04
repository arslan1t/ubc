'use client';

import { PageHero } from '@/components/shared/page-hero';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, SlidersHorizontal, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useOpenRuns } from '@/hooks/use-open-runs';
import { OpenRunCard } from '@/components/open-runs/open-run-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { SKILL_OPTIONS } from '@/lib/pickup';
import { cn } from '@/lib/utils';
import { QueryError } from '@/components/ui/query-error';

const PRICE_FILTERS = [
  { key: 'isFree', value: 'true', label: 'Бесплатные' },
  { key: 'isFree', value: 'false', label: 'Платные' },
];

export function OpenRunsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();

  const filters: Record<string, any> = { upcoming: true };
  searchParams.forEach((value, key) => { filters[key] = value; });

  const { data, isLoading, isError, refetch } = useOpenRuns(filters);

  const toggle = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === value) params.delete(key);
    else params.set(key, value);
    router.push(`/pickup-games?${params.toString()}`);
  };

  const activeSkill = searchParams.get('skillLevel');
  const activePrice = searchParams.get('isFree');
  const hasFilters = activeSkill || activePrice;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <PageHero
        eyebrow="Игры"
        title="Pickup"
        goldTitle="Games"
        subtitle="Открытые игры — находи и записывайся"
        imageSrc="/hero-pickup.png"
        action={
          isAuthenticated ? (
            <Button asChild variant="gold" className="shrink-0 rounded-2xl shadow-[0_0_20px_hsl(43_85%_53%/0.3)] hover:shadow-[0_0_35px_hsl(43_85%_53%/0.5)]">
              <Link href="/pickup-games/create">
                <Plus className="w-4 h-4 mr-2" />
                Создать игру
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="container-page py-8">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-8 pb-6 border-b border-border/60">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Уровень
          </span>
          {SKILL_OPTIONS.filter((s) => s.value !== 'ANY').map((s) => (
            <button
              key={s.value}
              onClick={() => toggle('skillLevel', s.value)}
              className={cn(
                'rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-200',
                activeSkill === s.value
                  ? 'border-primary bg-primary/15 text-primary shadow-[0_0_12px_hsl(43_85%_53%/0.2)]'
                  : 'border-border/60 text-muted-foreground hover:text-foreground hover:border-border',
              )}
            >
              {s.label}
            </button>
          ))}
          <span className="w-px h-5 bg-border mx-1" />
          {PRICE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => toggle(f.key, f.value)}
              className={cn(
                'rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-200',
                activePrice === f.value
                  ? 'border-primary bg-primary/15 text-primary shadow-[0_0_12px_hsl(43_85%_53%/0.2)]'
                  : 'border-border/60 text-muted-foreground hover:text-foreground hover:border-border',
              )}
            >
              {f.label}
            </button>
          ))}
          {hasFilters && (
            <button
              onClick={() => router.push('/pickup-games')}
              className="text-xs text-destructive hover:underline ml-1 font-medium"
            >
              Сбросить
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))}
          </div>
        ) : isError ? (
          <QueryError onRetry={() => refetch()} />
        ) : data?.data?.length ? (
          <>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.06 } },
                hidden: {},
              }}
            >
              {data.data.map((run: any) => (
                <motion.div
                  key={run.id}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <OpenRunCard run={run} />
                </motion.div>
              ))}
            </motion.div>
            {data.total > data.data.length && (
              <p className="text-center text-sm text-muted-foreground mt-8">
                Показано {data.data.length} из {data.total}
              </p>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-primary/20 bg-primary/5 p-14 md:p-20 text-center flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl mb-2">
                {hasFilters ? 'Ничего не нашлось' : 'Пока нет запланированных игр'}
              </h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                {hasFilters ? 'Попробуй убрать фильтры' : 'Будь первым — организуй Pickup Game'}
              </p>
            </div>
            {isAuthenticated ? (
              <Button asChild variant="gold" className="rounded-2xl shadow-[0_0_20px_hsl(43_85%_53%/0.25)]">
                <Link href="/pickup-games/create">Создать игру</Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="rounded-2xl">
                <Link href="/auth/login">Войдите, чтобы создать</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
