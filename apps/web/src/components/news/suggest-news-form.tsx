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
  coverUrl: z.string().url('Неверная ссылка').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

export function SuggestNewsForm() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { mutate, isPending } = useCreateSubmission();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'NEWS' },
  });

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

  const onSubmit = (data: FormValues) => {
    mutate(
      { type: 'NEWS', payload: { ...data, coverUrl: data.coverUrl || undefined } },
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
      <div className="space-y-2">
        <Label>Заголовок *</Label>
        <Input {...register('title')} placeholder="Что произошло?" />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Категория</Label>
          <select {...register('category')} className="w-full h-10 rounded-lg border border-input bg-input px-3 text-sm">
            {CATEGORIES.map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Обложка (ссылка, необязательно)</Label>
          <Input {...register('coverUrl')} placeholder="https://..." />
          {errors.coverUrl && <p className="text-xs text-destructive">{errors.coverUrl.message}</p>}
        </div>
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

      <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
        Новость пройдёт модерацию редакции перед публикацией.
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
