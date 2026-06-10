'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useNews } from '@/hooks/use-news';
import { NewsCard } from '@/components/news/news-card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { value: '', label: 'Все' },
  { value: 'NEWS', label: 'Новости' },
  { value: 'TOURNAMENTS', label: 'Турниры' },
  { value: 'INTERVIEWS', label: 'Интервью' },
  { value: 'PLAYERS', label: 'Игроки' },
  { value: 'AMATEUR', label: 'Любители' },
  { value: 'UNIVERSITY', label: 'Университет' },
];

export function NewsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') ?? '';

  const { data, isLoading } = useNews({ category: activeCategory || undefined });

  const setCategory = (cat: string) => {
    const params = new URLSearchParams();
    if (cat) params.set('category', cat);
    router.push(`/news?${params.toString()}`);
  };

  return (
    <div className="container-page py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">
          <span className="text-primary">Новости</span>
        </h1>
        <p className="text-muted-foreground">Баскетбол Узбекистана в деталях</p>
      </div>

      <div className="flex gap-2 flex-wrap mb-8 pb-4 border-b border-border">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              activeCategory === cat.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : data?.data?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.data.map((article: any, idx: number) => (
            <NewsCard
              key={article.id}
              article={article}
              featured={idx === 0}
              className={idx === 0 ? 'md:col-span-3 md:grid md:grid-cols-2 md:gap-0' : ''}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border/50 bg-card/30 p-12 text-center">
          <p className="text-muted-foreground">Нет новостей</p>
        </div>
      )}
    </div>
  );
}
