'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCourt } from '@/hooks/use-courts';
import { useOpenRuns } from '@/hooks/use-open-runs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OpenRunCard } from '@/components/open-runs/open-run-card';
import { ReviewForm } from '@/components/courts/review-form';
import { ReviewList } from '@/components/courts/review-list';
import {
  MapPin, Star, Sun, Building, ArrowLeft, ExternalLink,
} from 'lucide-react';
import { YandexMap } from '@/components/courts/yandex-map';
import { formatDate } from '@/lib/utils';

export function CourtDetailContent({ slug }: { slug: string }) {
  const { data: court, isLoading } = useCourt(slug);
  const { data: openRunsData } = useOpenRuns({
    courtId: court?.id,
    upcoming: true,
  });

  if (isLoading) {
    return (
      <div className="container-page py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="aspect-video rounded-xl w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!court) {
    return (
      <div className="container-page py-8 text-center">
        <p className="text-muted-foreground">Корт не найден</p>
      </div>
    );
  }

  const primaryImage = court.images?.find((i: any) => i.isPrimary) ?? court.images?.[0];

  return (
    <div className="container-page py-8">
      <Link
        href="/courts"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Все корты
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
          <div>
            <h1 className="font-display font-bold text-3xl md:text-4xl">
              {court.name}
            </h1>
            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{court.address}, {court.city}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={court.isFree ? 'success' : 'outline'} className="text-sm px-3 py-1">
              {court.isFree ? 'Бесплатный' : 'Платный'}
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1 gap-1.5">
              {court.type === 'INDOOR' ? <Building className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              {court.type === 'INDOOR' ? 'Крытый' : 'Открытый'}
            </Badge>
          </div>
        </div>

        {court.reviewCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.round(court.rating) ? 'text-primary fill-primary' : 'text-muted-foreground'}`}
                />
              ))}
            </div>
            <span className="font-semibold">{court.rating.toFixed(1)}</span>
            <span className="text-muted-foreground text-sm">({court.reviewCount} отзывов)</span>
          </div>
        )}
      </div>

      {/* Images */}
      {court.images?.length > 0 && (
        <div className="mb-8">
          <div className="grid grid-cols-4 gap-2 rounded-xl overflow-hidden" style={{ maxHeight: '450px' }}>
            <div className={`${court.images.length > 1 ? 'col-span-3' : 'col-span-4'} relative`}>
              <Image
                src={primaryImage?.url ?? primaryImage?.thumbnailUrl}
                alt={court.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 75vw"
                priority
              />
            </div>
            {court.images.length > 1 && (
              <div className="col-span-1 flex flex-col gap-2">
                {court.images.slice(1, 3).map((img: any) => (
                  <div key={img.id} className="relative flex-1">
                    <Image
                      src={img.thumbnailUrl}
                      alt={court.name}
                      fill
                      className="object-cover"
                      sizes="25vw"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Features */}
          <div>
            <h2 className="font-display font-semibold text-xl mb-4">Характеристики</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Покрытие', value: court.surface },
                { label: 'Кольца', value: `${court.hoops} шт.` },
                { label: 'Освещение', value: court.hasLighting ? 'Есть' : 'Нет' },
                { label: 'Раздевалки', value: court.hasChangingRooms ? 'Есть' : 'Нет' },
                { label: 'Тип', value: court.type === 'INDOOR' ? 'Крытый' : 'Открытый' },
                { label: 'Стоимость', value: court.isFree ? 'Бесплатно' : 'Платный' },
              ].map((feat) => (
                <div key={feat.label} className="rounded-lg border border-border bg-card/50 p-3">
                  <div className="text-xs text-muted-foreground">{feat.label}</div>
                  <div className="font-medium text-sm mt-0.5">{feat.value}</div>
                </div>
              ))}
            </div>
          </div>

          {court.description && (
            <div>
              <h2 className="font-display font-semibold text-xl mb-3">О корте</h2>
              <p className="text-muted-foreground leading-relaxed">{court.description}</p>
            </div>
          )}

          {/* Reviews */}
          <div>
            <h2 className="font-display font-semibold text-xl mb-4">Отзывы</h2>
            <ReviewForm courtId={court.id} />
            <ReviewList reviews={court.reviews ?? []} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Мини-карта */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-3">На карте</h3>
            <div className="rounded-xl overflow-hidden border border-border" style={{ height: '220px' }}>
              <YandexMap
                courts={[court]}
                center={[court.latitude, court.longitude]}
                zoom={16}
              />
            </div>
            <a
              href={`https://yandex.com/maps/?pt=${court.longitude},${court.latitude}&z=17&l=map`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Открыть в Яндекс Картах
            </a>
          </div>

          {/* Upcoming Open Runs */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-3">
              Open Runs на этом корте
            </h3>
            {openRunsData?.data?.length ? (
              <div className="space-y-3">
                {openRunsData.data.map((run: any) => (
                  <OpenRunCard key={run.id} run={run} compact />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border/50 bg-card/30 p-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Нет предстоящих игр
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/open-runs/create?courtId=${court.id}`}>
                    Создать Open Run
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
