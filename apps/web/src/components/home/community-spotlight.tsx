'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Trophy, Star, MapPin, Award, ArrowRight } from 'lucide-react';
import { useCommunityOverview } from '@/hooks/use-community';
import { getInitials, cn, pluralize } from '@/lib/utils';

export function CommunitySpotlight({ className }: { className?: string }) {
  const { data, isLoading } = useCommunityOverview();

  if (isLoading) {
    return (
      <div className={cn('grid sm:grid-cols-2 gap-4', className)}>
        <div className="h-44 rounded-2xl bg-secondary/40 animate-pulse" />
        <div className="h-44 rounded-2xl bg-secondary/40 animate-pulse" />
      </div>
    );
  }

  const player = data?.featuredPlayer;
  const court = data?.courtOfWeek;

  return (
    <div className={cn('grid sm:grid-cols-2 gap-4', className)}>
      {/* Player of the week */}
      <div className="relative overflow-hidden rounded-2xl p-5" style={{ background: 'rgba(13,13,13,0.82)', backdropFilter: 'blur(20px) saturate(150%)', WebkitBackdropFilter: 'blur(20px) saturate(150%)', border: '1px solid rgba(212,161,30,0.18)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 4px 20px rgba(0,0,0,0.35)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-4 h-4 text-primary" />
          <span className="font-display font-bold text-xs uppercase tracking-wider text-primary">
            Игрок недели
          </span>
        </div>

        {player ? (
          <div className="flex items-center gap-4">
            {player.avatarUrl ? (
              <Image
                src={player.avatarUrl}
                alt={player.firstName}
                width={56}
                height={56}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/40"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg ring-2 ring-primary/40">
                {getInitials(player.firstName, player.lastName)}
              </div>
            )}
            <div className="min-w-0">
              <div className="font-display font-bold text-lg truncate">
                {player.firstName} {player.lastName}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Award className="w-3.5 h-3.5 text-primary" />
                {player.score} очков репутации
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">
                {pluralize(player.gamesOrganized, 'игра', 'игры', 'игр')} организовано
              </div>
            </div>
          </div>
        ) : (
          <div className="py-2">
            <p className="text-sm text-muted-foreground mb-3">
              Это место ждёт тебя. Организуй игры и поднимайся в топ сообщества.
            </p>
            <Link
              href="/pickup-games/create"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
            >
              Стать первым <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Court of the week */}
      <Link
        href={court ? `/courts/${court.slug}` : '/courts'}
        className="group relative overflow-hidden rounded-2xl p-5 glass-content-card"
      >
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-4 h-4 text-amber-400" />
          <span className="font-display font-bold text-xs uppercase tracking-wider text-amber-400">
            Корт недели
          </span>
        </div>

        {court ? (
          <div className="flex items-center gap-4">
            {court.image ? (
              <Image
                src={court.image}
                alt={court.name}
                width={56}
                height={56}
                className="w-14 h-14 rounded-xl object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
                <MapPin className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0">
              <div className="font-display font-bold text-base truncate group-hover:text-primary transition-colors">
                {court.name}
              </div>
              <div className="text-xs text-muted-foreground truncate mt-0.5">
                {court.address}
              </div>
              <div className="flex items-center gap-2 mt-1 text-[11px]">
                {court.reviewCount > 0 && (
                  <span className="flex items-center gap-0.5 text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400" /> {court.rating.toFixed(1)}
                  </span>
                )}
                <span className={court.isFree ? 'text-emerald-400' : 'text-muted-foreground'}>
                  {court.isFree ? 'Бесплатно' : 'Платный'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-2">
            Корты появятся здесь совсем скоро.
          </p>
        )}
      </Link>
    </div>
  );
}
