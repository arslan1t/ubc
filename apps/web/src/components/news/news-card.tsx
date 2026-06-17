import Link from 'next/link';
import Image from 'next/image';
import { Eye, Clock } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';

const CATEGORY_META: Record<string, { label: string; color: string; bg: string }> = {
  NEWS:        { label: 'Новости',    color: 'text-sky-400',    bg: 'bg-sky-400/15 border-sky-400/30' },
  TOURNAMENTS: { label: 'Турниры',   color: 'text-primary',     bg: 'bg-primary/15 border-primary/30' },
  INTERVIEWS:  { label: 'Интервью',  color: 'text-violet-400',  bg: 'bg-violet-400/15 border-violet-400/30' },
  PLAYERS:     { label: 'Игроки',    color: 'text-emerald-400', bg: 'bg-emerald-400/15 border-emerald-400/30' },
  AMATEUR:     { label: 'Любители',  color: 'text-amber-400',   bg: 'bg-amber-400/15 border-amber-400/30' },
  UNIVERSITY:  { label: 'Универ',    color: 'text-pink-400',    bg: 'bg-pink-400/15 border-pink-400/30' },
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
  const cat = CATEGORY_META[article.category] ?? { label: article.category, color: 'text-muted-foreground', bg: 'bg-secondary border-border' };

  if (featured) {
    return (
      <Link href={`/news/${article.slug}`} className={cn('group block', className)}>
        <article className="relative rounded-2xl border border-border/60 overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-[0_8px_40px_hsl(43_85%_53%/0.1)]">
          {/* Full bleed image */}
          <div className="relative aspect-[21/9] bg-secondary/40">
            {article.coverUrl ? (
              <Image
                src={article.coverUrl}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="100vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-card to-secondary/60 flex items-center justify-center">
                <span className="font-display font-black text-4xl text-muted-foreground/10 uppercase tracking-widest">UBC</span>
              </div>
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <span className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm mb-3',
                cat.bg, cat.color,
              )}>
                {cat.label}
              </span>
              <h2 className="font-display font-black text-xl md:text-3xl text-white leading-tight group-hover:text-primary transition-colors line-clamp-2">
                {article.title}
              </h2>
              {article.excerpt && (
                <p className="mt-2 text-sm text-white/60 line-clamp-2 hidden md:block">
                  {article.excerpt}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs text-white/50">
                <span>{article.author.firstName} {article.author.lastName}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(article.publishedAt, 'd MMM yyyy')}
                </span>
                {article.viewCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {article.viewCount.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/news/${article.slug}`} className={cn('group block', className)}>
      <article className="rounded-2xl border border-border/60 bg-card overflow-hidden h-full flex flex-col transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-[0_8px_24px_hsl(43_85%_53%/0.08)]">
        <div className="relative aspect-video bg-secondary/30 overflow-hidden shrink-0">
          {article.coverUrl ? (
            <Image
              src={article.coverUrl}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 to-card flex items-center justify-center">
              <span className="font-display font-black text-2xl text-muted-foreground/10 uppercase">UBC</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute top-3 left-3">
            <span className={cn(
              'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm',
              cat.bg, cat.color,
            )}>
              {cat.label}
            </span>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-display font-bold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2 flex-1 mb-3">
            {article.title}
          </h3>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-auto">
            <span className="font-medium">{article.author.firstName} {article.author.lastName}</span>
            <span>{formatDate(article.publishedAt, 'd MMM')}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
