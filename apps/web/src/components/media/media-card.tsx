import Link from 'next/link';
import Image from 'next/image';
import { Play, Image as ImageIcon, Mic, Radio } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const TYPE_CONFIG = {
  VIDEO: { label: 'Видео', icon: Play, variant: 'destructive' as const },
  PHOTO: { label: 'Фото', icon: ImageIcon, variant: 'secondary' as const },
  INTERVIEW: { label: 'Интервью', icon: Mic, variant: 'gold' as const },
  PODCAST: { label: 'Подкаст', icon: Radio, variant: 'outline' as const },
};

interface MediaCardProps {
  item: {
    id: string;
    title: string;
    type: string;
    youtubeThumbnail?: string;
    photoThumbnailUrl?: string;
    viewCount: number;
  };
  className?: string;
}

export function MediaCard({ item, className }: MediaCardProps) {
  const config = TYPE_CONFIG[item.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.VIDEO;
  const Icon = config.icon;
  const thumbnail = item.youtubeThumbnail ?? item.photoThumbnailUrl;

  return (
    <Link href={`/media/${item.id}`} className={cn('group block', className)}>
      <div className="rounded-xl overflow-hidden glass-content-card">
        <div className="relative aspect-video bg-secondary/30">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
              <Icon className="w-10 h-10" />
            </div>
          )}

          {item.type === 'VIDEO' || item.type === 'INTERVIEW' ? (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                <Play className="w-5 h-5 text-primary-foreground fill-primary-foreground ml-0.5" />
              </div>
            </div>
          ) : null}

          <div className="absolute top-2 left-2">
            <Badge variant={config.variant} className="text-xs">
              <Icon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
          </div>
        </div>

        <div className="p-3">
          <h3 className="font-display font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {item.viewCount} просмотров
          </p>
        </div>
      </div>
    </Link>
  );
}
