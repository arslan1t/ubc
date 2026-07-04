'use client';

import { PageHero } from '@/components/shared/page-hero';
import Link from 'next/link';
import { Plus, Map } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useCourts } from '@/hooks/use-courts';
import { CourtCard } from '@/components/courts/court-card';
import { CourtFilters } from '@/components/courts/court-filters';
import { YandexMap, MAP_AVAILABLE } from '@/components/courts/yandex-map';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryError } from '@/components/ui/query-error';

export function CourtsPageContent() {
  const searchParams = useSearchParams();
  const filters: Record<string, any> = {};
  searchParams.forEach((value, key) => { filters[key] = value; });

  const { data, isLoading, isError, refetch } = useCourts(filters);
  const courts = data?.data ?? [];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <PageHero
        eyebrow="Площадки"
        title="Баскетбольные"
        goldTitle="корты"
        subtitle="Все площадки Узбекистана на одной карте"
        imageSrc="/hero-courts.png"
        action={
          <Link
            href="/courts/suggest"
            className="shrink-0 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-[0_0_20px_hsl(43_85%_53%/0.3)] hover:shadow-[0_0_30px_hsl(43_85%_53%/0.45)]"
          >
            <Plus className="w-4 h-4" /> Предложить корт
          </Link>
        }
      />

      <div className="container-page py-8 space-y-8">
        {/* Map — only when a real Yandex key is configured */}
        {MAP_AVAILABLE && (
          <div className="rounded-2xl overflow-hidden border border-border/60 shadow-[0_4px_24px_rgba(0,0,0,0.3)] h-[320px] sm:h-[460px]">
            {isLoading ? (
              <div className="w-full h-full bg-secondary/30 flex items-center justify-center animate-pulse">
                <Map className="w-10 h-10 text-muted-foreground/20" />
              </div>
            ) : (
              <YandexMap courts={courts} />
            )}
          </div>
        )}

        {/* Filters */}
        <CourtFilters />

        {/* Court grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-video rounded-2xl" />
            ))}
          </div>
        ) : isError ? (
          <QueryError onRetry={() => refetch()} />
        ) : courts.length ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {courts.map((court: any) => (
                <CourtCard key={court.id} court={court} />
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground pt-4">
              {courts.length} из {data?.total ?? courts.length} кортов
            </p>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-primary/20 bg-primary/5 p-14 text-center flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Map className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg mb-1">Ничего не найдено</h3>
              <p className="text-sm text-muted-foreground">Сброс фильтров или предложи новый корт</p>
            </div>
            <Link
              href="/courts/suggest"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> Предложить корт
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
