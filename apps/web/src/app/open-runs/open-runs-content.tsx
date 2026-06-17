'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Zap, SlidersHorizontal } from 'lucide-react';
import { useOpenRuns } from '@/hooks/use-open-runs';
import { OpenRunCard } from '@/components/open-runs/open-run-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { SKILL_OPTIONS } from '@/lib/pickup';
import { cn } from '@/lib/utils';

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

  const { data, isLoading } = useOpenRuns(filters);

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
    <div className="container-page py-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">
            Pickup <span className="text-primary">Games</span>
          </h1>
          <p className="text-muted-foreground">
            Открытые баскетбольные игры — находи и записывайся
          </p>
        </div>
        {isAuthenticated && (
          <Button asChild variant="gold" className="shrink-0">
            <Link href="/pickup-games/create">
              <Plus className="w-4 h-4 mr-2" />
              Создать
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-border">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
          <SlidersHorizontal className="w-3.5 h-3.5" /> Уровень:
        </span>
        {SKILL_OPTIONS.filter((s) => s.value !== 'ANY').map((s) => (
          <button
            key={s.value}
            onClick={() => toggle('skillLevel', s.value)}
            className={cn(
              'rounded-md border px-3 py-1 text-xs font-medium transition-colors',
              activeSkill === s.value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/50',
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
              'rounded-md border px-3 py-1 text-xs font-medium transition-colors',
              activePrice === f.value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/50',
            )}
          >
            {f.label}
          </button>
        ))}
        {hasFilters && (
          <button
            onClick={() => router.push('/pickup-games')}
            className="text-xs text-destructive hover:underline ml-1"
          >
            Сбросить
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : data?.data?.length ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.data.map((run: any) => (
              <OpenRunCard key={run.id} run={run} />
            ))}
          </div>
          {data.total > data.data.length && (
            <p className="text-center text-sm text-muted-foreground mt-8">
              Показано {data.data.length} из {data.total}
            </p>
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-12 md:p-16 text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Zap className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-xl mb-1">
              {hasFilters ? 'Ничего не нашлось' : 'Пока нет запланированных игр'}
            </h3>
            <p className="text-muted-foreground">
              {hasFilters ? 'Попробуй сбросить фильтры' : 'Будь первым — организуй игру и собери команду'}
            </p>
          </div>
          {isAuthenticated ? (
            <Button asChild variant="gold">
              <Link href="/pickup-games/create">Создать игру</Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link href="/auth/login">Войдите, чтобы создать</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
