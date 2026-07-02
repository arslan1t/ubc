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
import { CourtLocationPicker } from '@/components/courts/court-location-picker';

const CITIES = ['Ташкент', 'Самарканд', 'Бухара', 'Наманган', 'Андижан', 'Фергана', 'Нукус', 'Другой'];

const schema = z.object({
  name: z.string().min(3, 'Минимум 3 символа'),
  address: z.string().min(3, 'Укажите адрес'),
  district: z.string().optional(),
  city: z.string().min(1, 'Выберите город'),
  type: z.enum(['OUTDOOR', 'INDOOR']),
  surface: z.enum(['ASPHALT', 'CONCRETE', 'RUBBER', 'HARDWOOD', 'OTHER']),
  isFree: z.boolean(),
  hasLighting: z.boolean(),
  hasChangingRooms: z.boolean(),
  hoops: z.coerce.number().min(1).max(20),
  description: z.string().optional(),
  latitude: z.number().refine((v) => v !== 0, 'Отметьте точку на карте'),
  longitude: z.number().refine((v) => v !== 0, 'Отметьте точку на карте'),
});

type FormValues = z.infer<typeof schema>;

const MAX_PHOTOS = 6;

const EMPTY_VALUES: FormValues = {
  name: '',
  address: '',
  district: '',
  city: 'Ташкент',
  type: 'OUTDOOR',
  surface: 'ASPHALT',
  isFree: true,
  hasLighting: false,
  hasChangingRooms: false,
  hoops: 2,
  description: '',
  latitude: 0,
  longitude: 0,
};

export function SuggestCourtForm() {
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
    setValue,
    watch,
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

  const lat = watch('latitude');
  const lon = watch('longitude');

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-border bg-card/30 p-8 text-center">
        <p className="text-muted-foreground mb-4">Войдите, чтобы предложить корт</p>
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
            toast.success('Заявка отправлена на повторную модерацию!');
            router.push('/profile');
          },
          onError: (err: any) =>
            toast.error(err?.response?.data?.message ?? 'Не удалось отправить'),
        },
      );
      return;
    }

    createSubmission(
      { type: 'COURT', payload },
      {
        onSuccess: () => {
          toast.success('Спасибо! Заявка отправлена на модерацию.');
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
        <Label>Название *</Label>
        <Input {...register('name')} placeholder="Напр.: Корт в парке Бабура" />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Город *</Label>
          <select {...register('city')} className="w-full h-10 rounded-lg border border-input bg-input px-3 text-sm">
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Адрес *</Label>
          <Input {...register('address')} placeholder="Улица, ориентир" />
          {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Район</Label>
          <Input {...register('district')} placeholder="Чиланзарский" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Где находится корт? *</Label>
        <CourtLocationPicker
          value={lat && lon ? { latitude: lat, longitude: lon } : null}
          onChange={({ latitude, longitude }) => {
            setValue('latitude', latitude, { shouldValidate: true });
            setValue('longitude', longitude, { shouldValidate: true });
          }}
        />
        {(errors.latitude || errors.longitude) && (
          <p className="text-xs text-destructive">Отметьте точку корта на карте</p>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Тип</Label>
          <select {...register('type')} className="w-full h-10 rounded-lg border border-input bg-input px-3 text-sm">
            <option value="OUTDOOR">Открытый</option>
            <option value="INDOOR">Крытый</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Покрытие</Label>
          <select {...register('surface')} className="w-full h-10 rounded-lg border border-input bg-input px-3 text-sm">
            <option value="ASPHALT">Асфальт</option>
            <option value="CONCRETE">Бетон</option>
            <option value="RUBBER">Резина</option>
            <option value="HARDWOOD">Паркет</option>
            <option value="OTHER">Другое</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Колец</Label>
          <Input type="number" {...register('hoops')} min={1} max={20} />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {([
          ['isFree', 'Бесплатный'],
          ['hasLighting', 'Освещение'],
          ['hasChangingRooms', 'Раздевалки'],
        ] as const).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2.5 rounded-lg border border-border bg-card/30 px-3 py-2.5 cursor-pointer text-sm">
            <input type="checkbox" {...register(key)} className="w-4 h-4 rounded border-border accent-primary" />
            {label}
          </label>
        ))}
      </div>

      <div className="space-y-2">
        <Label>Описание</Label>
        <textarea
          {...register('description')}
          rows={3}
          placeholder="Состояние корта, особенности, когда лучше приходить..."
          className="w-full rounded-lg border border-input bg-input px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
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
        <p className="text-xs text-muted-foreground">Необязательно, но с фото заявку одобряют быстрее</p>
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
        Заявка попадёт на модерацию. После одобрения корт появится на карте.
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
