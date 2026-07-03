'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar, MapPin, Trophy, ScrollText, Users, ChevronDown,
  ExternalLink, CheckCircle2, Clock3, XCircle, GitBranch,
} from 'lucide-react';
import {
  useEvent,
  useRegisterForEvent,
  useUnregisterFromEvent,
  useMyEventRegistration,
  useBracket,
} from '@/hooks/use-events';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Countdown } from '@/components/events/countdown';
import { EventApplicationForm } from '@/components/events/event-application-form';
import { TournamentBracket } from '@/components/events/tournament-bracket';
import { formatDate, getInitials } from '@/lib/utils';

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  UPCOMING: { label: 'Скоро', cls: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
  REGISTRATION_OPEN: { label: 'Регистрация открыта', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  LIVE: { label: 'Идёт сейчас', cls: 'bg-primary/15 text-primary border-primary/30' },
  COMPLETED: { label: 'Завершён', cls: 'bg-white/10 text-white/50 border-white/15' },
};

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl glass-content-card p-5 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-primary" />
        <h2 className="font-display font-bold text-sm uppercase tracking-widest">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function EventDetailContent({ slug }: { slug: string }) {
  const router = useRouter();
  const { data: event, isLoading } = useEvent(slug);
  const { user, isAuthenticated } = useAuth();
  const { mutate: register, isPending: registering } = useRegisterForEvent(event?.id ?? '', slug);
  const { mutate: unregister, isPending: unregistering } = useUnregisterFromEvent(event?.id ?? '', slug);
  const { data: myReg } = useMyEventRegistration(event?.id ?? '', isAuthenticated);
  const { data: bracket } = useBracket(event?.id ?? '', event?.status === 'LIVE');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [applying, setApplying] = useState(false);

  if (isLoading) {
    return (
      <div className="container-page py-8 max-w-4xl space-y-4">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container-page py-16 text-center">
        <p className="text-muted-foreground">Турнир не найден</p>
      </div>
    );
  }

  const status = STATUS_LABEL[event.status];
  const isFull = !!event.maxParticipants && event.registrationCount >= event.maxParticipants;
  const hasBracket = !!bracket?.matches?.length;

  return (
    <div className="min-h-screen pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ aspectRatio: '21/9' }}>
        <Image
          src={event.coverUrl ?? '/main.png'}
          alt={event.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
          <span className={`self-start text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 border mb-3 ${status.cls}`}>
            {status.label}
          </span>
          <h1 className="font-display font-black text-3xl md:text-5xl text-white leading-none mb-3">
            {event.title}
          </h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/70 mb-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(event.startDate, "d MMMM yyyy, HH:mm")}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {event.location}
            </span>
          </div>
          <Countdown target={event.startDate} />
        </div>
      </section>

      <div className="container-page py-8 grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6 order-2 lg:order-1">
          {hasBracket && (
            <Section icon={GitBranch} title="Турнирная сетка">
              {event.status === 'LIVE' && (
                <p className="text-xs text-emerald-400 mb-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Обновляется в реальном времени
                </p>
              )}
              <TournamentBracket matches={bracket!.matches} highlightUserId={user?.id} />
            </Section>
          )}

          {event.description && (
            <Section icon={ScrollText} title="О турнире">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{event.description}</p>
            </Section>
          )}

          {event.rules && (
            <Section icon={ScrollText} title="Правила">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{event.rules}</p>
            </Section>
          )}

          {event.schedule && event.schedule.length > 0 && (
            <Section icon={Calendar} title="Расписание">
              <div className="space-y-2">
                {event.schedule.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="font-display font-bold text-primary tabular-nums w-14 shrink-0">{item.time}</span>
                    <span className="text-muted-foreground">{item.title}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {event.sponsors && event.sponsors.length > 0 && (
            <Section icon={Trophy} title="Спонсоры">
              <div className="flex flex-wrap gap-4">
                {event.sponsors.map((s, i) => (
                  <span key={i} className="text-sm font-semibold text-white/70">{s.name}</span>
                ))}
              </div>
            </Section>
          )}

          {event.gallery.length > 0 && (
            <Section icon={ScrollText} title="Галерея">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {event.gallery.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden">
                    <Image src={img.mediumUrl} alt="" fill className="object-cover" />
                  </div>
                ))}
              </div>
            </Section>
          )}

          {event.faq && event.faq.length > 0 && (
            <Section icon={ScrollText} title="FAQ">
              <div className="divide-y divide-white/[0.07]">
                {event.faq.map((item, i) => (
                  <div key={i} className="py-3">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="flex w-full items-center justify-between text-left text-sm font-semibold"
                    >
                      {item.question}
                      <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    {openFaq === i && (
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.answer}</p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {event.status === 'COMPLETED' && event.resultsSummary && (
            <Section icon={Trophy} title="Результаты">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{event.resultsSummary}</p>
            </Section>
          )}
        </div>

        <div className="space-y-6 order-1 lg:order-2">
          <Section icon={Trophy} title="Призовой фонд">
            <p className="text-sm text-muted-foreground leading-relaxed">{event.prizePool ?? 'Уточняется'}</p>
          </Section>

          <div className="rounded-2xl glass-content-card p-5">
            {!isAuthenticated ? (
              <Button
                variant="gold"
                className="w-full"
                onClick={() => router.push(`/auth/login?redirect=/events/${slug}`)}
              >
                Войти и подать заявку
              </Button>
            ) : myReg?.status === 'PENDING' ? (
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-amber-400 font-semibold text-sm">
                  <Clock3 className="w-4 h-4" /> Заявка на рассмотрении
                </div>
                <p className="text-xs text-muted-foreground">
                  Мы проверим анкету и хайлайты — ответ придёт в уведомления.
                </p>
                <button
                  onClick={() => unregister()}
                  disabled={unregistering}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors underline"
                >
                  Отозвать заявку
                </button>
              </div>
            ) : myReg?.status === 'APPROVED' ? (
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4" /> Ты в игре!
                </div>
                <p className="text-xs text-muted-foreground">
                  Заявка одобрена. Следи за сеткой и временем своего матча.
                </p>
              </div>
            ) : myReg?.status === 'REJECTED' && !applying ? (
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-red-400 font-semibold text-sm">
                  <XCircle className="w-4 h-4" /> Заявка отклонена
                </div>
                {myReg.reviewNote && (
                  <p className="text-xs text-muted-foreground italic">«{myReg.reviewNote}»</p>
                )}
                <Button variant="outline" size="sm" className="w-full" onClick={() => setApplying(true)}>
                  Подать заявку снова
                </Button>
              </div>
            ) : applying || !myReg ? (
              applying ? (
                <EventApplicationForm
                  submitting={registering}
                  initial={myReg}
                  onSubmit={(app) =>
                    register(app, { onSuccess: () => setApplying(false) })
                  }
                  onCancel={() => setApplying(false)}
                />
              ) : (
                <Button
                  variant="gold"
                  className="w-full"
                  disabled={isFull || event.status === 'COMPLETED'}
                  onClick={() => setApplying(true)}
                >
                  {isFull ? 'Мест нет' : event.status === 'COMPLETED' ? 'Регистрация закрыта' : 'Подать заявку'}
                </Button>
              )
            ) : null}
            <p className="text-xs text-muted-foreground text-center mt-3">
              {event.registrationCount}
              {event.maxParticipants ? ` / ${event.maxParticipants}` : ''} зачислено
            </p>
          </div>

          <Section icon={Users} title="Участники">
            {event.registrations.length === 0 ? (
              <p className="text-sm text-muted-foreground">Пока никого. Будь первым!</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {event.registrations.map((r) => (
                  <Link
                    key={r.id}
                    href={`/players/${r.userId}`}
                    className="flex items-center gap-2 rounded-full bg-white/5 pl-1 pr-3 py-1 hover:bg-white/10 transition-colors"
                  >
                    {r.user.avatarUrl ? (
                      <Image src={r.user.avatarUrl} alt={r.user.firstName} width={24} height={24} className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                        {getInitials(r.user.firstName, r.user.lastName)}
                      </div>
                    )}
                    <span className="text-xs font-medium">{r.user.firstName}</span>
                  </Link>
                ))}
              </div>
            )}
          </Section>

          {event.address && (
            <Section icon={MapPin} title="Локация">
              <p className="text-sm text-muted-foreground mb-3">{event.address}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80"
              >
                Открыть в Google Maps <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
