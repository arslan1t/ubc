'use client';

import { Users, MapPin, Zap, Trophy, Newspaper, Film, Star } from 'lucide-react';
import { useAnalyticsOverview } from '@/hooks/use-analytics';

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="font-display font-black text-2xl tabular-nums">{value.toLocaleString('ru-RU')}</div>
    </div>
  );
}

function SignupsBarChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="flex items-end gap-[2px] h-24">
      {data.map((d) => (
        <div key={d.date} className="flex-1 group relative">
          <div
            className="bg-primary/60 group-hover:bg-primary rounded-t-sm transition-colors"
            style={{ height: `${Math.max(2, (d.count / max) * 96)}px` }}
          />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block text-[10px] bg-card border border-border rounded px-1.5 py-0.5 whitespace-nowrap z-10">
            {d.date}: {d.count}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useAnalyticsOverview();

  if (isLoading || !data) {
    return (
      <div className="p-6 md:p-8 max-w-5xl space-y-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-secondary/40 animate-pulse" />)}
      </div>
    );
  }

  const { totals } = data;

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl md:text-3xl">Аналитика</h1>
        <p className="text-muted-foreground text-sm mt-1">Сводка по платформе в реальном времени</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard icon={Users} label="Пользователи" value={totals.users} />
        <StatCard icon={MapPin} label="Корты" value={totals.courts} />
        <StatCard icon={Zap} label="Pickup Games" value={totals.pickupGames} />
        <StatCard icon={Trophy} label="Турниры" value={totals.events} />
        <StatCard icon={Newspaper} label="Новости" value={totals.publishedNews} />
        <StatCard icon={Film} label="Медиа" value={totals.publishedMedia} />
        <StatCard icon={Star} label="Отзывы" value={totals.reviews} />
        <StatCard icon={Trophy} label="Регистрации на турниры" value={totals.eventRegistrations} />
      </div>

      <div className="rounded-xl border border-border bg-card p-4 mb-8">
        <h2 className="text-sm font-semibold mb-4">Регистрации за 30 дней</h2>
        <SignupsBarChart data={data.signupsLast30Days} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold mb-3">Топ кортов</h2>
          {data.topCourts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Пока нет данных</p>
          ) : (
            <div className="space-y-2">
              {data.topCourts.map((c, i) => (
                <div key={c.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{i + 1}. {c.name}</span>
                  <span className="text-muted-foreground shrink-0 ml-2">★ {c.rating} · {c.reviewCount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold mb-3">Топ организаторов</h2>
          {data.topOrganizers.length === 0 ? (
            <p className="text-sm text-muted-foreground">Пока нет данных</p>
          ) : (
            <div className="space-y-2">
              {data.topOrganizers.map((o, i) => (
                <div key={o.userId} className="flex items-center justify-between text-sm">
                  <span className="truncate">{i + 1}. {o.name}</span>
                  <span className="text-muted-foreground shrink-0 ml-2">{o.gamesOrganized} игр</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
