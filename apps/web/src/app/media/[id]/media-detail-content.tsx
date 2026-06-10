'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Eye } from 'lucide-react';
import { useMediaItem } from '@/hooks/use-media';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const TYPE_LABELS: Record<string, string> = {
  VIDEO: 'Видео',
  PHOTO: 'Фото',
  INTERVIEW: 'Интервью',
  PODCAST: 'Подкаст',
};

function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match?.[1] ?? null;
}

export function MediaDetailContent({ id }: { id: string }) {
  const { data: item, isLoading } = useMediaItem(id);

  if (isLoading) {
    return (
      <div className="container-page py-8 max-w-4xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="aspect-video rounded-xl" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container-page py-8 text-center">
        <p className="text-muted-foreground">Медиа не найдено</p>
      </div>
    );
  }

  const youtubeId = item.youtubeUrl ? extractYoutubeId(item.youtubeUrl) : null;

  return (
    <div className="container-page py-8 max-w-4xl">
      <Link
        href="/media"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Медиа
      </Link>

      <div className="mb-4">
        <Badge variant="gold" className="mb-3">
          {TYPE_LABELS[item.type] ?? item.type}
        </Badge>
        <h1 className="font-display font-bold text-2xl md:text-3xl mb-2">
          {item.title}
        </h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{item.author.firstName} {item.author.lastName}</span>
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {item.viewCount}
          </div>
        </div>
      </div>

      {/* YouTube embed */}
      {youtubeId && (
        <div className="rounded-xl overflow-hidden mb-6">
          <div className="relative" style={{ paddingTop: '56.25%' }}>
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Photo */}
      {item.type === 'PHOTO' && item.photoUrl && (
        <div className="relative rounded-xl overflow-hidden mb-6" style={{ maxHeight: '600px' }}>
          <Image
            src={item.photoUrl}
            alt={item.title}
            width={1200}
            height={600}
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {item.description && (
        <p className="text-muted-foreground leading-relaxed">{item.description}</p>
      )}
    </div>
  );
}
