'use client';

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
      <div className="rounded-xl border border-border/50 bg-card/30 p-8 text-center">
        <p className="text-muted-foreground">Нет предстоящих Open Runs</p>
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
