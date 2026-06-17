import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Игроки — UBC',
  description: 'Каталог баскетбольных игроков Узбекистана',
};

const MOCK_PLAYERS = [
  { initials: 'АЙ', name: 'Акбар Юсупов', city: 'Ташкент', games: 34, rep: 890 },
  { initials: 'ДМ', name: 'Диёр Мирзаев', city: 'Ташкент', games: 28, rep: 740 },
  { initials: 'СК', name: 'Санжар Каримов', city: 'Самарканд', games: 22, rep: 610 },
  { initials: 'БА', name: 'Бобур Ахмедов', city: 'Ташкент', games: 19, rep: 540 },
  { initials: 'ФН', name: 'Фарход Назаров', city: 'Фергана', games: 17, rep: 480 },
  { initials: 'УЖ', name: 'Умид Жўраев', city: 'Ташкент', games: 15, rep: 420 },
];

const POSITIONS = ['Разыгрывающий', 'Атакующий защитник', 'Лёгкий форвард', 'Тяжёлый форвард', 'Центровой'];

export default function PlayersPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,hsl(43_85%_53%/0.08)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-court-grid opacity-40" />

        <div className="container-page relative py-16 md:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
              Каталог
            </p>
            <h1 className="font-display font-black text-4xl md:text-6xl leading-none mb-4">
              Игроки
              <span className="block" style={{
                background: 'linear-gradient(135deg, hsl(43 85% 65%), hsl(43 85% 45%))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>UBC</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg">
              Полный каталог игроков баскетбольного сообщества. Находи партнёров по игре, следи за лидерами.
            </p>
          </div>
        </div>
      </section>

      {/* Coming soon body */}
      <section className="container-page py-14">
        {/* Blurred mock leaderboard — creates anticipation */}
        <div className="relative">
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 bg-background/60 backdrop-blur-md rounded-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-2 text-sm font-bold uppercase tracking-wider text-primary">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              В разработке
            </div>
            <div className="text-center max-w-sm">
              <h2 className="font-display font-bold text-xl mb-2">Скоро здесь</h2>
              <p className="text-muted-foreground text-sm">
                Профили игроков, статистика, рейтинг и поиск партнёров по уровню.
              </p>
            </div>
            <Link
              href="/pickup-games"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-[0_0_20px_hsl(43_85%_53%/0.3)]"
            >
              Найти игру сейчас <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mock data underneath blur */}
          <div className="rounded-2xl border border-border/60 overflow-hidden opacity-40 pointer-events-none select-none">
            <div className="flex items-center gap-4 px-5 py-3 bg-primary/5 border-b border-border/60">
              {['#', 'Игрок', 'Город', 'Игр', 'Репутация'].map((h) => (
                <div key={h} className={`text-xs font-bold uppercase tracking-wider text-muted-foreground ${h === 'Игрок' ? 'flex-1' : 'w-20 text-right'} ${h === '#' ? 'w-8 text-left' : ''}`}>{h}</div>
              ))}
            </div>
            {MOCK_PLAYERS.map((p, i) => (
              <div key={p.name} className="flex items-center gap-4 px-5 py-3.5 border-b border-border/40 last:border-0 bg-card/40">
                <div className="w-8 font-display font-black text-sm text-muted-foreground">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </div>
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                    {p.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{POSITIONS[i % POSITIONS.length]}</div>
                  </div>
                </div>
                <div className="w-20 text-right text-xs text-muted-foreground">{p.city}</div>
                <div className="w-20 text-right text-sm font-semibold">{p.games}</div>
                <div className="w-20 text-right text-sm font-bold text-primary">{p.rep}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features coming */}
        <div className="grid sm:grid-cols-3 gap-4 mt-10">
          {[
            { emoji: '📊', title: 'Статистика', desc: 'Игры, победы, результативность' },
            { emoji: '🎯', title: 'Позиции', desc: 'Фильтр по амплуа и уровню' },
            { emoji: '🤝', title: 'Партнёры', desc: 'Ищи игроков рядом с тобой' },
          ].map(({ emoji, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border/60 bg-card/40 p-5 text-center">
              <div className="text-3xl mb-3">{emoji}</div>
              <div className="font-display font-bold text-sm mb-1">{title}</div>
              <div className="text-xs text-muted-foreground">{desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
