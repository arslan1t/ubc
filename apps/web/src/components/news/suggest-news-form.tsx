'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { X, ImagePlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import {
  useCreateSubmission,
  useUploadSubmissionImage,
  useResubmit,
  useMySubmissions,
  type SubmissionImage,
} from '@/hooks/use-submissions';

const CATEGORIES = [
  ['NEWS', 'Новости'],
  ['TOURNAMENTS', 'Турниры'],
  ['INTERVIEWS', 'Интервью'],
  ['PLAYERS', 'Игроки'],
  ['AMATEUR', 'Любители'],
  ['UNIVERSITY', 'Университет'],
] as const;

const schema = z.object({
  title: z.string().min(5, 'Минимум 5 символов'),
  category: z.enum(['NEWS', 'TOURNAMENTS', 'INTERVIEWS', 'PLAYERS', 'AMATEUR', 'UNIVERSITY']),
  excerpt: z.string().max(280).optional(),
  content: z.string().min(20, 'Расскажи подробнее (минимум 20 символов)'),
});

type FormValues = z.infer<typeof schema>;

const MAX_PHOTOS = 6;

const EMPTY_VALUES: FormValues = {
  title: '',
  category: 'NEWS',
  excerpt: '',
  content: '',
};

export function SuggestNewsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resubmitId = searchParams.get('resubmit');
  const { isAuthenticated } = useAuth();
  const { mutate: createSubmission, isPending: creating } = useCreateSubmission();
  const { mutate: resubmit, isPending: resubmitting } = useResubmit();
  const { mutateAsync: uploadImage } = useUploadSubmissionImage();
  const { data: mySubmissions } = useMySubmissions();
  const [photos, setPhotos] = useState<SubmissionImage[]>([]);
  const [uploadingCount, setUploadingCount] = useState(0);

  const resubmitTarget = resubmitId
    ? mySubmissions?.find((s) => s.id === resubmitId && s.status === 'CHANGES_REQUESTED')
    : undefined;
  const isPending = creating || resubmitting;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
    values: resubmitTarget ? { ...EMPTY_VALUES, ...resubmitTarget.payload } : undefined,
  });

  useEffect(() => {
    if (resubmitTarget?.payload.images) {
      setPhotos(resubmitTarget.payload.images);
    }
  }, [resubmitTarget]);

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-border bg-card/30 p-8 text-center">
        <p className="text-muted-foreground mb-4">Войдите, чтобы предложить новость</p>
        <Button asChild>
          <Link href="/auth/login">Войти</Link>
        </Button>
      </div>
    );
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const remaining = MAX_PHOTOS - photos.length;
    const toUpload = Array.from(files).slice(0, remaining);
    if (!toUpload.length) {
      toast.error(`Можно добавить не больше ${MAX_PHOTOS} фото`);
      return;
    }

    setUploadingCount((c) => c + toUpload.length);
    for (const file of toUpload) {
      if (!file.type.startsWith('image/')) continue;
      try {
        const result = await uploadImage(file);
        setPhotos((prev) => [...prev, result]);
      } catch {
        toast.error(`Не удалось загрузить ${file.name}`);
      } finally {
        setUploadingCount((c) => c - 1);
      }
    }
  };

  const removePhoto = (key: string) => {
    setPhotos((prev) => prev.filter((p) => p.key !== key));
  };

  const onSubmit = (data: FormValues) => {
    const payload = { ...data, images: photos };

    if (resubmitTarget) {
      resubmit(
        { id: resubmitTarget.id, payload },
        {
          onSuccess: () => {
            toast.success('Новость отправлена на повторную модерацию!');
            router.push('/profile');
          },
          onError: (err: any) =>
            toast.error(err?.response?.data?.message ?? 'Не удалось отправить'),
        },
      );
      return;
    }

    createSubmission(
      { type: 'NEWS', payload },
      {
        onSuccess: () => {
          toast.success('Спасибо! Новость отправлена на модерацию.');
          router.push('/profile');
        },
        onError: (err: any) =>
          toast.error(err?.response?.data?.message ?? 'Не удалось отправить'),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {resubmitTarget?.reviewNote && (
        <div className="rounded-lg border border-sky-400/30 bg-sky-400/5 px-4 py-3 text-sm">
          <p className="font-medium text-sky-400 mb-1">Комментарий модератора:</p>
          <p className="text-muted-foreground">«{resubmitTarget.reviewNote}»</p>
        </div>
      )}

      <div className="space-y-2">
        <Label>Заголовок *</Label>
        <Input {...register('title')} placeholder="Что произошло?" />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Категория</Label>
        <select {...register('category')} className="w-full h-10 rounded-lg border border-input bg-input px-3 text-sm">
          {CATEGORIES.map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Краткое описание</Label>
        <textarea
          {...register('excerpt')}
          rows={2}
          placeholder="Одно-два предложения для превью"
          className="w-full rounded-lg border border-input bg-input px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <Label>Текст *</Label>
        <textarea
          {...register('content')}
          rows={10}
          placeholder="Полный текст новости. Поддерживается Markdown."
          className="w-full rounded-lg border border-input bg-input px-3 py-2 text-sm resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Фото ({photos.length}/{MAX_PHOTOS})</Label>
        <div className="flex flex-wrap gap-3">
          {photos.map((photo) => (
            <div key={photo.key} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group">
              <Image src={photo.thumbnailUrl} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(photo.key)}
                className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          ))}

          {uploadingCount > 0 &&
            Array.from({ length: uploadingCount }).map((_, i) => (
              <div key={`uploading-${i}`} className="w-20 h-20 rounded-lg border border-dashed border-border flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ))}

          {photos.length + uploadingCount < MAX_PHOTOS && (
            <label className="w-20 h-20 rounded-lg border border-dashed border-border flex flex-col items-center justify-center gap-1 cursor-pointer text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
              <ImagePlus className="w-5 h-5" />
              <span className="text-[10px]">Добавить</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  handleFiles(e.target.files);
                  e.target.value = '';
                }}
              />
            </label>
          )}
        </div>
        <p className="text-xs text-muted-foreground">Первое фото станет обложкой, остальные — галереей</p>
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
        Новость пройдёт модерацию редакции перед публикацией.
      </div>

      <div className="flex gap-3">
        <Button type="submit" variant="gold" size="lg" disabled={isPending}>
          {isPending ? 'Отправляем...' : resubmitTarget ? 'Отправить повторно' : 'Отправить на модерацию'}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
          Отмена
        </Button>
      </div>
    </form>
  );
}
