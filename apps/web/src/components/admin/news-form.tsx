'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, Edit, Save, Send, X, ImagePlus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useUploadNewsCover,
  useAddNewsGalleryImage,
  useDeleteNewsGalleryImage,
} from '@/hooks/use-news';

const MAX_GALLERY = 10;

interface GalleryImage {
  id: string;
  thumbnailUrl: string;
}

function NewsPhotos({
  articleId,
  coverUrl,
  bannerUrl,
  gallery,
}: {
  articleId: string;
  coverUrl?: string | null;
  bannerUrl?: string | null;
  gallery: GalleryImage[];
}) {
  const { mutateAsync: uploadCover, isPending: coverUploading } = useUploadNewsCover();
  const { mutateAsync: addGalleryImage } = useAddNewsGalleryImage();
  const { mutate: deleteGalleryImage } = useDeleteNewsGalleryImage();
  const [galleryUploading, setGalleryUploading] = useState(0);

  const handleCoverChange = async (file: File | undefined, kind: 'cover' | 'banner' = 'cover') => {
    if (!file) return;
    try {
      await uploadCover({ id: articleId, file, kind });
    } catch {
      toast.error('Не удалось загрузить изображение');
    }
  };

  const handleGalleryFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const remaining = MAX_GALLERY - gallery.length;
    const toUpload = Array.from(files).slice(0, remaining);
    if (!toUpload.length) {
      toast.error(`Можно добавить не больше ${MAX_GALLERY} фото`);
      return;
    }
    setGalleryUploading((c) => c + toUpload.length);
    for (const file of toUpload) {
      if (!file.type.startsWith('image/')) continue;
      try {
        await addGalleryImage({ id: articleId, file });
      } catch {
        toast.error(`Не удалось загрузить ${file.name}`);
      } finally {
        setGalleryUploading((c) => c - 1);
      }
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <Label className="text-sm font-medium">Обложка (карточка в списке)</Label>
        <div className="mt-1.5 flex items-center gap-3">
          {coverUrl ? (
            <div className="relative w-28 h-20 rounded-lg overflow-hidden border border-border shrink-0">
              <Image src={coverUrl} alt="" fill className="object-cover" />
            </div>
          ) : (
            <div className="w-28 h-20 rounded-lg border border-dashed border-border flex items-center justify-center shrink-0 text-muted-foreground text-xs">
              Нет
            </div>
          )}
          <label className="flex items-center gap-2 rounded-lg border border-border bg-card/30 px-3 py-2 text-sm cursor-pointer hover:bg-secondary transition-colors">
            {coverUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
            {coverUploading ? 'Загружаем...' : coverUrl ? 'Заменить' : 'Загрузить обложку'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={coverUploading}
              onChange={(e) => {
                handleCoverChange(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </label>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">Заглавное изображение (страница статьи)</Label>
        <div className="mt-1.5 flex items-center gap-3">
          {bannerUrl ? (
            <div className="relative w-28 h-20 rounded-lg overflow-hidden border border-border shrink-0">
              <Image src={bannerUrl} alt="" fill className="object-cover" />
            </div>
          ) : (
            <div className="w-28 h-20 rounded-lg border border-dashed border-border flex items-center justify-center shrink-0 text-muted-foreground text-xs text-center px-1">
              Пусто — берётся обложка
            </div>
          )}
          <label className="flex items-center gap-2 rounded-lg border border-border bg-card/30 px-3 py-2 text-sm cursor-pointer hover:bg-secondary transition-colors">
            {coverUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
            {coverUploading ? 'Загружаем...' : bannerUrl ? 'Заменить' : 'Загрузить заглавное'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={coverUploading}
              onChange={(e) => {
                handleCoverChange(e.target.files?.[0], 'banner');
                e.target.value = '';
              }}
            />
          </label>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">Галерея ({gallery.length}/{MAX_GALLERY})</Label>
        <div className="mt-1.5 flex flex-wrap gap-3">
          {gallery.map((img) => (
            <div key={img.id} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group">
              <Image src={img.thumbnailUrl} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={() => deleteGalleryImage(img.id)}
                className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          ))}

          {galleryUploading > 0 &&
            Array.from({ length: galleryUploading }).map((_, i) => (
              <div key={`u-${i}`} className="w-20 h-20 rounded-lg border border-dashed border-border flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ))}

          {gallery.length + galleryUploading < MAX_GALLERY && (
            <label className="w-20 h-20 rounded-lg border border-dashed border-border flex flex-col items-center justify-center gap-1 cursor-pointer text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
              <ImagePlus className="w-5 h-5" />
              <span className="text-[10px]">Добавить</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  handleGalleryFiles(e.target.files);
                  e.target.value = '';
                }}
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

const CATEGORIES = [
  { value: 'NEWS', label: 'Новости' },
  { value: 'TOURNAMENTS', label: 'Турниры' },
  { value: 'INTERVIEWS', label: 'Интервью' },
  { value: 'PLAYERS', label: 'Игроки' },
  { value: 'AMATEUR', label: 'Любители' },
  { value: 'UNIVERSITY', label: 'Университет' },
];

const schema = z.object({
  title: z.string().min(5, 'Минимум 5 символов'),
  excerpt: z.string().optional(),
  content: z.string().min(10, 'Минимум 10 символов'),
  category: z.string(),
});

type FormValues = z.infer<typeof schema>;

interface NewsFormProps {
  defaultValues?: Partial<FormValues & {
    id: string;
    isPublished?: boolean;
    coverUrl?: string | null;
    gallery?: GalleryImage[];
  }>;
  onSubmit: (values: FormValues & { isPublished: boolean }) => Promise<{ id: string }>;
  submitLabel?: string;
}

export function NewsForm({ defaultValues, onSubmit, submitLabel = 'Сохранить' }: NewsFormProps) {
  const router = useRouter();
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const isNew = !defaultValues?.id;

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      excerpt: defaultValues?.excerpt ?? '',
      content: defaultValues?.content ?? '',
      category: defaultValues?.category ?? 'NEWS',
    },
  });

  const contentValue = watch('content');

  const handleSave = async (values: FormValues, publish: boolean) => {
    setSaving(true);
    try {
      const result = await onSubmit({ ...values, isPublished: publish });
      toast.success(publish ? 'Статья опубликована!' : 'Черновик сохранён');
      if (isNew) {
        router.push(`/admin/news/${result.id}/edit`);
      } else {
        router.push('/admin/news');
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="space-y-6">
      {/* Title */}
      <div>
        <Label htmlFor="title" className="text-sm font-medium">Заголовок</Label>
        <Input
          id="title"
          className="mt-1.5 text-base"
          placeholder="Введите заголовок статьи..."
          {...register('title')}
        />
        {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
      </div>

      {/* Category */}
      <div>
        <Label htmlFor="category" className="text-sm font-medium">Категория</Label>
        <select
          id="category"
          className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          {...register('category')}
        >
          {CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Excerpt */}
      <div>
        <Label htmlFor="excerpt" className="text-sm font-medium">
          Лид <span className="text-muted-foreground font-normal">(краткое описание)</span>
        </Label>
        <textarea
          id="excerpt"
          rows={2}
          className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          placeholder="Краткое описание для превью..."
          {...register('excerpt')}
        />
      </div>

      {/* Photos — need an existing article id, so only shown once the draft is saved */}
      <div>
        <Label className="text-sm font-medium">Фото</Label>
        <div className="mt-1.5">
          {defaultValues?.id ? (
            <NewsPhotos
              articleId={defaultValues.id}
              coverUrl={defaultValues.coverUrl}
              bannerUrl={(defaultValues as any).bannerUrl}
              gallery={defaultValues.gallery ?? []}
            />
          ) : (
            <p className="text-xs text-muted-foreground rounded-lg border border-dashed border-border px-3 py-2.5">
              Сначала сохраните черновик — потом сможете загрузить обложку и фото
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-sm font-medium">
            Текст статьи <span className="text-muted-foreground font-normal">(Markdown)</span>
          </Label>
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            {preview ? <Edit className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {preview ? 'Редактировать' : 'Превью'}
          </button>
        </div>

        {preview ? (
          <div className="min-h-64 rounded-lg border border-border bg-card/30 p-5 prose prose-invert max-w-none
            prose-headings:font-display prose-headings:font-bold
            prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3
            prose-p:text-muted-foreground prose-p:leading-relaxed
            prose-a:text-primary prose-strong:text-foreground
            prose-hr:border-border prose-li:text-muted-foreground
          ">
            {contentValue
              ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{contentValue}</ReactMarkdown>
              : <p className="text-muted-foreground text-sm italic">Нет контента</p>
            }
          </div>
        ) : (
          <textarea
            rows={18}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-y"
            placeholder={`## Заголовок раздела\n\nТекст статьи на **Markdown**.\n\n- пункт 1\n- пункт 2\n\n[Ссылка](https://example.com)`}
            {...register('content')}
          />
        )}
        {errors.content && <p className="text-xs text-destructive mt-1">{errors.content.message}</p>}
      </div>

      {/* Markdown tip */}
      <div className="rounded-lg bg-card/50 border border-border/50 p-3 text-xs text-muted-foreground space-y-1">
        <div className="font-medium text-foreground mb-1">Подсказки по Markdown:</div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-0.5">
          <span>**жирный** → <strong>жирный</strong></span>
          <span>## Заголовок</span>
          <span>*курсив* → <em>курсив</em></span>
          <span>[текст](url) → ссылка</span>
          <span>--- → разделитель</span>
          <span>- элемент → список</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          disabled={saving}
          onClick={handleSubmit((v) => handleSave(v, false))}
        >
          <Save className="w-4 h-4 mr-2" />
          Сохранить черновик
        </Button>
        <Button
          type="button"
          variant="gold"
          disabled={saving}
          onClick={handleSubmit((v) => handleSave(v, true))}
        >
          <Send className="w-4 h-4 mr-2" />
          {saving ? 'Публикуем...' : 'Опубликовать'}
        </Button>
        <button
          type="button"
          onClick={() => router.push('/admin/news')}
          className="ml-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
