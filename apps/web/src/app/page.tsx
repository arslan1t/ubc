import Link from 'next/link';
import { ArrowRight, MapPin, Zap, Activity, ChevronRight } from 'lucide-react';
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
      <section className="relative overflow-hidden min-h-[92vh] flex items-center">
        <video
          autoPlay muted loop playsInline preload="metadata"
          poster="/hero-poster.jpg"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/background.mp4" type="video/mp4" />
        </video>

        {/* Layered overlays */}
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-background" />
        {/* Subtle court-line radial */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,hsl(43_85%_53%/0.07)_0%,transparent_65%)]" />

        <div className="container-page relative z-10 w-full">
          <div className="flex flex-col items-center text-center py-28 md:py-32 gap-8">
            {/* Eyebrow tag */}
            <div
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary animate-fade-in"
              style={{ animationDelay: '0.05s', opacity: 0 }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Узбекистан · Баскетбол · Культура
            </div>

            {/* Main heading */}
            <div
              className="animate-fade-in"
              style={{ animationDelay: '0.15s', opacity: 0 }}
            >
              <h1 className="font-display font-black leading-[0.9] tracking-tighter">
                <span className="block text-5xl md:text-7xl lg:text-[6.5rem] text-white">
                  UZBEK
                </span>
                <span className="block text-5xl md:text-7xl lg:text-[6.5rem]" style={{
                  background: 'linear-gradient(135deg, hsl(43 85% 70%), hsl(43 85% 45%))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  BASKETBALL
                </span>
                <span className="block text-5xl md:text-7xl lg:text-[6.5rem] text-white">
                  CULTURE
                </span>
              </h1>
            </div>

            <p
              className="text-white/60 text-base md:text-xl max-w-xl leading-relaxed animate-fade-in"
              style={{ animationDelay: '0.25s', opacity: 0 }}
            >
              Единая экосистема баскетбола Узбекистана.
              Находи корты, организуй игры, строй сообщество.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-3 animate-fade-in"
              style={{ animationDelay: '0.35s', opacity: 0 }}
            >
              <Button asChild variant="gold" size="xl" className="rounded-2xl text-base font-bold shadow-[0_0_40px_hsl(43_85%_53%/0.35)] hover:shadow-[0_0_60px_hsl(43_85%_53%/0.55)] transition-all">
                <Link href="/pickup-games">
                  <Zap className="w-5 h-5 mr-2" />
                  Найти игру
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl" className="rounded-2xl border-white/20 text-white hover:bg-white/10 hover:border-white/40 hover:text-white text-base font-semibold backdrop-blur-sm">
                <Link href="/courts">
                  <MapPin className="w-5 h-5 mr-2" />
                  Корты
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom fade to background */}
        <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </section>

      {/* ─── Stats — overlapping hero bottom ─── */}
      <section className="relative z-20 -mt-10 md:-mt-14">
        <div className="container-page">
          <CommunityStats />
        </div>
      </section>

      {/* ─── Live Section ─── */}
      <section className="section-padding">
        <div className="container-page">
          <div className="flex items-center justify-between mb-8 md:mb-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Activity className="w-5 h-5 text-primary" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary animate-ping" />
              </div>
              <div>
                <h2 className="font-display font-black text-2xl md:text-3xl leading-none">
                  Прямо <span style={{
                    background: 'linear-gradient(135deg, hsl(43 85% 65%), hsl(43 85% 45%))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>сейчас</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Ближайшие игры и активность</p>
              </div>
            </div>
            <Link
              href="/pickup-games"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Все игры <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <UpcomingOpenRuns />
            </div>
            <div className="lg:col-span-1">
              <ActivityFeed />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Divider ─── */}
      <div className="container-page">
        <div className="divider-court" />
      </div>

      {/* ─── Community Spotlight ─── */}
      <section className="section-padding">
        <div className="container-page">
          <div className="flex items-center justify-between mb-8 md:mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Сообщество</p>
              <h2 className="font-display font-black text-2xl md:text-3xl leading-none">
                Звёзды недели
              </h2>
            </div>
            <Link href="/ranking" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
              Рейтинг <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <CommunitySpotlight />
        </div>
      </section>

      {/* ─── Popular Courts ─── */}
      <section className="section-padding bg-[radial-gradient(ellipse_at_50%_0%,hsl(43_85%_53%/0.05)_0%,transparent_70%)]">
        <div className="container-page">
          <div className="flex items-center justify-between mb-8 md:mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Площадки</p>
              <h2 className="font-display font-black text-2xl md:text-3xl leading-none">
                Лучшие корты
              </h2>
            </div>
            <Link href="/courts" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
              Все корты <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <PopularCourts />
        </div>
      </section>

      {/* ─── Divider ─── */}
      <div className="container-page">
        <div className="divider-court" />
      </div>

      {/* ─── Latest News ─── */}
      <section className="section-padding">
        <div className="container-page">
          <div className="flex items-center justify-between mb-8 md:mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Медиа</p>
              <h2 className="font-display font-black text-2xl md:text-3xl leading-none">
                Последние новости
              </h2>
            </div>
            <Link href="/news" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
              Все новости <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <LatestNews />
        </div>
      </section>

      {/* ─── Latest Media ─── */}
      <section className="section-padding bg-[radial-gradient(ellipse_at_50%_0%,hsl(43_85%_53%/0.05)_0%,transparent_70%)]">
        <div className="container-page">
          <div className="flex items-center justify-between mb-8 md:mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Контент</p>
              <h2 className="font-display font-black text-2xl md:text-3xl leading-none">
                Видео и фото
              </h2>
            </div>
            <Link href="/media" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
              Всё медиа <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <LatestMedia />
        </div>
      </section>

      {/* ─── Social channels ─── */}
      <section className="section-padding">
        <div className="container-page">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Следи за нами</p>
            <h2 className="font-display font-black text-2xl md:text-3xl">Каждый день на наших каналах</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              {
                href: 'https://www.youtube.com/@ubculture',
                label: 'YouTube',
                sub: '@ubculture',
                hover: 'hover:border-red-500/50 hover:bg-red-500/5',
                iconBg: 'bg-red-500/10 group-hover:bg-red-500/20',
                svg: <svg viewBox="0 0 24 24" className="w-7 h-7 fill-red-500"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
              },
              {
                href: 'https://t.me/ubculture',
                label: 'Telegram',
                sub: '@ubculture',
                hover: 'hover:border-sky-500/50 hover:bg-sky-500/5',
                iconBg: 'bg-sky-500/10 group-hover:bg-sky-500/20',
                svg: <svg viewBox="0 0 24 24" className="w-7 h-7 fill-sky-400"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>,
              },
              {
                href: 'https://www.instagram.com/ubcbasketbal/',
                label: 'Instagram',
                sub: '@ubcbasketbal',
                hover: 'hover:border-pink-500/50 hover:bg-pink-500/5',
                iconBg: 'bg-pink-500/10 group-hover:bg-pink-500/20',
                svg: <svg viewBox="0 0 24 24" className="w-7 h-7 fill-pink-400"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>,
              },
            ].map(({ href, label, sub, hover, iconBg, svg }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex flex-col items-center gap-4 rounded-2xl border border-border/60 bg-card/40 p-8 transition-all duration-300 ${hover}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${iconBg}`}>
                  {svg}
                </div>
                <div className="text-center">
                  <div className="font-display font-bold text-base">{label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="section-padding">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 p-8 md:p-14 text-center">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,hsl(43_85%_53%/0.1)_0%,transparent_70%)]" />
            <div className="absolute inset-0 bg-court-grid opacity-60" />

            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Начни прямо сейчас</p>
              <h2 className="font-display font-black text-3xl md:text-5xl mb-4 leading-tight">
                Готов выйти на <span style={{
                  background: 'linear-gradient(135deg, hsl(43 85% 65%), hsl(43 85% 45%))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>корт?</span>
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Создай свой первый Pickup Game и собери команду прямо сейчас.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild variant="gold" size="lg" className="rounded-2xl font-bold shadow-[0_0_40px_hsl(43_85%_53%/0.3)] hover:shadow-[0_0_60px_hsl(43_85%_53%/0.5)]">
                  <Link href="/pickup-games/create">
                    Создать Pickup Game
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-2xl">
                  <Link href="/pickup-games">Найти игру</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
