import Link from 'next/link';
import { ArrowRight, MapPin, Zap, Activity, ChevronRight, Video, CalendarDays, Newspaper, Users, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommunityStats } from '@/components/home/community-stats';
import { ActivityFeed } from '@/components/home/activity-feed';
import { CommunitySpotlight } from '@/components/home/community-spotlight';
import { UpcomingOpenRuns } from '@/components/home/upcoming-open-runs';
import { PopularCourts } from '@/components/home/popular-courts';
import { LatestNews } from '@/components/home/latest-news';
import { LatestMedia } from '@/components/home/latest-media';

const GOLD = 'hsl(43 75% 47%)';
const GOLD_LIGHT = 'hsl(43 90% 64%)';

const FEATURE_CARDS = [
  {
    href: '/media',
    label: 'MEDIA',
    sub: 'Видео и фото',
    desc: 'Хайлайты, репортажи и фото из мира узбекского баскетбола',
    icon: Camera,
    gradient: 'from-violet-600/20 to-transparent',
    border: 'border-violet-500/15 hover:border-violet-400/35',
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/10',
    arrowColor: 'text-violet-400',
  },
  {
    href: '/events',
    label: 'EVENTS',
    sub: 'Ивенты',
    desc: 'Турниры, тренировки и события по всему Узбекистану',
    icon: CalendarDays,
    gradient: 'from-sky-600/20 to-transparent',
    border: 'border-sky-500/15 hover:border-sky-400/35',
    iconColor: 'text-sky-400',
    iconBg: 'bg-sky-500/10',
    arrowColor: 'text-sky-400',
  },
  {
    href: '/courts',
    label: 'COURTS',
    sub: 'Корты',
    desc: 'Лучшие баскетбольные площадки — найди ближайший корт',
    icon: MapPin,
    gradient: 'from-emerald-600/20 to-transparent',
    border: 'border-emerald-500/15 hover:border-emerald-400/35',
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    arrowColor: 'text-emerald-400',
  },
  {
    href: '/pickup-games',
    label: 'PICKUP GAMES',
    sub: 'Открытые игры',
    desc: 'Записывайся на игру или организуй свой Pickup Run',
    icon: Zap,
    gradient: 'from-amber-600/20 to-transparent',
    border: 'border-primary/15 hover:border-primary/40',
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    arrowColor: 'text-primary',
  },
  {
    href: '/news',
    label: 'NEWS',
    sub: 'Новости',
    desc: 'Последние события и аналитика узбекского баскетбола',
    icon: Newspaper,
    gradient: 'from-rose-600/20 to-transparent',
    border: 'border-rose-500/15 hover:border-rose-400/35',
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-500/10',
    arrowColor: 'text-rose-400',
  },
  {
    href: '/players',
    label: 'PLAYERS',
    sub: 'Игроки',
    desc: 'Рейтинг и профили лучших игроков баскетбольного сообщества',
    icon: Users,
    gradient: 'from-slate-600/20 to-transparent',
    border: 'border-slate-500/15 hover:border-slate-400/35',
    iconColor: 'text-slate-300',
    iconBg: 'bg-slate-500/10',
    arrowColor: 'text-slate-300',
  },
];

export default function HomePage() {
  return (
    <>
      {/* ─── Hero — 16:9 ─── */}
      <section
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: '16/9' }}
      >
        {/* Background image — fills 16:9 frame */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/main.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-black/52" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]/40" />

        {/* All content is absolutely positioned to fit within the 16:9 frame */}
        <div
          className="absolute inset-0 flex flex-col"
          style={{ padding: '3.5% 4%' }}
        >
          {/* Main row — hero text + live panel */}
          <div className="flex-1 flex items-center">
            <div className="w-full grid lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-6 xl:gap-10 items-center">

              {/* LEFT — headline + CTAs */}
              <div className="max-w-2xl">
                {/* Eyebrow */}
                <div className="flex items-center gap-2 mb-[2.5%]">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[clamp(0.55rem,0.9vw,0.7rem)] font-bold uppercase tracking-[0.22em] text-white/45">
                    Uzbek Basketball Culture
                  </span>
                </div>

                {/* Main heading */}
                <h1
                  className="font-display font-black leading-[0.88] tracking-tighter mb-[2.5%]"
                >
                  <span
                    className="block text-[clamp(1.6rem,4.2vw,4rem)] text-white"
                  >
                    ONE CULTURE.
                  </span>
                  <span
                    className="block text-[clamp(1.6rem,4.2vw,4rem)] text-white"
                  >
                    ONE GAME.
                  </span>
                  <span
                    className="block text-[clamp(1.6rem,4.2vw,4rem)]"
                    style={{
                      background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    ONE COMMUNITY.
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-[clamp(0.7rem,1.1vw,1rem)] text-white/50 leading-relaxed mb-[3%]">
                  Единая экосистема баскетбола Узбекистана.
                  <br className="hidden sm:block" />
                  Находи корты, организуй игры, строй сообщество.
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <Link
                    href="/pickup-games"
                    className="inline-flex items-center gap-2 rounded-xl font-bold text-[clamp(0.65rem,1vw,0.85rem)] uppercase tracking-wide transition-all text-[#0a0a0a] bg-primary shadow-[0_0_28px_hsl(43_75%_47%/0.35)] hover:shadow-[0_0_50px_hsl(43_75%_47%/0.55)]"
                    style={{
                      padding: 'clamp(8px,1.2%,14px) clamp(16px,2.5%,28px)',
                    }}
                  >
                    <Zap className="w-[1em] h-[1em]" />
                    Find a Game
                  </Link>
                  <Link
                    href="/courts"
                    className="inline-flex items-center gap-2 rounded-xl font-semibold text-[clamp(0.65rem,1vw,0.85rem)] uppercase tracking-wide text-white transition-all"
                    style={{
                      padding: 'clamp(8px,1.2%,14px) clamp(16px,2.5%,28px)',
                      background: 'rgba(255,255,255,0.07)',
                      backdropFilter: 'blur(20px) saturate(150%)',
                      WebkitBackdropFilter: 'blur(20px) saturate(150%)',
                      border: '1px solid rgba(255,255,255,0.14)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
                    }}
                  >
                    <MapPin className="w-[1em] h-[1em]" />
                    Explore Courts
                  </Link>
                </div>
              </div>

              {/* RIGHT — Live Activities (Liquid Glass panel) */}
              <div
                className="hidden lg:flex flex-col overflow-hidden rounded-2xl"
                style={{
                  background: 'rgba(10, 10, 10, 0.52)',
                  backdropFilter: 'blur(40px) saturate(160%)',
                  WebkitBackdropFilter: 'blur(40px) saturate(160%)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 16px 48px rgba(0,0,0,0.6)',
                  maxHeight: 'clamp(220px, 40%, 340px)',
                }}
              >
                {/* Panel header */}
                <div
                  className="flex items-center gap-2 px-4 py-3 shrink-0"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white/65">
                    Live Activities
                  </span>
                </div>
                {/* Feed */}
                <div className="flex-1 overflow-hidden">
                  <ActivityFeed compact />
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM — Liquid Glass stats bar */}
          <div className="shrink-0">
            <CommunityStats inline />
          </div>
        </div>
      </section>

      {/* ─── Feature Cards Grid ─── */}
      <section className="section-padding">
        <div className="container-page">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Платформа</p>
            <h2 className="font-display font-black text-3xl md:text-4xl">
              Всё в одном месте
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {FEATURE_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group relative overflow-hidden bg-card p-7 transition-all duration-300 hover:bg-[#1e1e1e]"
                >
                  {/* Gradient accent */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className="relative">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 ${card.iconBg}`}>
                      <Icon className={`w-5 h-5 ${card.iconColor}`} />
                    </div>

                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                      {card.sub}
                    </p>
                    <h3 className="font-display font-black text-lg leading-tight mb-2.5 text-white">
                      {card.label}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {card.desc}
                    </p>

                    <div className={`mt-6 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${card.arrowColor} opacity-50 group-hover:opacity-100 group-hover:gap-3 transition-all`}>
                      Explore <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Divider ─── */}
      <div className="container-page">
        <div className="divider-court" />
      </div>

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
                  Прямо{' '}
                  <span className="gradient-gold">сейчас</span>
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
      <section className="section-padding bg-court-gradient">
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
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Редакция</p>
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
      <section className="section-padding bg-court-gradient">
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
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Следи за нами</p>
            <h2 className="font-display font-black text-2xl md:text-3xl">Каждый день на наших каналах</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border/60 max-w-3xl">
            {[
              {
                href: 'https://www.youtube.com/@ubculture',
                label: 'YouTube',
                sub: '@ubculture',
                iconColor: 'fill-red-500',
                hoverBg: 'hover:bg-red-500/5',
                svg: <svg viewBox="0 0 24 24" className="w-6 h-6 fill-red-500"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
              },
              {
                href: 'https://t.me/ubculture',
                label: 'Telegram',
                sub: '@ubculture',
                hoverBg: 'hover:bg-sky-500/5',
                svg: <svg viewBox="0 0 24 24" className="w-6 h-6 fill-sky-400"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>,
              },
              {
                href: 'https://www.instagram.com/ubcbasketbal/',
                label: 'Instagram',
                sub: '@ubcbasketbal',
                hoverBg: 'hover:bg-pink-500/5',
                svg: <svg viewBox="0 0 24 24" className="w-6 h-6 fill-pink-400"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>,
              },
            ].map(({ href, label, sub, hoverBg, svg }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex items-center gap-4 bg-card p-6 transition-all duration-300 ${hoverBg}`}
              >
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  {svg}
                </div>
                <div>
                  <div className="font-display font-bold text-sm text-white">{label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="section-padding">
        <div className="container-page">
          <div className="relative overflow-hidden bg-card border border-border p-10 md:p-16">
            <div className="absolute inset-0 bg-court-gradient" />
            <div className="absolute inset-0 bg-court-grid opacity-40" />

            <div className="relative z-10 max-w-xl">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Начни прямо сейчас</p>
              <h2 className="font-display font-black text-3xl md:text-5xl mb-5 leading-tight">
                Готов выйти на{' '}
                <span className="gradient-gold">корт?</span>
              </h2>
              <p className="text-muted-foreground mb-8 max-w-sm">
                Создай свой первый Pickup Game и собери команду прямо сейчас.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/pickup-games/create"
                  className="inline-flex items-center gap-2 px-6 py-3 font-bold text-sm uppercase tracking-wide transition-all"
                  style={{
                    background: GOLD,
                    color: '#0a0a0a',
                    boxShadow: `0 0 32px hsl(43 75% 47% / 0.3)`,
                  }}
                >
                  Создать Pickup Game
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/pickup-games"
                  className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-sm uppercase tracking-wide border border-border text-muted-foreground hover:text-foreground hover:border-border/80 transition-all"
                >
                  Найти игру
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
