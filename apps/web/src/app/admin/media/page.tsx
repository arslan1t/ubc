'use client';

import { useState } from 'react';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';
import {
  useAdminMedia,
  useCreateMedia,
  usePublishMedia,
  useDeleteMedia,
  type MediaFormValues,
} from '@/hooks/use-media';
import { cn } from '@/lib/utils';

const EMPTY_FORM: MediaFormValues = { title: '', description: '', type: 'VIDEO', youtubeUrl: '', isPublished: false };

const TYPE_LABEL: Record<string, string> = { VIDEO: 'Видео', PHOTO: 'Фото', INTERVIEW: 'Интервью', PODCAST: 'Подкаст' };

export default function AdminMediaPage() {
  const { data, isLoading } = useAdminMedia();
  const create = useCreateMedia();
  const publish = usePublishMedia();
  const remove = useDeleteMedia();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<MediaFormValues>(EMPTY_FORM);

  const items = data?.data ?? [];

  const set = <K extends keyof MediaFormValues>(key: K, v: MediaFormValues[K]) =>
    setForm((prev) => ({ ...prev, [key]: v }));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate(form, { onSuccess: () => { setCreating(false); setForm(EMPTY_FORM); } });
  };

  const handleDelete = (item: any) => {
    if (!window.confirm(`Удалить "${item.title}"?`)) return;
    remove.mutate(item.id);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl">Медиа</h1>
          <p className="text-muted-foreground text-sm mt-1">Видео, интервью и подкасты (YouTube)</p>
        </div>
        {!creating && (
          <button onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
            <Plus className="w-4 h-4" /> Создать
          </button>
        )}
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="rounded-xl border border-border bg-card p-4 space-y-3 mb-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Название *</label>
              <input required value={form.title} onChange={(e) => set('title', e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Тип</label>
              <select value={form.type} onChange={(e) => set('type', e.target.value as MediaFormValues['type'])}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50">
                {Object.entries(TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground">YouTube URL</label>
              <input value={form.youtubeUrl ?? ''} onChange={(e) => set('youtubeUrl', e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Описание</label>
            <textarea rows={2} value={form.description ?? ''} onChange={(e) => set('description', e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!form.isPublished} onChange={(e) => set('isPublished', e.target.checked)} />
            Опубликовать сразу
          </label>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={create.isPending}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">
              {create.isPending ? 'Сохраняем...' : 'Сохранить'}
            </button>
            <button type="button" onClick={() => setCreating(false)} className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium">
              Отмена
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-secondary/40 animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-12">Медиа пока нет</p>
      ) : (
        <div className="space-y-2">
          {items.map((item: any) => (
            <div key={item.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{item.title}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {TYPE_LABEL[item.type]} · {item.author.firstName} {item.author.lastName}
                </div>
              </div>
              <span className={cn('text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1',
                item.isPublished ? 'bg-emerald-500/15 text-emerald-400' : 'bg-secondary text-muted-foreground')}>
                {item.isPublished ? 'Опубликовано' : 'Черновик'}
              </span>
              {!item.isPublished && (
                <button onClick={() => publish.mutate(item.id)} disabled={publish.isPending}
                  className="p-2 rounded-lg hover:bg-emerald-500/10 transition-colors disabled:opacity-50">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </button>
              )}
              <button onClick={() => handleDelete(item)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
