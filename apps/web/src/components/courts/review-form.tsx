'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCreateReview } from '@/hooks/use-courts';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function ReviewForm({ courtId }: { courtId: string }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const { isAuthenticated } = useAuth();
  const { mutate: createReview, isPending } = useCreateReview(courtId);

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-border bg-card/30 p-4 mb-4 text-sm text-muted-foreground">
        <Link href="/auth/login" className="text-primary hover:underline">Войдите</Link>
        {' '}чтобы оставить отзыв
      </div>
    );
  }

  const handleSubmit = () => {
    if (rating === 0) { toast.error('Выберите оценку'); return; }
    createReview(
      { rating, comment: comment.trim() || undefined },
      {
        onSuccess: () => {
          toast.success('Отзыв опубликован');
          setRating(0);
          setComment('');
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
