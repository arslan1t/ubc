'use client';

import { useMedia } from '@/hooks/use-media';
import { MediaCard } from '@/components/media/media-card';
import { Skeleton } from '@/components/ui/skeleton';

export function LatestMedia() {
  const { data, isLoading } = useMedia({ limit: 4 });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data?.data?.length) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/30 p-8 text-center">
        <p className="text-muted-foreground">Нет медиа</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {data.data.map((item: any) => (
        <MediaCard key={item.id} item={item} />
      ))}
    </div>
  );
}
