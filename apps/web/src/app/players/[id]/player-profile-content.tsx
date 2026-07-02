'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin, Trophy, Zap, Star, Calendar, Clock, Instagram, ChevronRight,
} from 'lucide-react';
import { usePlayerProfile } from '@/hooks/use-players';
import { Skeleton } from '@/components/ui/skeleton';
import { getInitials, formatDate, cn } from '@/lib/utils';

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M22 3.5 2.6 11.1c-1.3.5-1.3 1.3-.2 1.6l4.9 1.5 1.9 5.8c.2.6.4.9.9.9.5 0 .7-.2 1-.5l2.3-2.2 4.8 3.5c.9.5 1.5.2 1.8-.8L23.9 4.9c.4-1.3-.5-1.9-1.9-1.4Zm-13 12-.3 4-1.6-5.1 9.6-6-7.7 7.1Z" />
    </svg>
  );
}

export function PlayerProfileContent({ id }: { id: string }) {
  const { data: player, isLoading, isError } = usePlayerProfile(id);

  if (isLoading) {
    return (
      <div className="container-page py-8 max-w-3xl space-y-4">
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  if (isError || !player) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="font-display font-black text-2xl mb-2">Игрок не найден</h1>
        <p className="text-muted-foreground mb-6">Профиль удалён или ссылка неверная</p>
        <Link href="/" className="text-primary hover:underline text-sm font-medium">
          На главную →
        </Link>
      </div>
    );
  }

  const stats = [
    { label: 'Организовал игр', value: player.stats.gamesOrganized, icon: Star, color: 'text-amber-400' },
    { label: 'Сыграл', value: player.stats.gamesJoined, icon: Zap, color: 'text-primary' },
    { label: 'Репутация', value: player.reputation, icon: Trophy, color: 'text-violet-400' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,hsl(43_85%_53%/0.07)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-court-grid opacity-30" />

        <div className="container-page relative py-10 md:py-14 max-w-3xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/30 flex items-center justify-center shrink-0">
              {player.avatarUrl ? (
                <Image src={player.avatarUrl} alt={`${player.firstName} ${player.lastName}`} fill className="object-cover" />
              ) : (
                <span className="font-display font-black text-3xl text-primary">
                  {getInitials(player.firstName, player.lastName)}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="font-display font-black text-2xl md:text-3xl mb-1">
                {player.firstName} {player.lastName}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
                {player.city && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {player.city}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> На платформе с {formatDate(player.createdAt)}
                </span>
              </div>

              {player.bio && (
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-lg">{player.bio}</p>
              )}

              {(player.instagramUsername || player.telegramUsername) && (
                <div className="flex flex-wrap gap-2">
                  {player.instagramUsername && (
                    <a
                      href={`https://instagram.com/${player.instagramUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-pink-400/30 bg-pink-400/5 px-3 py-1.5 text-xs font-semibold text-pink-400 hover:bg-pink-400/10 transition-colors"
                    >
                      <Instagram className="w-3.5 h-3.5" /> @{player.instagramUsername}
                    </a>
                  )}
                  {player.telegramUsername && (
                    <a
                      href={`https://t.me/${player.telegramUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#29A9EA]/30 bg-[#29A9EA]/5 px-3 py-1.5 text-xs font-semibold text-[#29A9EA] hover:bg-[#29A9EA]/10 transition-colors"
                    >
                      <TelegramIcon className="w-3.5 h-3.5" /> @{player.telegramUsername}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container-page py-8 max-w-3xl space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl border border-border/60 bg-card p-4 text-center">
              <Icon className={cn('w-5 h-5 mx-auto mb-2', color)} />
              <div className="font-display font-black text-2xl">{value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Upcoming runs */}
        {player.upcomingRuns.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-lg mb-4">Ближайшие игры</h2>
            <div className="space-y-2">
              {player.upcomingRuns.map((run) => (
                <Link
                  key={run.id}
                  href={`/pickup-games/${run.id}`}
                  className="group flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 hover:border-primary/40 transition-colors"
                >
                  <span className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {run.title || run.court.name}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {formatDate(run.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {run.startTime}
                      </span>
                      <span className="truncate">{run.court.name}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
