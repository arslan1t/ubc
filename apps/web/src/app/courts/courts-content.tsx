'use client';

import { useSearchParams } from 'next/navigation';
import { useCourts } from '@/hooks/use-courts';
import { CourtCard } from '@/components/courts/court-card';
import { CourtFilters } from '@/components/courts/court-filters';
import { YandexMap } from '@/components/courts/yandex-map';
import { Skeleton } from '@/components/ui/skeleton';

export function CourtsPageContent() {
  const searchParams = useSearchParams();

  const filters: Record<string, any> = {};
  searchParams.forEach((value, key) => { filters[key] = value; });

  const { data, isLoading } = useCourts(filters);
  const courts = data?.data ?? [];

  return (
    <div className="container-page py-8">
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">
          Баскетбольные <span className="text-primary">корты</span>
        </h1>
        <p className="text-muted-foreground">
          Находи площадки рядом с тобой — все корты Ташкента на одной карте
        </p>
      </div>

      {/* Карта — всегда видна */}
      <div className="rounded-2xl overflow-hidden border border-border mb-8" style={{ height: '480px' }}>
        {isLoading ? (
          <Skeleton className="w-full h-full rounded-none" />
        ) : (
          <YandexMap courts={courts} />
        )}
      </div>

      {/* Фильтры */}
      <div className="mb-6">
        <CourtFilters />
      </div>

      {/* Список кортов */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : courts.length ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {courts.map((court: any) => (
              <CourtCard key={court.id} court={court} />
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8">
            Показано {courts.length} из {data?.total ?? courts.length} кортов
          </p>
        </>
      ) : (
        <div className="rounded-xl border border-border/50 bg-card/30 p-12 text-center">
          <p className="text-muted-foreground">Корты не найдены</p>
        </div>
      )}
    </div>
  );
}
