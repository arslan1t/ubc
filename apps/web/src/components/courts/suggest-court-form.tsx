'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useCreateSubmission } from '@/hooks/use-submissions';
import { CourtLocationPicker } from '@/components/courts/court-location-picker';

const schema = z.object({
  name: z.string().min(3, 'Минимум 3 символа'),
  address: z.string().min(3, 'Укажите адрес'),
  district: z.string().optional(),
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

export function SuggestCourtForm() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { mutate, isPending } = useCreateSubmission();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'OUTDOOR',
      surface: 'ASPHALT',
      isFree: true,
      hasLighting: false,
      hasChangingRooms: false,
      hoops: 2,
      latitude: 0,
      longitude: 0,
    },
  });

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

  const onSubmit = (data: FormValues) => {
    mutate(
      { type: 'COURT', payload: data },
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
      <div className="space-y-2">
        <Label>Название *</Label>
        <Input {...register('name')} placeholder="Напр.: Корт в парке Бабура" />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
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

      <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
        Заявка попадёт на модерацию. После одобрения корт появится на карте.
      </div>

      <div className="flex gap-3">
        <Button type="submit" variant="gold" size="lg" disabled={isPending}>
          {isPending ? 'Отправляем...' : 'Отправить на модерацию'}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
          Отмена
        </Button>
      </div>
    </form>
  );
}
