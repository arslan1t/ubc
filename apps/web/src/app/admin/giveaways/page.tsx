'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus, Pencil, Trash2, Users, X, Check, Ban, ExternalLink,
  ImagePlus, Loader2, Sparkles,
} from 'lucide-react';
import {
  useGiveaways,
  useCreateGiveaway,
  useUpdateGiveaway,
  useDeleteGiveaway,
  useUploadGiveawayCover,
  useGiveawayEntriesAdmin,
  useReviewGiveawayEntry,
  type GiveawayFormValues,
  type GiveawayListItem,
} from '@/hooks/use-giveaways';
import { formatDate, getInitials, cn } from '@/lib/utils';

const EMPTY_FORM: GiveawayFormValues = {
  title: '',
  prize: '',
  description: '',
  conditions: '',
  coverUrl: '',
};

const ENTRY_STATUS_META: Record<string, { label: string; cls: string }> = {
  PENDING: { label: 'На проверке', cls: 'text-amber-400 bg-amber-400/10' },
  APPROVED: { label: 'В пуле', cls: 'text-emerald-400 bg-emerald-400/10' },
  REJECTED: { label: 'Отклонён', cls: 'text-red-400 bg-red-400/10' },
};

function GiveawayForm({
  initial,
  giveawayId,
  onCancel,
  onSubmit,
  pending,
}: {
  initial: GiveawayFormValues;
  giveawayId?: string;
  onCancel: () => void;
  onSubmit: (values: GiveawayFormValues) => void;
  pending: boolean;
}) {
  const [values, setValues] = useState(initial);
  const uploadCover = useUploadGiveawayCover();

  const set = <K extends keyof GiveawayFormValues>(key: K, v: GiveawayFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: v }));

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
          <label className="text-xs text-muted-foreground">Приз *</label>
          <input required value={values.prize} onChange={(e) => set('prize', e.target.value)}
            placeholder="Джерси UBC, мяч Spalding…"
            className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50" />
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Описание</label>
        <textarea rows={2} value={values.description ?? ''} onChange={(e) => set('description', e.target.value)}
          className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Условия участия</label>
        <textarea rows={3} value={values.conditions ?? ''} onChange={(e) => set('conditions', e.target.value)}
          placeholder={'Подписаться на @ubculture\nСделать репост в сторис\nОтметить двух друзей'}
          className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Обложка</label>
        <div className="flex items-center gap-2 mt-1">
          <input value={values.coverUrl ?? ''} onChange={(e) => set('coverUrl', e.target.value)}
            placeholder="URL или загрузи файл"
            className="flex-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50" />
          {giveawayId && (
            <label className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors cursor-pointer shrink-0" title="Загрузить файл">
              {uploadCover.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : (
                <ImagePlus className="w-4 h-4 text-muted-foreground" />
              )}
              <input type="file" accept="image/*" className="hidden" disabled={uploadCover.isPending}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    uploadCover.mutate(
                      { id: giveawayId, file },
                      { onSuccess: (updated: any) => set('coverUrl', updated.coverUrl ?? '') },
                    );
                  }
                  e.target.value = '';
                }} />
            </label>
          )}
        </div>
        {values.coverUrl && (
          <div className="relative w-full h-24 mt-2 rounded-lg overflow-hidden border border-border">
            <Image src={values.coverUrl} alt="" fill className="object-cover" unoptimized />
          </div>
        )}
      </div>
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

function EntriesPanel({ giveawayId, onClose }: { giveawayId: string; onClose: () => void }) {
  const { data, isLoading, refetch } = useGiveawayEntriesAdmin(giveawayId);
  const review = useReviewGiveawayEntry(giveawayId);

  const handleReject = (entryId: string) => {
    const note = window.prompt('Причина отказа (увидит участник):');
    if (note === null) return;
    review.mutate({ entryId, status: 'REJECTED', note: note || undefined }, { onSuccess: () => refetch() });
  };

  const pending = data?.filter((e) => e.status === 'PENDING') ?? [];
  const rest = data?.filter((e) => e.status !== 'PENDING') ?? [];

  return (
    <div className="rounded-xl border border-border bg-card p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">
          Заявки
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
      ) : !data?.length ? (
        <p className="text-sm text-muted-foreground">Заявок пока нет.</p>
      ) : (
        <div className="space-y-2">
          {[...pending, ...rest].map((e) => {
            const meta = ENTRY_STATUS_META[e.status] ?? ENTRY_STATUS_META.PENDING;
            return (
              <div key={e.id} className="rounded-lg border border-border/60 bg-secondary/20 p-3">
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                    {getInitials(e.user.firstName, e.user.lastName)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{e.user.firstName} {e.user.lastName}</span>
                    {e.user.telegramUsername && (
                      <span className="text-xs text-muted-foreground ml-2">@{e.user.telegramUsername}</span>
                    )}
                  </div>
                  <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold', meta.cls)}>
                    {meta.label}
                  </span>
                  {e.status === 'PENDING' && (
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => review.mutate({ entryId: e.id, status: 'APPROVED' }, { onSuccess: () => refetch() })}
                        disabled={review.isPending}
                        className="p-1.5 rounded-lg bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 transition-colors"
                        title="В пул"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReject(e.id)}
                        disabled={review.isPending}
                        className="p-1.5 rounded-lg bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-colors"
                        title="Отклонить"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-muted-foreground pl-10">
                  {e.comment && <span className="italic">«{e.comment}»</span>}
                  {e.user.instagramUsername && (
                    <a href={`https://instagram.com/${e.user.instagramUsername}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-pink-400 hover:underline">
                      @{e.user.instagramUsername} <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <span className="ml-auto">{formatDate(e.createdAt, 'd MMM, HH:mm')}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminGiveawaysPage() {
  const { data: giveaways, isLoading } = useGiveaways();
  const create = useCreateGiveaway();
  const update = useUpdateGiveaway();
  const remove = useDeleteGiveaway();

  const [mode, setMode] = useState<'none' | 'create' | string>('none');
  const [viewingEntries, setViewingEntries] = useState<string | null>(null);

  const editing = typeof mode === 'string' && mode !== 'none' && mode !== 'create'
    ? giveaways?.find((g) => g.id === mode)
    : undefined;

  const handleDelete = (g: GiveawayListItem) => {
    if (!window.confirm(`Удалить розыгрыш «${g.title}»?`)) return;
    remove.mutate(g.id);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl">Розыгрыши</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Создание, проверка заявок и запуск колеса
          </p>
        </div>
        {mode === 'none' && (
          <button onClick={() => setMode('create')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
            <Plus className="w-4 h-4" /> Создать
          </button>
        )}
      </div>

      {mode === 'create' && (
        <GiveawayForm
          initial={EMPTY_FORM}
          pending={create.isPending}
          onCancel={() => setMode('none')}
          onSubmit={(values) => create.mutate(values, { onSuccess: () => setMode('none') })}
        />
      )}

      {editing && (
        <GiveawayForm
          giveawayId={editing.id}
          initial={{
            title: editing.title,
            prize: editing.prize,
            description: editing.description ?? '',
            conditions: editing.conditions ?? '',
            coverUrl: editing.coverUrl ?? '',
          }}
          pending={update.isPending}
          onCancel={() => setMode('none')}
          onSubmit={(values) => update.mutate({ id: editing.id, dto: values }, { onSuccess: () => setMode('none') })}
        />
      )}

      {viewingEntries && <EntriesPanel giveawayId={viewingEntries} onClose={() => setViewingEntries(null)} />}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-secondary/40 animate-pulse" />)}
        </div>
      ) : !giveaways?.length ? (
        <p className="text-center text-sm text-muted-foreground py-12">Розыгрышей пока нет</p>
      ) : (
        <div className="space-y-2">
          {giveaways.map((g) => (
            <div key={g.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {g.title}
                  <span className={cn(
                    'ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                    g.status === 'OPEN' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-white/10 text-white/50',
                  )}>
                    {g.status === 'OPEN' ? 'Открыт' : 'Завершён'}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  🏆 {g.prize} · {g.poolCount} в пуле
                  {g.winner && <> · Победитель: {g.winner.firstName} {g.winner.lastName}</>}
                </div>
              </div>
              <Link
                href={`/giveaways/${g.id}`}
                title="Открыть страницу с колесом"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" /> Колесо
              </Link>
              <button onClick={() => setViewingEntries(viewingEntries === g.id ? null : g.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary/50 text-xs font-medium hover:bg-secondary transition-colors">
                <Users className="w-3.5 h-3.5" /> Заявки
              </button>
              <button onClick={() => setMode(g.id)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                <Pencil className="w-4 h-4 text-muted-foreground" />
              </button>
              <button onClick={() => handleDelete(g)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
