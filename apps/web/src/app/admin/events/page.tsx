'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Users, X, ImagePlus, Loader2 } from 'lucide-react';
import {
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useUploadEventCover,
  useEventRegistrationsAdmin,
  type EventListItem,
  type EventStatus,
  type EventFormValues,
} from '@/hooks/use-events';
import { formatDate, getInitials } from '@/lib/utils';

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

function RegistrationsPanel({ eventId, onClose }: { eventId: string; onClose: () => void }) {
  const { data, isLoading } = useEventRegistrationsAdmin(eventId);
  return (
    <div className="rounded-xl border border-border bg-card p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Зарегистрированные участники</h3>
        <button onClick={onClose} className="p-1 rounded hover:bg-secondary"><X className="w-4 h-4" /></button>
      </div>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Загрузка...</p>
      ) : !data || data.length === 0 ? (
        <p className="text-sm text-muted-foreground">Пока никого.</p>
      ) : (
        <div className="space-y-2">
          {data.map((r: any) => (
            <div key={r.id} className="flex items-center gap-3 text-sm">
              <span className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                {getInitials(r.user.firstName, r.user.lastName)}
              </span>
              <span>{r.user.firstName} {r.user.lastName}</span>
              {r.user.telegramUsername && (
                <span className="text-xs text-muted-foreground">@{r.user.telegramUsername}</span>
              )}
              <span className="text-xs text-muted-foreground ml-auto">{formatDate(r.createdAt, 'd MMM, HH:mm')}</span>
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
