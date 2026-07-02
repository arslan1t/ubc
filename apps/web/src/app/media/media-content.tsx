'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMedia } from '@/hooks/use-media';
import { MediaCard } from '@/components/media/media-card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { QueryError } from '@/components/ui/query-error';

const TYPES = [
  { value: '', label: 'Всё' },
  { value: 'VIDEO', label: 'Видео' },
  { value: 'PHOTO', label: 'Фото' },
  { value: 'INTERVIEW', label: 'Интервью' },
  { value: 'PODCAST', label: 'Подкасты' },
];

export function MediaPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeType = searchParams.get('type') ?? '';

  const { data, isLoading, isError, refetch } = useMedia({ type: activeType || undefined });

  const setType = (type: string) => {
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    router.push(`/media?${params.toString()}`);
  };

  return (
    <div className="container-page py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">
          <span className="text-primary">Медиа</span>
        </h1>
        <p className="text-muted-foreground">Видео, фото, интервью и подкасты</p>
      </div>

      <div className="flex gap-2 flex-wrap mb-8 pb-4 border-b border-border">
        {TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setType(t.value)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              activeType === t.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-video rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <QueryError onRetry={() => refetch()} />
      ) : data?.data?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.data.map((item: any) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border/50 bg-card/30 p-12 text-center">
          <p className="text-muted-foreground">Нет медиа</p>
        </div>
      )}
    </div>
  );
}
