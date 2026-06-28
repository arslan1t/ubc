'use client';

import { Star, Trash2 } from 'lucide-react';
import { useAdminReviews, useAdminDeleteReview } from '@/hooks/use-courts';
import { formatRelativeDate, getInitials } from '@/lib/utils';

export default function AdminReviewsPage() {
  const { data, isLoading } = useAdminReviews();
  const remove = useAdminDeleteReview();
  const reviews = data?.data ?? [];

  const handleDelete = (id: string) => {
    if (!window.confirm('Удалить этот отзыв?')) return;
    remove.mutate(id);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl md:text-3xl">Отзывы</h1>
        <p className="text-muted-foreground text-sm mt-1">Все отзывы о кортах на платформе</p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-secondary/40 animate-pulse" />)}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-12">Отзывов пока нет</p>
      ) : (
        <div className="space-y-2">
          {reviews.map((review: any) => (
            <div key={review.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                {getInitials(review.user.firstName, review.user.lastName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{review.user.firstName} {review.user.lastName}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{review.court.name}</span>
                  <span className="flex items-center gap-0.5 text-amber-400 ml-auto shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {review.rating}
                  </span>
                </div>
                {review.comment && <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>}
                <p className="text-[11px] text-muted-foreground/60 mt-1">{formatRelativeDate(review.createdAt)}</p>
              </div>
              <button onClick={() => handleDelete(review.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors shrink-0">
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
