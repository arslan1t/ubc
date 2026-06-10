import { Star } from 'lucide-react';
import { formatRelativeDate, getInitials } from '@/lib/utils';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) {
    return (
      <p className="text-sm text-muted-foreground">Пока нет отзывов. Будьте первым!</p>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-lg border border-border bg-card/30 p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                {getInitials(review.user.firstName, review.user.lastName)}
              </div>
              <div>
                <div className="text-sm font-medium">
                  {review.user.firstName} {review.user.lastName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatRelativeDate(review.createdAt)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i < review.rating ? 'text-primary fill-primary' : 'text-muted-foreground'}`}
                />
              ))}
            </div>
          </div>
          {review.comment && (
            <p className="text-sm text-muted-foreground">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
}
