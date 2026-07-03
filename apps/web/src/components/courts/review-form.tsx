'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star, ImagePlus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCreateReview } from '@/hooks/use-courts';
import {
  useCreateSubmission,
  useUploadSubmissionImage,
  type SubmissionImage,
} from '@/hooks/use-submissions';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const MAX_PHOTOS = 3;

export function ReviewForm({ courtId }: { courtId: string }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<SubmissionImage[]>([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const { isAuthenticated } = useAuth();
  const { mutate: createReview, isPending } = useCreateReview(courtId);
  const { mutate: createSubmission } = useCreateSubmission();
  const { mutateAsync: uploadImage } = useUploadSubmissionImage();

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-border bg-card/30 p-4 mb-4 text-sm text-muted-foreground">
        <Link href="/auth/login" className="text-primary hover:underline">Войдите</Link>
        {' '}чтобы оставить отзыв
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

  const handleSubmit = () => {
    if (rating === 0) { toast.error('Выберите оценку'); return; }
    const attachedPhotos = photos;
    createReview(
      { rating, comment: comment.trim() || undefined },
      {
        onSuccess: () => {
          if (attachedPhotos.length) {
            // Photos go through moderation before landing in the court gallery.
            createSubmission(
              {
                type: 'PHOTO',
                targetType: 'COURT',
                targetId: courtId,
                payload: { images: attachedPhotos, comment: comment.trim() || undefined },
              },
              {
                onSuccess: () =>
                  toast.success('Отзыв опубликован! Фото появятся в галерее после проверки модератором.'),
                onError: () =>
                  toast.error('Отзыв опубликован, но фото не удалось отправить на модерацию'),
              },
            );
          } else {
            toast.success('Отзыв опубликован');
          }
          setRating(0);
          setComment('');
          setPhotos([]);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message ?? 'Ошибка');
        },
      },
    );
  };

  return (
    <div className="rounded-lg border border-border bg-card/50 p-4 mb-6">
      <h3 className="font-medium text-sm mb-3">Оставить отзыв</h3>
      <div className="flex gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <button
            key={i}
            onMouseEnter={() => setHovered(i + 1)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(i + 1)}
          >
            <Star
              className={cn(
                'w-6 h-6 transition-colors',
                (hovered || rating) > i
                  ? 'text-primary fill-primary'
                  : 'text-muted-foreground',
              )}
            />
          </button>
        ))}
      </div>
      <textarea
        placeholder="Ваш комментарий (необязательно)"
        className="w-full rounded-lg border border-input bg-input px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      {/* Photos — reviewed by a moderator before they hit the gallery */}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        {photos.map((photo) => (
          <div key={photo.key} className="relative w-14 h-14 rounded-lg overflow-hidden border border-border group">
            <Image src={photo.thumbnailUrl} alt="" fill className="object-cover" />
            <button
              type="button"
              onClick={() => setPhotos((prev) => prev.filter((p) => p.key !== photo.key))}
              className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        ))}
        {uploadingCount > 0 &&
          Array.from({ length: uploadingCount }).map((_, i) => (
            <div key={`up-${i}`} className="w-14 h-14 rounded-lg border border-dashed border-border flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ))}
        {photos.length + uploadingCount < MAX_PHOTOS && (
          <label className="w-14 h-14 rounded-lg border border-dashed border-border flex flex-col items-center justify-center gap-0.5 cursor-pointer text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
            <ImagePlus className="w-4 h-4" />
            <span className="text-[9px]">Фото</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
            />
          </label>
        )}
        {photos.length > 0 && (
          <p className="text-[11px] text-muted-foreground">
            Фото попадут в галерею корта после проверки модератором
          </p>
        )}
      </div>

      <Button
        className="mt-3"
        size="sm"
        onClick={handleSubmit}
        disabled={isPending}
      >
        Опубликовать
      </Button>
    </div>
  );
}
