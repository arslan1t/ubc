'use client';

import { useCourts } from '@/hooks/use-courts';
import { CourtCard } from '@/components/courts/court-card';
import { Skeleton } from '@/components/ui/skeleton';

export function PopularCourts() {
  const { data, isLoading } = useCourts({ limit: 4 });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-52 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data?.data?.length) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/30 p-8 text-center">
        <p className="text-muted-foreground">Нет кортов</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {data.data.map((court: any) => (
        <CourtCard key={court.id} court={court} />
      ))}
    </div>
  );
}
