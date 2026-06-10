'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCourts } from '@/hooks/use-courts';
import { useCreateOpenRun } from '@/hooks/use-open-runs';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

const schema = z.object({
  courtId: z.string().uuid('Выберите корт'),
  title: z.string().min(2).optional().or(z.literal('')),
  description: z.string().optional(),
  date: z.string().min(1, 'Выберите дату'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Формат HH:MM'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Формат HH:MM'),
  maxParticipants: z.coerce.number().min(2).max(50),
  fee: z.coerce.number().min(0).optional(),
  isPublic: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function CreateOpenRunForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data: courtsData } = useCourts({ limit: 100 });
  const { mutate: createRun, isPending } = useCreateOpenRun();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      courtId: searchParams.get('courtId') ?? '',
      isPublic: true,
      maxParticipants: 10,
      fee: 0,
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-border bg-card/30 p-8 text-center">
        <p className="text-muted-foreground mb-4">
          Войдите, чтобы создать Open Run
        </p>
        <Button asChild>
          <Link href="/auth/login">Войти</Link>
        </Button>
      </div>
    );
  }

  const onSubmit = (data: FormValues) => {
    createRun(
      {
        ...data,
        title: data.title || undefined,
        fee: data.fee ?? 0,
      },
      {
        onSuccess: (run: any) => {
          toast.success('Open Run создан!');
          router.push(`/open-runs/${run.id}`);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message ?? 'Ошибка');
        },
      },
    );
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label>Корт *</Label>
        <select
          {...register('courtId')}
          className="w-full h-10 rounded-lg border border-input bg-input px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Выберите корт</option>
          {courtsData?.data?.map((court: any) => (
            <option key={court.id} value={court.id}>
              {court.name} — {court.address}
            </option>
          ))}
        </select>
        {errors.courtId && (
          <p className="text-xs text-destructive">{errors.courtId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Название (необязательно)</Label>
        <Input
          {...register('title')}
          placeholder="Например: Вечерняя пятница"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Дата *</Label>
          <Input type="date" {...register('date')} min={minDate} />
          {errors.date && (
            <p className="text-xs text-destructive">{errors.date.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Начало *</Label>
          <Input type="time" {...register('startTime')} />
          {errors.startTime && (
            <p className="text-xs text-destructive">{errors.startTime.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Конец *</Label>
          <Input type="time" {...register('endTime')} />
          {errors.endTime && (
            <p className="text-xs text-destructive">{errors.endTime.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Лимит участников *</Label>
          <Input
            type="number"
            {...register('maxParticipants')}
            min={2}
            max={50}
          />
          {errors.maxParticipants && (
            <p className="text-xs text-destructive">{errors.maxParticipants.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Взнос (сум, 0 = бесплатно)</Label>
          <Input type="number" {...register('fee')} min={0} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Описание</Label>
        <textarea
          {...register('description')}
          placeholder="Уровень игры, что брать с собой..."
          className="w-full rounded-lg border border-input bg-input px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          rows={3}
        />
      </div>

      <div className="rounded-lg border border-border bg-card/30 p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register('isPublic')}
            className="w-4 h-4 rounded border-border accent-primary"
          />
          <div>
            <div className="font-medium text-sm">Открытый Open Run</div>
            <div className="text-xs text-muted-foreground">
              Все желающие могут сразу записаться без одобрения
            </div>
          </div>
        </label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" variant="gold" size="lg" disabled={isPending}>
          {isPending ? 'Создаём...' : 'Создать Open Run'}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
          Отмена
        </Button>
      </div>
    </form>
  );
}
