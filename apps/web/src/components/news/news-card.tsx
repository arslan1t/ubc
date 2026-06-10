import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { formatDate, cn } from '@/lib/utils';

const CATEGORY_LABELS: Record<string, string> = {
  NEWS: 'Новости',
  TOURNAMENTS: 'Турниры',
  INTERVIEWS: 'Интервью',
  PLAYERS: 'Игроки',
  AMATEUR: 'Любители',
  UNIVERSITY: 'Университет',
};

interface NewsCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    coverUrl?: string;
    category: string;
    publishedAt: string;
    author: { firstName: string; lastName: string };
    viewCount: number;
  };
  featured?: boolean;
  className?: string;
}

export function NewsCard({ article, featured, className }: NewsCardProps) {
  return (
    <Link href={`/news/${article.slug}`} className={cn('group block', className)}>
      <article className="rounded-xl border border-border bg-card overflow-hidden card-hover h-full flex flex-col">
        <div className={cn(
          'relative bg-secondary/30 shrink-0',
          featured ? 'aspect-square' : 'aspect-square',
        )}>
          {article.coverUrl ? (
            <Image
              src={article.coverUrl}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes={featured
                ? '(max-width: 768px) 100vw, 60vw'
                : '(max-width: 768px) 100vw, 33vw'}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
              <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge variant="gold" className="text-xs backdrop-blur-sm">
              {CATEGORY_LABELS[article.category] ?? article.category}
            </Badge>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <h3 className={cn(
            'font-display font-semibold leading-snug group-hover:text-primary transition-colors mb-2',
            featured ? 'text-xl' : 'text-sm',
          )}>
            {article.title}
          </h3>

          {article.excerpt && (
            <p className="text-xs text-muted-foreground line-clamp-2 flex-1 mb-3">
              {article.excerpt}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
            <span>
              {article.author.firstName} {article.author.lastName}
            </span>
            <span>{formatDate(article.publishedAt, 'd MMM yyyy')}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
