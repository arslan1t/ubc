'use client';

import Image from 'next/image';
import { cn, getInitials } from '@/lib/utils';
import type { BracketMatch, MatchPlayer } from '@/hooks/use-events';

const ROUND_NAMES: Record<number, string[]> = {
  1: ['Финал'],
  2: ['Полуфиналы', 'Финал'],
  3: ['Четвертьфиналы', 'Полуфиналы', 'Финал'],
  4: ['1/8 финала', 'Четвертьфиналы', 'Полуфиналы', 'Финал'],
  5: ['1/16 финала', '1/8 финала', 'Четвертьфиналы', 'Полуфиналы', 'Финал'],
};

function PlayerRow({
  player,
  score,
  isWinner,
  isLive,
}: {
  player: MatchPlayer | null;
  score: number | null;
  isWinner: boolean;
  isLive: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-2.5 py-1.5',
        isWinner && 'bg-primary/10',
        !player && 'opacity-40',
      )}
    >
      {player ? (
        <>
          {player.avatarUrl ? (
            <Image
              src={player.avatarUrl}
              alt=""
              width={20}
              height={20}
              className="w-5 h-5 rounded-full object-cover shrink-0"
            />
          ) : (
            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[9px] font-bold flex items-center justify-center shrink-0">
              {getInitials(player.firstName, player.lastName)}
            </span>
          )}
          <span
            className={cn(
              'flex-1 min-w-0 truncate text-xs',
              isWinner ? 'font-bold text-primary' : 'font-medium',
            )}
          >
            {player.firstName} {player.lastName}
          </span>
        </>
      ) : (
        <span className="flex-1 text-xs text-muted-foreground italic">Ожидается</span>
      )}
      <span
        className={cn(
          'shrink-0 w-6 text-center text-xs font-display font-black tabular-nums',
          isWinner ? 'text-primary' : 'text-muted-foreground',
          isLive && 'text-emerald-400',
        )}
      >
        {score ?? '–'}
      </span>
    </div>
  );
}

export function TournamentBracket({
  matches,
  highlightUserId,
}: {
  matches: BracketMatch[];
  highlightUserId?: string;
}) {
  if (!matches.length) return null;

  const totalRounds = Math.max(...matches.map((m) => m.round));
  const names = ROUND_NAMES[totalRounds] ?? [];
  const rounds: BracketMatch[][] = [];
  for (let r = 1; r <= totalRounds; r++) {
    rounds.push(matches.filter((m) => m.round === r).sort((a, b) => a.slot - b.slot));
  }

  return (
    <div className="overflow-x-auto pb-2 -mx-1 px-1">
      <div className="flex gap-4 min-w-fit">
        {rounds.map((roundMatches, ri) => (
          <div key={ri} className="flex flex-col w-52 shrink-0">
            <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 text-center">
              {names[ri] ?? `Раунд ${ri + 1}`}
            </div>
            <div className="flex-1 flex flex-col justify-around gap-3">
              {roundMatches.map((m) => {
                const isLive = m.status === 'LIVE';
                const mine =
                  highlightUserId &&
                  (m.player1Id === highlightUserId || m.player2Id === highlightUserId);
                return (
                  <div
                    key={m.id}
                    className={cn(
                      'rounded-lg border bg-card overflow-hidden divide-y divide-border/50',
                      isLive
                        ? 'border-emerald-400/50 shadow-[0_0_12px_rgba(52,211,153,0.15)]'
                        : 'border-border/60',
                      mine && 'ring-1 ring-primary/40',
                    )}
                  >
                    {isLive && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-400/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                          Идёт сейчас
                        </span>
                      </div>
                    )}
                    <PlayerRow
                      player={m.player1}
                      score={m.score1}
                      isWinner={!!m.winnerId && m.winnerId === m.player1Id}
                      isLive={isLive}
                    />
                    <PlayerRow
                      player={m.player2}
                      score={m.score2}
                      isWinner={!!m.winnerId && m.winnerId === m.player2Id}
                      isLive={isLive}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
