import Link from 'next/link';
import { ArrowRight, MapPin, Zap, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommunityStats } from '@/components/home/community-stats';
import { ActivityFeed } from '@/components/home/activity-feed';
import { CommunitySpotlight } from '@/components/home/community-spotlight';
import { UpcomingOpenRuns } from '@/components/home/upcoming-open-runs';
import { PopularCourts } from '@/components/home/popular-courts';
import { LatestNews } from '@/components/home/latest-news';
import { LatestMedia } from '@/components/home/latest-media';

export default function HomePage() {
  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden min-h-[88vh] flex items-center">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/hero-poster.jpg"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-background to-transparent" />

        <div className="container-page relative z-10 w-full">
          <div className="flex flex-col items-center text-center py-24 md:py-28 gap-8">
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none">
                <span className="text-primary">U</span><span>ZBEK</span>
                <br />
                <span className="text-primary">B</span><span>ASKETBALL</span>
                <br />
                <span className="text-primary">C</span><span>ULTURE</span>
              </h1>
            </div>

            <p
              className="text-white/70 text-lg md:text-xl max-w-2xl animate-fade-in"
              style={{ animationDelay: '0.2s' }}
            >
              Одна экосистема для всего баскетбольного сообщества Узбекистана.
              Находи игры, организуй Pickup Games, открывай лучшие корты.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-3 animate-fade-in"
              style={{ animationDelay: '0.3s' }}
            >
              <Button asChild variant="gold" size="xl">
                <Link href="/pickup-games">
                  <Zap className="w-5 h-5 mr-2" />
                  Найти игру
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
                <Link href="/pickup-games/create">
                  Создать Pickup Game
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="xl" className="text-white/70 hover:text-white hover:bg-white/10">
                <Link href="/courts">
                  <MapPin className="w-5 h-5 mr-2" />
                  Корты
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Live community stats (overlaps hero bottom) ─── */}
      <section className="relative z-20 -mt-12 md:-mt-16">
        <div className="container-page">
          <CommunityStats />
        </div>
      </section>

      {/* ─── Live now: upcoming games + activity feed ─── */}
      <section className="section-padding">
        <div className="container-page">
          <div className="flex items-center gap-2 mb-8">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="font-display font-bold text-2xl md:text-3xl">
              Прямо <span className="text-primary">сейчас</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-lg">Ближайшие Pickup Games</h3>
                <Link href="/pickup-games" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                  Все игры <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <UpcomingOpenRuns />
            </div>
            <div className="lg:col-span-1">
              <ActivityFeed />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Community spotlight ─── */}
      <section className="section-padding bg-card/20">
        <div className="container-page">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display font-bold text-2xl md:text-3xl">
                Звёзды <span className="text-primary">сообщества</span>
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Самые активные игроки и лучшие площадки недели
              </p>
            </div>
            <Link href="/ranking" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 shrink-0">
              Рейтинг <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <CommunitySpotlight />
        </div>
      </section>

      {/* ─── Popular Courts ─── */}
      <section className="section-padding">
        <div className="container-page">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display font-bold text-2xl md:text-3xl">
                Популярные <span className="text-primary">корты</span>
              </h2>
              <p className="text-muted-foreground text-sm mt-1">Лучшие площадки Ташкента</p>
            </div>
            <Link href="/courts" className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              Все корты <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <PopularCourts />
        </div>
      </section>

      {/* ─── Latest News ─── */}
      <section className="section-padding bg-card/20">
        <div className="container-page">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display font-bold text-2xl md:text-3xl">
                Последние <span className="text-primary">новости</span>
              </h2>
              <p className="text-muted-foreground text-sm mt-1">Баскетбол Узбекистана в деталях</p>
            </div>
            <Link href="/news" className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              Все новости <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <LatestNews />
        </div>
      </section>

      {/* ─── Latest Media ─── */}
      <section className="section-padding">
        <div className="container-page">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display font-bold text-2xl md:text-3xl">
                Последнее <span className="text-primary">медиа</span>
              </h2>
              <p className="text-muted-foreground text-sm mt-1">Видео, фото и интервью</p>
            </div>
            <Link href="/media" className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              Всё медиа <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <LatestMedia />
        </div>
      </section>

      {/* ─── Social ─── */}
      <section className="section-padding bg-card/20 border-t border-border/50">
        <div className="container-page">
          <div className="text-center mb-10">
            <h2 className="font-display font-bold text-2xl md:text-3xl mb-2">Следи за нами</h2>
            <p className="text-muted-foreground text-sm">Контент каждый день — подписывайся на наши каналы</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <a href="https://www.youtube.com/@ubculture" target="_blank" rel="noopener noreferrer"
              className="group flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 hover:border-red-500/50 hover:bg-red-500/5 transition-all duration-200">
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-red-500"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </div>
              <div className="text-center"><div className="font-display font-bold text-base">YouTube</div><div className="text-xs text-muted-foreground mt-1">@ubculture</div></div>
            </a>
            <a href="https://t.me/ubculture" target="_blank" rel="noopener noreferrer"
              className="group flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 hover:border-sky-500/50 hover:bg-sky-500/5 transition-all duration-200">
              <div className="w-14 h-14 rounded-full bg-sky-500/10 flex items-center justify-center group-hover:bg-sky-500/20 transition-colors">
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-sky-400"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              </div>
              <div className="text-center"><div className="font-display font-bold text-base">Telegram</div><div className="text-xs text-muted-foreground mt-1">@ubculture</div></div>
            </a>
            <a href="https://www.instagram.com/ubcbasketbal/" target="_blank" rel="noopener noreferrer"
              className="group flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 hover:border-pink-500/50 hover:bg-pink-500/5 transition-all duration-200">
              <div className="w-14 h-14 rounded-full bg-pink-500/10 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-pink-400"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
              </div>
              <div className="text-center"><div className="font-display font-bold text-base">Instagram</div><div className="text-xs text-muted-foreground mt-1">@ubcbasketbal</div></div>
            </a>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="section-padding">
        <div className="container-page">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 md:p-12 text-center">
            <h2 className="font-display font-bold text-2xl md:text-3xl mb-3">Готов играть?</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Создай свой первый Pickup Game и собери команду прямо сейчас.
            </p>
            <Button asChild variant="gold" size="lg">
              <Link href="/pickup-games/create">
                Создать Pickup Game
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
