'use client';

import Link from 'next/link';
import { Zap, ArrowRight } from 'lucide-react';
import { useOpenRuns } from '@/hooks/use-open-runs';
import { OpenRunCard } from '@/components/open-runs/open-run-card';
import { Skeleton } from '@/components/ui/skeleton';

export function UpcomingOpenRuns() {
  const { data, isLoading } = useOpenRuns({ upcoming: true, limit: 4 });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data?.data?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-8 text-center flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Zap className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="font-display font-semibold">Пока нет запланированных игр</p>
          <p className="text-sm text-muted-foreground mt-1">
            Будь первым — организуй Pickup Game и собери команду.
          </p>
        </div>
        <Link
          href="/pickup-games/create"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Создать игру <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.data.map((run: any) => (
        <OpenRunCard key={run.id} run={run} />
      ))}
    </div>
  );
}
