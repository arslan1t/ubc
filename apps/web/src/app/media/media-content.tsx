'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ExternalLink, Youtube, Instagram, FolderOpen } from 'lucide-react';
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

const PLATFORMS = [
  {
    name: 'YouTube',
    description: 'Полные записи игр — матчи, турниры и стримы целиком',
    href: 'https://www.youtube.com/@ubculture',
    icon: Youtube,
    accent: 'text-red-500',
    border: 'hover:border-red-500/40',
    bg: 'bg-red-500/10',
  },
  {
    name: 'Instagram',
    description: 'Хайлайты, новости и жизнь сообщества в моменте',
    href: 'https://www.instagram.com/ubcbasketbal/',
    icon: Instagram,
    accent: 'text-pink-400',
    border: 'hover:border-pink-400/40',
    bg: 'bg-pink-400/10',
  },
  {
    name: 'Google Диск',
    description: 'Необработанный контент — сырые фото и видео с игр, забирай своё',
    href: 'https://drive.google.com/drive/folders/1tiUM34jl4miYC4jHwnWmG1flGGwNMNfo?usp=drive_link',
    icon: FolderOpen,
    accent: 'text-emerald-400',
    border: 'hover:border-emerald-400/40',
    bg: 'bg-emerald-400/10',
  },
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

      {/* Where the content lives */}
      <div className="grid sm:grid-cols-3 gap-3 mb-8">
        {PLATFORMS.map(({ name, description, href, icon: Icon, accent, border, bg }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'group flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-4 transition-all duration-200',
              border,
            )}
          >
            <span className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', bg, accent)}>
              <Icon className="w-5 h-5" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 font-display font-bold text-sm">
                {name}
                <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
            </div>
          </a>
        ))}
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
