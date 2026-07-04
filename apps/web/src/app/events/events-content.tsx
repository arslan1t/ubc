'use client';

import { PageHero } from '@/components/shared/page-hero';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Users, Trophy, ChevronRight } from 'lucide-react';
import { useEvents } from '@/hooks/use-events';
import { formatDate, cn } from '@/lib/utils';
import { QueryError } from '@/components/ui/query-error';

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  UPCOMING: { label: 'Скоро', cls: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
  REGISTRATION_OPEN: { label: 'Регистрация открыта', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  LIVE: { label: 'Идёт сейчас', cls: 'bg-primary/15 text-primary border-primary/30' },
  COMPLETED: { label: 'Завершён', cls: 'bg-white/10 text-white/50 border-white/15' },
};

export function EventsPageContent() {
  const { data: events, isLoading, isError, refetch } = useEvents();

  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow="Соревнования"
        title="Ивенты"
        goldTitle="и турниры"
        subtitle="Официальные турниры, уличные чемпионаты и баскетбольные ивенты Узбекистана"
        imageSrc="/hero-events.png"
      />

      <section className="container-page py-14">
        {isLoading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-secondary/40 animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <QueryError onRetry={() => refetch()} />
        ) : !events || events.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Пока нет запланированных турниров.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => {
              const status = STATUS_LABEL[event.status];
              return (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="group rounded-2xl border border-border/60 bg-card overflow-hidden hover:border-primary/40 transition-all duration-200 flex flex-col"
                >
                  <div className="relative aspect-[16/9] bg-gradient-to-br from-primary/20 to-primary/5">
                    {event.coverUrl ? (
                      <Image
                        src={event.coverUrl}
                        alt={event.title}
                        fill
                        quality={90}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Trophy className="w-12 h-12 text-primary/40" />
                      </div>
                    )}
                    <span className={cn('absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 border', status.cls)}>
                      {status.label}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-display font-bold text-lg leading-snug mb-2 group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        {formatDate(event.startDate)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        {event.location}
                      </span>
                    </div>
                    <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        {event.registrationCount}
                        {event.maxParticipants ? ` / ${event.maxParticipants}` : ''} участников
                      </span>
                      <span className="flex items-center gap-0.5 group-hover:text-primary transition-colors">
                        Подробнее <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
