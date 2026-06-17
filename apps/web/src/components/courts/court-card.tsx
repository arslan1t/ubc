import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, Sun, Building, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourtCardProps {
  court: {
    id: string;
    name: string;
    slug: string;
    address: string;
    city: string;
    type: string;
    isFree: boolean;
    hasLighting: boolean;
    rating: number;
    reviewCount: number;
    images: Array<{ url: string; thumbnailUrl: string }>;
  };
  className?: string;
}

export function CourtCard({ court, className }: CourtCardProps) {
  const cover = court.images?.[0];
  const isIndoor = court.type === 'INDOOR';

  return (
    <Link href={`/courts/${court.slug}`} className={cn('group block', className)}>
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-[0_8px_32px_hsl(43_85%_53%/0.1)]">
        {/* Image — 16:9 for editorial feel */}
        <div className="relative aspect-video bg-secondary/30 overflow-hidden">
          {cover ? (
            <Image
              src={cover.thumbnailUrl}
              alt={court.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-secondary/60 to-card">
              {/* Basketball court outline illustration */}
              <svg viewBox="0 0 120 70" className="w-20 h-12 text-primary/15" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="116" height="66" rx="2" />
                <line x1="60" y1="2" x2="60" y2="68" />
                <circle cx="60" cy="35" r="12" />
                <path d="M2 25 Q30 35 2 45" />
                <path d="M118 25 Q90 35 118 45" />
                <circle cx="60" cy="35" r="1.5" fill="currentColor" />
              </svg>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
                Нет фото
              </span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Top badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            <span className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm',
              court.isFree
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-black/40 text-white/70 border border-white/10',
            )}>
              {court.isFree ? 'Бесплатно' : 'Платный'}
            </span>
          </div>

          {/* Bottom-left: lighting + type */}
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
            <span className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm border',
              isIndoor
                ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/30',
            )}>
              {isIndoor ? <Building className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
              {isIndoor ? 'Крытый' : 'Открытый'}
            </span>
            {court.hasLighting && (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 backdrop-blur-sm">
                <Zap className="w-3 h-3" />
                Свет
              </span>
            )}
          </div>

          {/* Rating — bottom right */}
          {court.reviewCount > 0 && (
            <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-sm px-2 py-0.5">
              <Star className="w-3 h-3 text-primary fill-primary" />
              <span className="text-xs font-bold text-white">{court.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-display font-bold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-1">
            {court.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{court.address}</span>
          </div>
          {court.reviewCount > 0 && (
            <div className="mt-2 text-[11px] text-muted-foreground/60">
              {court.reviewCount} отзыв{court.reviewCount === 1 ? '' : court.reviewCount < 5 ? 'а' : 'ов'}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
