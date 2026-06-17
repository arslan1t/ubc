import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Рейтинг — UBC',
  description: 'Рейтинг и ранжирование игроков баскетбольного сообщества Узбекистана',
};

const MOCK_RANKINGS = [
  { rank: 1, initials: 'АЙ', name: 'Акбар Юсупов', rep: 890, streak: 7, badge: '🔥' },
  { rank: 2, initials: 'ДМ', name: 'Диёр Мирзаев', rep: 740, streak: 5, badge: '⚡' },
  { rank: 3, initials: 'СК', name: 'Санжар Каримов', rep: 610, streak: 4, badge: '🏀' },
  { rank: 4, initials: 'БА', name: 'Бобур Ахмедов', rep: 540, streak: 3, badge: null },
  { rank: 5, initials: 'ФН', name: 'Фарход Назаров', rep: 480, streak: 2, badge: null },
];

const TIERS = [
  { name: 'Legend', range: '1000+', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30', icon: '👑' },
  { name: 'Elite', range: '700–999', color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/30', icon: '💎' },
  { name: 'Pro', range: '400–699', color: 'text-sky-400', bg: 'bg-sky-400/10 border-sky-400/30', icon: '🔵' },
  { name: 'Hooper', range: '0–399', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30', icon: '🟢' },
];

export default function RankingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,hsl(43_85%_53%/0.1)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-court-grid opacity-40" />

        <div className="container-page relative py-16 md:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
              Соревнование
            </p>
            <h1 className="font-display font-black text-4xl md:text-6xl leading-none mb-4">
              Ранг
              <span className="block" style={{
                background: 'linear-gradient(135deg, hsl(43 85% 65%), hsl(43 85% 45%))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>и рейтинг</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg">
              Система ранжирования игроков на основе активности, организации игр и репутации в сообществе.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-14 space-y-12">
        {/* Tier system */}
        <div>
          <h2 className="font-display font-bold text-xl mb-5">Уровни ранга</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TIERS.map((tier) => (
              <div key={tier.name} className={`rounded-2xl border p-4 text-center ${tier.bg}`}>
                <div className="text-2xl mb-2">{tier.icon}</div>
                <div className={`font-display font-black text-lg ${tier.color}`}>{tier.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{tier.range} очков</div>
              </div>
            ))}
          </div>
        </div>

        {/* Blurred leaderboard */}
        <div className="relative">
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 bg-background/60 backdrop-blur-md rounded-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-2 text-sm font-bold uppercase tracking-wider text-primary">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Скоро
            </div>
            <div className="text-center max-w-sm">
              <h2 className="font-display font-bold text-xl mb-2">Рейтинг запускается</h2>
              <p className="text-muted-foreground text-sm">
                Организуй игры и набирай очки репутации — чем больше активности, тем выше ранг.
              </p>
            </div>
            <Link
              href="/pickup-games/create"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-[0_0_20px_hsl(43_85%_53%/0.3)]"
            >
              <Flame className="w-4 h-4" />
              Начни зарабатывать очки <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="rounded-2xl border border-border/60 overflow-hidden opacity-40 pointer-events-none select-none">
            <div className="px-5 py-3 bg-primary/5 border-b border-border/60 flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Топ игроков · Июнь 2026</span>
            </div>
            {MOCK_RANKINGS.map((p) => (
              <div key={p.name} className="flex items-center gap-4 px-5 py-4 border-b border-border/40 last:border-0 bg-card/40">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-sm ${
                  p.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                  p.rank === 2 ? 'bg-slate-400/20 text-slate-300' :
                  p.rank === 3 ? 'bg-amber-700/20 text-amber-600' :
                  'bg-secondary text-muted-foreground'
                }`}>
                  #{p.rank}
                </div>
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                    {p.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-sm flex items-center gap-1.5">
                      {p.name}
                      {p.badge && <span>{p.badge}</span>}
                    </div>
                    {p.streak > 0 && (
                      <div className="text-xs text-orange-400 flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        {p.streak} игр подряд
                      </div>
                    )}
                  </div>
                </div>
                <div className="font-display font-black text-xl text-primary">{p.rep}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How points work */}
        <div>
          <h2 className="font-display font-bold text-xl mb-5">Как работают очки</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { pts: '+50', action: 'Организовать Pickup Game', icon: '🏀' },
              { pts: '+10', action: 'Участвовать в игре', icon: '✅' },
              { pts: '+5', action: 'Предложить корт (одобрен)', icon: '📍' },
            ].map(({ pts, action, icon }) => (
              <div key={action} className="rounded-2xl border border-border/60 bg-card/40 p-5 flex items-center gap-4">
                <span className="text-2xl">{icon}</span>
                <div>
                  <div className="font-display font-black text-xl text-primary">{pts}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{action}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
