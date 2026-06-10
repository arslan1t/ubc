import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, Sun, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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

  return (
    <Link href={`/courts/${court.slug}`} className={cn('group block', className)}>
      <div className="rounded-xl border border-border bg-card overflow-hidden card-hover">
        <div className="relative aspect-square bg-secondary/30">
          {cover ? (
            <Image
              src={cover.thumbnailUrl}
              alt={court.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-muted-foreground/20">
                <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M4.5 9h15M4.5 15h15M12 4.5v15" />
                  <path d="M12 4.5C10 7 8 9 8 12s2 6 4 7.5" />
                  <path d="M12 4.5C14 7 16 9 16 12s-2 6-4 7.5" />
                </svg>
              </div>
            </div>
          )}
          <div className="absolute top-2 right-2 flex gap-1.5">
            <Badge variant={court.isFree ? 'success' : 'outline'} className="text-xs">
              {court.isFree ? 'Бесплатно' : 'Платный'}
            </Badge>
          </div>
          {court.hasLighting && (
            <div className="absolute bottom-2 left-2">
              <div className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-yellow-400">
                <Sun className="w-3 h-3" />
                Освещение
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-display font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {court.name}
            </h3>
            {court.reviewCount > 0 && (
              <div className="flex items-center gap-1 shrink-0">
                <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                <span className="text-xs font-semibold">{court.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{court.address}</span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Badge variant="outline" className="text-xs gap-1">
              {court.type === 'INDOOR' ? (
                <><Building className="w-3 h-3" /> Крытый</>
              ) : (
                <><Sun className="w-3 h-3" /> Открытый</>
              )}
            </Badge>
            {court.reviewCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {court.reviewCount} отз.
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
