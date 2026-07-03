'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Gift, Users, Trophy, ChevronRight } from 'lucide-react';
import { useGiveaways } from '@/hooks/use-giveaways';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHero } from '@/components/shared/page-hero';
import { cn } from '@/lib/utils';

export function GiveawaysListContent() {
  const { data: giveaways, isLoading } = useGiveaways();

  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow="Призы"
        goldTitle="Розыгрыши"
        subtitle="Выполняй условия, попадай в пул и выигрывай призы на колесе"
      />

      <div className="container-page py-8">

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : !giveaways?.length ? (
        <div className="rounded-2xl border border-dashed border-border/50 bg-card/20 p-16 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Gift className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl mb-1">Розыгрышей пока нет</h2>
            <p className="text-sm text-muted-foreground">
              Следи за новостями — скоро будет что выиграть
            </p>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {giveaways.map((g) => (
            <Link
              key={g.id}
              href={`/giveaways/${g.id}`}
              className="group rounded-2xl border border-border/60 bg-card overflow-hidden hover:border-primary/40 transition-all duration-200 flex flex-col"
            >
              <div className="relative aspect-[16/9] bg-gradient-to-br from-primary/20 to-primary/5">
                {g.coverUrl ? (
                  <Image src={g.coverUrl} alt={g.title} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Gift className="w-12 h-12 text-primary/40" />
                  </div>
                )}
                <span
                  className={cn(
                    'absolute top-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border',
                    g.status === 'OPEN'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-white/10 text-white/60 border-white/15',
                  )}
                >
                  {g.status === 'OPEN' ? 'Идёт набор' : 'Завершён'}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <h2 className="font-display font-bold text-lg leading-snug mb-1 group-hover:text-primary transition-colors">
                  {g.title}
                </h2>
                <p className="text-sm text-primary font-semibold mb-3 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" /> {g.prize}
                </p>
                {g.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{g.description}</p>
                )}
                <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> {g.poolCount} в пуле
                  </span>
                  {g.status === 'COMPLETED' && g.winner ? (
                    <span className="text-primary font-semibold">
                      🎉 {g.winner.firstName} {g.winner.lastName}
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 group-hover:text-primary transition-colors">
                      Участвовать <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
