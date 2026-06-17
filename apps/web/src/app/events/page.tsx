import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calendar, MapPin, Users, Trophy } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Ивенты — UBC',
  description: 'Баскетбольные турниры и события Узбекистана',
};

const MOCK_EVENTS = [
  {
    title: 'UBC Open Cup 2026',
    date: 'Август 2026',
    location: 'Ташкент',
    type: 'Турнир 3×3',
    participants: 64,
    prize: '5 000 000 сум',
    status: 'upcoming',
  },
  {
    title: 'Ночной баскетбол · Лето',
    date: 'Июль 2026',
    location: 'Ташкент, Chilonzor',
    type: 'Лига',
    participants: 32,
    prize: null,
    status: 'upcoming',
  },
  {
    title: 'UBC Streetball Classic',
    date: 'Июнь 2026',
    location: 'Ташкент',
    type: 'Стритбол',
    participants: 48,
    prize: '2 000 000 сум',
    status: 'past',
  },
];

export default function EventsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,hsl(43_85%_53%/0.1)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-court-grid opacity-40" />

        <div className="container-page relative py-16 md:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
              Соревнования
            </p>
            <h1 className="font-display font-black text-4xl md:text-6xl leading-none mb-4">
              Ивенты
              <span className="block" style={{
                background: 'linear-gradient(135deg, hsl(43 85% 65%), hsl(43 85% 45%))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>и турниры</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg">
              Официальные турниры, уличные чемпионаты и баскетбольные ивенты Узбекистана.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-14 space-y-10">
        {/* Coming soon overlay on mock events */}
        <div className="relative">
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 bg-background/60 backdrop-blur-md rounded-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-2 text-sm font-bold uppercase tracking-wider text-primary">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Скоро
            </div>
            <div className="text-center max-w-sm">
              <h2 className="font-display font-bold text-xl mb-2">Турниры на UBC</h2>
              <p className="text-muted-foreground text-sm">
                Регистрируйся на официальные турниры, следи за результатами и поднимайся в рейтинге.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="https://t.me/ubculture"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-[0_0_20px_hsl(43_85%_53%/0.3)]"
              >
                Следить в Telegram <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pickup-games/create"
                className="inline-flex items-center gap-2 rounded-xl border border-border/60 px-6 py-2.5 text-sm font-semibold hover:bg-secondary transition-colors"
              >
                Создать игру
              </Link>
            </div>
          </div>

          {/* Mock events */}
          <div className="rounded-2xl border border-border/60 overflow-hidden opacity-40 pointer-events-none select-none space-y-0 divide-y divide-border/40">
            {MOCK_EVENTS.map((ev) => (
              <div key={ev.title} className="bg-card/40 p-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className="shrink-0 w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-bold text-base">{ev.title}</h3>
                    {ev.status === 'upcoming' && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full px-2 py-0.5">
                        Скоро
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{ev.date}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.location}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{ev.participants} участников</span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xs text-muted-foreground">{ev.type}</div>
                  {ev.prize && <div className="font-display font-bold text-sm text-primary mt-0.5">{ev.prize}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What's coming */}
        <div>
          <h2 className="font-display font-bold text-xl mb-5">Что будет на платформе</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { emoji: '🏆', title: 'Турниры 3×3', desc: 'Официальные соревнования' },
              { emoji: '🗺️', title: 'Местные лиги', desc: 'По районам и городам' },
              { emoji: '📊', title: 'Результаты', desc: 'Live-обновления брекетов' },
              { emoji: '🎖️', title: 'Призы', desc: 'Призовые фонды и награды' },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="rounded-2xl border border-border/60 bg-card/40 p-5 text-center">
                <div className="text-3xl mb-3">{emoji}</div>
                <div className="font-display font-bold text-sm mb-1">{title}</div>
                <div className="text-xs text-muted-foreground">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
