'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useEvents } from '@/hooks/use-events';
import { Countdown } from '@/components/events/countdown';

export function TournamentTeaser() {
  const { data: events, isLoading } = useEvents();

  if (isLoading) {
    return <div className="h-48 rounded-2xl bg-secondary/40 animate-pulse" />;
  }

  const featured = events?.find((e) => e.status === 'REGISTRATION_OPEN' || e.status === 'UPCOMING' || e.status === 'LIVE');
  if (!featured) return null;

  return (
    <Link
      href={`/events/${featured.slug}`}
      className="group relative block overflow-hidden rounded-2xl p-6 md:p-8 glass-content-card"
    >
      <div className="absolute inset-0 bg-court-gradient pointer-events-none" />
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Image src="/icons/icon-cup.png" alt="" width={20} height={20} className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Главный турнир
            </span>
          </div>
          <h2 className="font-display font-black text-2xl md:text-4xl leading-none mb-2 group-hover:text-primary transition-colors">
            {featured.title}
          </h2>
          <p className="text-sm text-muted-foreground">{featured.location}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Countdown target={featured.startDate} />
          <span className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-bold text-sm uppercase tracking-wide text-[#0a0a0a] shadow-[0_0_24px_hsl(43_75%_47%/0.3)] group-hover:shadow-[0_0_40px_hsl(43_75%_47%/0.5)] transition-shadow shrink-0">
            Регистрация <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
