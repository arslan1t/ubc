'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Trash2, CheckCircle2, XCircle, Pencil, ImagePlus, Loader2 } from 'lucide-react';
import {
  useAdminMedia,
  useCreateMedia,
  useUpdateMedia,
  usePublishMedia,
  useUnpublishMedia,
  useUploadMediaPhoto,
  useDeleteMedia,
  type MediaFormValues,
} from '@/hooks/use-media';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const EMPTY_FORM: MediaFormValues = { title: '', description: '', type: 'VIDEO', youtubeUrl: '', isPublished: false };

const TYPE_LABEL: Record<string, string> = { VIDEO: 'Видео', PHOTO: 'Фото', INTERVIEW: 'Интервью', PODCAST: 'Подкаст' };

function MediaForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}: {
  form: MediaFormValues;
  setForm: (updater: (prev: MediaFormValues) => MediaFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
}) {
  const set = <K extends keyof MediaFormValues>(key: K, v: MediaFormValues[K]) =>
    setForm((prev) => ({ ...prev, [key]: v }));

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-border bg-card p-4 space-y-3 mb-4">
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
        {form.type !== 'PHOTO' && (
          <div className="sm:col-span-2">
            <label className="text-xs text-muted-foreground">YouTube URL</label>
            <input value={form.youtubeUrl ?? ''} onChange={(e) => set('youtubeUrl', e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50" />
          </div>
        )}
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Описание</label>
        <textarea rows={2} value={form.description ?? ''} onChange={(e) => set('description', e.target.value)}
          className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={!!form.isPublished} onChange={(e) => set('isPublished', e.target.checked)} />
        Опубликовано
      </label>
      {form.type === 'PHOTO' && (
        <p className="text-xs text-muted-foreground rounded-lg border border-dashed border-border px-3 py-2">
          Фото загружается отдельной кнопкой в списке после сохранения.
        </p>
      )}
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={isPending}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">
          {isPending ? 'Сохраняем...' : submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium">
          Отмена
        </button>
      </div>
    </form>
  );
}

export default function AdminMediaPage() {
  const { data, isLoading } = useAdminMedia();
  const create = useCreateMedia();
  const update = useUpdateMedia();
  const publish = usePublishMedia();
  const unpublish = useUnpublishMedia();
  const uploadPhoto = useUploadMediaPhoto();
  const remove = useDeleteMedia();

  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState<MediaFormValues>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<MediaFormValues>(EMPTY_FORM);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const items = data?.data ?? [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate(createForm, {
      onSuccess: () => { setCreating(false); setCreateForm(EMPTY_FORM); },
      onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Не удалось создать'),
    });
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setEditForm({
      title: item.title,
      description: item.description ?? '',
      type: item.type,
      youtubeUrl: item.youtubeUrl ?? '',
      isPublished: item.isPublished,
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    update.mutate(
      { id: editingId, ...editForm },
      {
        onSuccess: () => setEditingId(null),
        onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Не удалось сохранить'),
      },
    );
  };

  const handleTogglePublish = (item: any) => {
    const mutation = item.isPublished ? unpublish : publish;
    mutation.mutate(item.id, {
      onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Не удалось изменить статус'),
    });
  };

  const handlePhotoChange = (item: any, file: File | undefined) => {
    if (!file) return;
    setUploadingId(item.id);
    uploadPhoto.mutate(
      { id: item.id, file },
      {
        onSettled: () => setUploadingId(null),
        onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Не удалось загрузить фото'),
      },
    );
  };

  const handleDelete = (item: any) => {
    if (!window.confirm(`Удалить "${item.title}"?`)) return;
    remove.mutate(item.id, {
      onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Не удалось удалить'),
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl">Медиа</h1>
          <p className="text-muted-foreground text-sm mt-1">Видео, фото, интервью и подкасты</p>
        </div>
        {!creating && (
          <button onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
            <Plus className="w-4 h-4" /> Создать
          </button>
        )}
      </div>

      {creating && (
        <MediaForm
          form={createForm}
          setForm={setCreateForm}
          onSubmit={handleCreate}
          onCancel={() => { setCreating(false); setCreateForm(EMPTY_FORM); }}
          isPending={create.isPending}
          submitLabel="Сохранить"
        />
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-secondary/40 animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-12">Медиа пока нет</p>
      ) : (
        <div className="space-y-2">
          {items.map((item: any) =>
            editingId === item.id ? (
              <MediaForm
                key={item.id}
                form={editForm}
                setForm={setEditForm}
                onSubmit={handleUpdate}
                onCancel={() => setEditingId(null)}
                isPending={update.isPending}
                submitLabel="Сохранить изменения"
              />
            ) : (
              <div key={item.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                {item.type === 'PHOTO' && item.photoThumbnailUrl ? (
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-border">
                    <Image src={item.photoThumbnailUrl} alt="" fill className="object-cover" />
                  </div>
                ) : null}

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{item.title}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {TYPE_LABEL[item.type]} · {item.author.firstName} {item.author.lastName}
                  </div>
                </div>

                {item.type === 'PHOTO' && (
                  <label className="p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer" title="Загрузить фото">
                    {uploadingId === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    ) : (
                      <ImagePlus className="w-4 h-4 text-muted-foreground" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingId === item.id}
                      onChange={(e) => {
                        handlePhotoChange(item, e.target.files?.[0]);
                        e.target.value = '';
                      }}
                    />
                  </label>
                )}

                <span className={cn('text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 shrink-0',
                  item.isPublished ? 'bg-emerald-500/15 text-emerald-400' : 'bg-secondary text-muted-foreground')}>
                  {item.isPublished ? 'Опубликовано' : 'Черновик'}
                </span>

                <button
                  onClick={() => handleTogglePublish(item)}
                  disabled={publish.isPending || unpublish.isPending}
                  title={item.isPublished ? 'Снять с публикации' : 'Опубликовать'}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
                >
                  {item.isPublished ? (
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                </button>

                <button onClick={() => startEdit(item)} className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Редактировать">
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </button>

                <button onClick={() => handleDelete(item)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors" title="Удалить">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
