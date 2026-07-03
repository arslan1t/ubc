'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Plus, Pencil, Trash2, Users, X, ImagePlus, Loader2,
  Check, Ban, ExternalLink, GitBranch, RefreshCw,
} from 'lucide-react';
import {
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useUploadEventCover,
  useEventRegistrationsAdmin,
  useReviewRegistration,
  useBracket,
  useGenerateBracket,
  useResetBracket,
  useUpdateMatch,
  type EventListItem,
  type EventStatus,
  type EventFormValues,
  type BracketMatch,
} from '@/hooks/use-events';
import { formatDate, getInitials, cn } from '@/lib/utils';

const STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: 'UPCOMING', label: 'Скоро' },
  { value: 'REGISTRATION_OPEN', label: 'Регистрация открыта' },
  { value: 'LIVE', label: 'Идёт сейчас' },
  { value: 'COMPLETED', label: 'Завершён' },
];

const EMPTY_FORM: EventFormValues = {
  title: '',
  slug: '',
  status: 'UPCOMING',
  startDate: '',
  location: '',
  address: '',
  coverUrl: '',
  description: '',
  rules: '',
  prizePool: '',
  maxParticipants: undefined,
  resultsSummary: '',
};

function toDatetimeLocal(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function EventForm({
  initial,
  eventId,
  onCancel,
  onSubmit,
  pending,
}: {
  initial: EventFormValues;
  eventId?: string;
  onCancel: () => void;
  onSubmit: (values: EventFormValues) => void;
  pending: boolean;
}) {
  const [values, setValues] = useState(initial);
  const uploadCover = useUploadEventCover();

  const set = <K extends keyof EventFormValues>(key: K, v: EventFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  const handleCoverFile = (file: File | undefined) => {
    if (!file || !eventId) return;
    uploadCover.mutate(
      { id: eventId, file },
      { onSuccess: (updated: any) => set('coverUrl', updated.coverUrl ?? '') },
    );
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
      className="rounded-xl border border-border bg-card p-4 space-y-3 mb-4"
    >
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">Название *</label>
          <input required value={values.title} onChange={(e) => set('title', e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Slug</label>
          <input value={values.slug ?? ''} onChange={(e) => set('slug', e.target.value)}
            placeholder="генерируется автоматически"
            className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Статус</label>
          <select value={values.status} onChange={(e) => set('status', e.target.value as EventStatus)}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50">
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Дата и время *</label>
          <input required type="datetime-local" value={toDatetimeLocal(values.startDate)}
            onChange={(e) => set('startDate', new Date(e.target.value).toISOString())}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Место *</label>
          <input required value={values.location} onChange={(e) => set('location', e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Адрес</label>
          <input value={values.address ?? ''} onChange={(e) => set('address', e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Обложка</label>
          <div className="flex items-center gap-2 mt-1">
            <input value={values.coverUrl ?? ''} onChange={(e) => set('coverUrl', e.target.value)}
              placeholder="URL или загрузи файл"
              className="flex-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50" />
            {eventId && (
              <label className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors cursor-pointer shrink-0" title="Загрузить файл">
                {uploadCover.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : (
                  <ImagePlus className="w-4 h-4 text-muted-foreground" />
                )}
                <input type="file" accept="image/*" className="hidden" disabled={uploadCover.isPending}
                  onChange={(e) => { handleCoverFile(e.target.files?.[0]); e.target.value = ''; }} />
              </label>
            )}
          </div>
          {values.coverUrl && (
            <div className="relative w-full h-24 mt-2 rounded-lg overflow-hidden border border-border">
              <Image src={values.coverUrl} alt="" fill className="object-cover" unoptimized />
            </div>
          )}
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Лимит участников</label>
          <input type="number" min={1} value={values.maxParticipants ?? ''}
            onChange={(e) => set('maxParticipants', e.target.value ? parseInt(e.target.value, 10) : undefined)}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50" />
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground">Описание</label>
        <textarea rows={2} value={values.description ?? ''} onChange={(e) => set('description', e.target.value)}
          className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Правила</label>
        <textarea rows={2} value={values.rules ?? ''} onChange={(e) => set('rules', e.target.value)}
          className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Призовой фонд</label>
        <textarea rows={2} value={values.prizePool ?? ''} onChange={(e) => set('prizePool', e.target.value)}
          className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50" />
      </div>
      {values.status === 'COMPLETED' && (
        <div>
          <label className="text-xs text-muted-foreground">Результаты</label>
          <textarea rows={2} value={values.resultsSummary ?? ''} onChange={(e) => set('resultsSummary', e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50" />
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={pending}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">
          {pending ? 'Сохраняем...' : 'Сохранить'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium">
          Отмена
        </button>
      </div>
    </form>
  );
}

const REG_STATUS_META: Record<string, { label: string; cls: string }> = {
  PENDING: { label: 'На проверке', cls: 'text-amber-400 bg-amber-400/10' },
  APPROVED: { label: 'Зачислен', cls: 'text-emerald-400 bg-emerald-400/10' },
  REJECTED: { label: 'Отклонён', cls: 'text-red-400 bg-red-400/10' },
};

function RegistrationsPanel({ eventId, onClose }: { eventId: string; onClose: () => void }) {
  const { data, isLoading } = useEventRegistrationsAdmin(eventId);
  const review = useReviewRegistration(eventId);

  const handleReject = (regId: string) => {
    const note = window.prompt('Причина отказа (увидит игрок):');
    if (note === null) return;
    review.mutate({ regId, status: 'REJECTED', note: note || undefined });
  };

  const pending = data?.filter((r) => r.status === 'PENDING') ?? [];
  const approved = data?.filter((r) => r.status === 'APPROVED') ?? [];
  const rejected = data?.filter((r) => r.status === 'REJECTED') ?? [];

  const renderRow = (r: any) => {
    const meta = REG_STATUS_META[r.status ?? 'APPROVED'] ?? REG_STATUS_META.APPROVED;
    return (
      <div key={r.id} className="rounded-lg border border-border/60 bg-secondary/20 p-3">
        <div className="flex items-center gap-3 text-sm">
          <span className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
            {getInitials(r.user.firstName, r.user.lastName)}
          </span>
          <div className="flex-1 min-w-0">
            <span className="font-medium">{r.user.firstName} {r.user.lastName}</span>
            {r.user.telegramUsername && (
              <span className="text-xs text-muted-foreground ml-2">@{r.user.telegramUsername}</span>
            )}
          </div>
          <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold', meta.cls)}>
            {meta.label}
          </span>
          {r.status === 'PENDING' && (
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => review.mutate({ regId: r.id, status: 'APPROVED' })}
                disabled={review.isPending}
                className="p-1.5 rounded-lg bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 transition-colors"
                title="Зачислить"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleReject(r.id)}
                disabled={review.isPending}
                className="p-1.5 rounded-lg bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-colors"
                title="Отклонить"
              >
                <Ban className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground pl-10">
          {r.height && <span>Рост: <b className="text-foreground">{r.height} см</b></span>}
          {r.weight && <span>Вес: <b className="text-foreground">{r.weight} кг</b></span>}
          {r.age && <span>Возраст: <b className="text-foreground">{r.age}</b></span>}
          {r.highlightUrl && (
            <a href={r.highlightUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sky-400 hover:underline">
              Хайлайт <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {r.instagram && (
            <a href={`https://instagram.com/${r.instagram}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-pink-400 hover:underline">
              @{r.instagram} <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <span className="ml-auto">{formatDate(r.createdAt, 'd MMM, HH:mm')}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">
          Заявки участников
          {pending.length > 0 && (
            <span className="ml-2 rounded-full bg-amber-400/15 text-amber-400 px-2 py-0.5 text-xs">
              {pending.length} на проверке
            </span>
          )}
        </h3>
        <button onClick={onClose} className="p-1 rounded hover:bg-secondary"><X className="w-4 h-4" /></button>
      </div>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Загрузка...</p>
      ) : !data || data.length === 0 ? (
        <p className="text-sm text-muted-foreground">Заявок пока нет.</p>
      ) : (
        <div className="space-y-2">
          {[...pending, ...approved, ...rejected].map(renderRow)}
        </div>
      )}
    </div>
  );
}

function BracketPanel({ eventId, onClose }: { eventId: string; onClose: () => void }) {
  const { data: bracket, isLoading } = useBracket(eventId);
  const generate = useGenerateBracket(eventId);
  const reset = useResetBracket(eventId);
  const updateMatch = useUpdateMatch(eventId);

  const matches = bracket?.matches ?? [];
  const totalRounds = matches.length ? Math.max(...matches.map((m) => m.round)) : 0;

  const handleScore = (m: BracketMatch) => {
    if (!m.player1 || !m.player2) return;
    const s1 = window.prompt(`Очки — ${m.player1.firstName} ${m.player1.lastName}:`, m.score1?.toString() ?? '');
    if (s1 === null) return;
    const s2 = window.prompt(`Очки — ${m.player2.firstName} ${m.player2.lastName}:`, m.score2?.toString() ?? '');
    if (s2 === null) return;
    const score1 = parseInt(s1, 10);
    const score2 = parseInt(s2, 10);
    if (isNaN(score1) || isNaN(score2)) return;
    if (score1 === score2) {
      window.alert('В 1v1 не бывает ничьей — счёт должен отличаться');
      return;
    }
    const winnerId = score1 > score2 ? m.player1Id! : m.player2Id!;
    updateMatch.mutate({ matchId: m.id, score1, score2, winnerId, status: 'COMPLETED' });
  };

  const toggleLive = (m: BracketMatch) => {
    updateMatch.mutate({ matchId: m.id, status: m.status === 'LIVE' ? 'SCHEDULED' : 'LIVE' });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Турнирная сетка</h3>
        <div className="flex items-center gap-2">
          {matches.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Сбросить сетку? Все результаты матчей будут удалены.')) reset.mutate();
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Сбросить
            </button>
          )}
          <button
            onClick={() => {
              if (matches.length && !window.confirm('Пересоздать сетку? Текущие результаты будут удалены.')) return;
              generate.mutate();
            }}
            disabled={generate.isPending}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50"
          >
            {generate.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {matches.length ? 'Пересоздать' : 'Сгенерировать из одобренных'}
          </button>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary"><X className="w-4 h-4" /></button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Загрузка...</p>
      ) : !matches.length ? (
        <p className="text-sm text-muted-foreground">
          Сетки ещё нет. Одобри участников и нажми «Сгенерировать» — игроки будут расставлены случайно.
        </p>
      ) : (
        <div className="space-y-4">
          {Array.from({ length: totalRounds }, (_, i) => i + 1).map((round) => (
            <div key={round}>
              <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Раунд {round} из {totalRounds}
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {matches.filter((m) => m.round === round).map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      'rounded-lg border p-2.5 text-sm',
                      m.status === 'LIVE' ? 'border-emerald-400/50' : 'border-border/60',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0 space-y-1">
                        {[
                          { p: m.player1, s: m.score1 },
                          { p: m.player2, s: m.score2 },
                        ].map(({ p, s }, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-2">
                            <span className={cn(
                              'truncate text-xs',
                              p && m.winnerId === p.id ? 'font-bold text-primary' : '',
                              !p && 'text-muted-foreground italic',
                            )}>
                              {p ? `${p.firstName} ${p.lastName}` : 'Ожидается'}
                            </span>
                            <span className="text-xs font-display font-black tabular-nums">{s ?? '–'}</span>
                          </div>
                        ))}
                      </div>
                      {m.player1 && m.player2 && (
                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            onClick={() => handleScore(m)}
                            className="px-2 py-1 rounded bg-secondary/60 text-[11px] font-medium hover:bg-secondary transition-colors"
                          >
                            Счёт
                          </button>
                          {m.status !== 'COMPLETED' && (
                            <button
                              onClick={() => toggleLive(m)}
                              className={cn(
                                'px-2 py-1 rounded text-[11px] font-medium transition-colors',
                                m.status === 'LIVE'
                                  ? 'bg-emerald-400/20 text-emerald-400'
                                  : 'bg-secondary/60 hover:bg-secondary',
                              )}
                            >
                              {m.status === 'LIVE' ? 'LIVE ✓' : 'LIVE'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminEventsPage() {
  const { data: events, isLoading } = useEvents();
  const create = useCreateEvent();
  const update = useUpdateEvent();
  const remove = useDeleteEvent();

  const [mode, setMode] = useState<'none' | 'create' | string>('none');
  const [viewingRegs, setViewingRegs] = useState<string | null>(null);
  const [viewingBracket, setViewingBracket] = useState<string | null>(null);

  const editingEvent = typeof mode === 'string' && mode !== 'none' && mode !== 'create'
    ? events?.find((e) => e.id === mode)
    : undefined;

  const handleDelete = (event: EventListItem) => {
    if (!window.confirm(`Удалить турнир "${event.title}"?`)) return;
    remove.mutate(event.id);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl">Турниры</h1>
          <p className="text-muted-foreground text-sm mt-1">Управление событиями и турнирами</p>
        </div>
        {mode === 'none' && (
          <button onClick={() => setMode('create')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
            <Plus className="w-4 h-4" /> Создать
          </button>
        )}
      </div>

      {mode === 'create' && (
        <EventForm
          initial={EMPTY_FORM}
          pending={create.isPending}
          onCancel={() => setMode('none')}
          onSubmit={(values) => create.mutate(values, { onSuccess: () => setMode('none') })}
        />
      )}

      {editingEvent && (
        <EventForm
          eventId={editingEvent.id}
          initial={{
            title: editingEvent.title,
            slug: editingEvent.slug,
            status: editingEvent.status,
            startDate: editingEvent.startDate,
            location: editingEvent.location,
            address: (editingEvent as any).address ?? '',
            coverUrl: editingEvent.coverUrl ?? '',
            description: (editingEvent as any).description ?? '',
            rules: (editingEvent as any).rules ?? '',
            prizePool: (editingEvent as any).prizePool ?? '',
            maxParticipants: editingEvent.maxParticipants ?? undefined,
            resultsSummary: (editingEvent as any).resultsSummary ?? '',
          }}
          pending={update.isPending}
          onCancel={() => setMode('none')}
          onSubmit={(values) => update.mutate({ id: editingEvent.id, dto: values }, { onSuccess: () => setMode('none') })}
        />
      )}

      {viewingRegs && <RegistrationsPanel eventId={viewingRegs} onClose={() => setViewingRegs(null)} />}
      {viewingBracket && <BracketPanel eventId={viewingBracket} onClose={() => setViewingBracket(null)} />}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-secondary/40 animate-pulse" />)}
        </div>
      ) : !events || events.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-12">Турниров пока нет</p>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div key={event.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{event.title}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {STATUS_OPTIONS.find((s) => s.value === event.status)?.label} · {formatDate(event.startDate, 'd MMM yyyy, HH:mm')} · {event.location}
                </div>
              </div>
              <button onClick={() => setViewingRegs(viewingRegs === event.id ? null : event.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary/50 text-xs font-medium hover:bg-secondary transition-colors">
                <Users className="w-3.5 h-3.5" /> {event.registrationCount}
              </button>
              <button onClick={() => setViewingBracket(viewingBracket === event.id ? null : event.id)}
                title="Турнирная сетка"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary/50 text-xs font-medium hover:bg-secondary transition-colors">
                <GitBranch className="w-3.5 h-3.5" /> Сетка
              </button>
              <button onClick={() => setMode(event.id)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                <Pencil className="w-4 h-4 text-muted-foreground" />
              </button>
              <button onClick={() => handleDelete(event)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
