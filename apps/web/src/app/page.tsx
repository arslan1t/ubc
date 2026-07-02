import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Zap, ChevronRight } from 'lucide-react';
import { CommunityStats } from '@/components/home/community-stats';
import { ActivityFeed } from '@/components/home/activity-feed';
import { UpcomingOpenRuns } from '@/components/home/upcoming-open-runs';
import { PopularCourts } from '@/components/home/popular-courts';
import { LatestNews } from '@/components/home/latest-news';
import { TournamentTeaser } from '@/components/home/tournament-teaser';
import { HeroBallVideo } from '@/components/home/hero-ball-video';

const GOLD = 'hsl(43 75% 47%)';
const GOLD_LIGHT = 'hsl(43 90% 64%)';

export default function HomePage() {
  return (
    <>
      {/* ─── Hero — solid black, ball video is a contained decorative element ─── */}
      <section
        className="relative w-full overflow-hidden bg-[#0a0a0a] min-h-[440px] sm:min-h-0"
        style={{ aspectRatio: '16/9' }}
      >
        {/* All content is absolutely positioned to fit within the 16:9 frame */}
        <div
          className="absolute inset-0 flex flex-col z-10"
          style={{ padding: '3.5% 4%' }}
        >
          {/* Main row — hero text + live panel. Ball is centered on THIS row,
              not the whole section, so it lines up with the text regardless
              of how much height the stats bar below eats into. */}
          <div className="relative flex-1 flex items-center">
            <HeroBallVideo />
            <div className="relative z-10 w-full grid lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-6 xl:gap-10 items-center">

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
                  className="font-display font-black leading-[0.85] tracking-tighter mb-[2.5%]"
                >
                  <span className="block text-[clamp(1.6rem,4.2vw,4rem)] text-white">
                    UZBEK
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
                    BASKETBALL
                  </span>
                  <span className="block text-[clamp(1.6rem,4.2vw,4rem)] text-white">
                    CULTURE
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-[clamp(0.78rem,1.1vw,1rem)] text-white/70 leading-relaxed mb-[3%] max-w-md">
                  Дом баскетбольной культуры Узбекистана.{' '}
                  <br className="hidden sm:block" />
                  Находи игры, открывай корты, знакомься с игроками.
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
                    Найти игру
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
                    Найти корт
                  </Link>
                </div>
              </div>

              {/* RIGHT — Live Activities (Liquid Glass panel) */}
              <div
                className="hidden lg:flex flex-col overflow-hidden rounded-2xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(56px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(56px) saturate(180%)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), inset 0 0 0 1px rgba(255,255,255,0.03), 0 16px 48px rgba(0,0,0,0.45)',
                  maxHeight: 'clamp(220px, 40%, 340px)',
                }}
              >
                {/* Panel header */}
                <div
                  className="flex items-center gap-2 px-4 py-3 shrink-0"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
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

          {/* Bottom — community stats bar */}
          <div className="shrink-0 pt-4">
            <CommunityStats inline />
          </div>
        </div>
      </section>

      {/* ─── Tournament Teaser ─── */}
      <section className="py-10 md:py-14">
        <div className="container-page">
          <TournamentTeaser />
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
                <Image src="/icons/icon-pulse.png" alt="" width={26} height={26} className="w-6 h-6" />
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

      {/* ─── Popular Courts ─── */}
      <section className="section-padding">
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
    </>
  );
}
