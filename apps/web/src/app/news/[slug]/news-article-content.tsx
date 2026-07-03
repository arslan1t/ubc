'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Eye, Calendar, User } from 'lucide-react';
import { useNewsArticle } from '@/hooks/use-news';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const CATEGORY_LABELS: Record<string, string> = {
  NEWS: 'Новости',
  TOURNAMENTS: 'Турниры',
  INTERVIEWS: 'Интервью',
  PLAYERS: 'Игроки',
  AMATEUR: 'Любители',
  UNIVERSITY: 'Университет',
};

export function NewsArticleContent({ slug }: { slug: string }) {
  const { data: article, isLoading } = useNewsArticle(slug);

  if (isLoading) {
    return (
      <div className="container-page py-12 max-w-3xl space-y-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-5 w-48" />
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container-page py-12 text-center">
        <p className="text-muted-foreground">Статья не найдена</p>
      </div>
    );
  }

  return (
    <article className="pb-10">
      {/* Editorial hero — full-bleed cover with the headline on top */}
      {(article.bannerUrl ?? article.coverUrl) ? (
        <section className="relative overflow-hidden mb-10">
          <div className="relative aspect-[16/9] md:aspect-[21/9] max-h-[520px] w-full">
            <Image
              src={article.bannerUrl ?? article.coverUrl}
              alt={article.title}
              fill
              className="object-cover"
              priority
              quality={90}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/30 to-transparent" />
          </div>
          <div className="absolute inset-0 flex flex-col justify-end">
            <div className="container-page max-w-3xl pb-6 md:pb-10">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-primary mb-4 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Все новости
              </Link>
              <div className="mb-3">
                <Badge variant="gold" className="text-xs uppercase tracking-wider">
                  {CATEGORY_LABELS[article.category] ?? article.category}
                </Badge>
              </div>
              <h1 className="font-display font-black text-2xl md:text-4xl lg:text-5xl leading-tight text-white drop-shadow-lg">
                {article.title}
              </h1>
            </div>
          </div>
        </section>
      ) : (
        <div className="container-page max-w-3xl pt-10">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Все новости
          </Link>
          <div className="mb-4">
            <Badge variant="gold" className="text-xs uppercase tracking-wider">
              {CATEGORY_LABELS[article.category] ?? article.category}
            </Badge>
          </div>
          <h1 className="font-display font-black text-3xl md:text-4xl lg:text-5xl leading-tight mb-6">
            {article.title}
          </h1>
        </div>
      )}

      <div className="container-page max-w-3xl">
      {/* Мета */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground mb-8 pb-8 border-b border-border/60">
        <Link href={`/players/${article.author.id}`} className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
            {article.author.firstName?.[0]}{article.author.lastName?.[0]}
          </div>
          <span className="group-hover:text-primary transition-colors">{article.author.firstName} {article.author.lastName}</span>
        </Link>
        {article.publishedAt && (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(article.publishedAt, 'd MMMM yyyy')}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" />
          <span>{article.viewCount} просмотров</span>
        </div>
      </div>

      {/* Лид */}
      {article.excerpt && (
        <p className="text-lg text-muted-foreground leading-relaxed mb-8 font-medium">
          {article.excerpt}
        </p>
      )}

      {/* Контент — markdown */}
      <div className="prose prose-invert max-w-none
        prose-headings:font-display prose-headings:font-bold prose-headings:text-foreground
        prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
        prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border/50
        prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:my-4
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-strong:text-foreground prose-strong:font-semibold
        prose-hr:border-border/50 prose-hr:my-8
        prose-li:text-muted-foreground prose-li:my-1
        prose-ul:my-4 prose-ol:my-4
        prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
        prose-code:text-primary prose-code:bg-card prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
      ">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {article.content}
        </ReactMarkdown>
      </div>

      {/* Галерея */}
      {article.gallery?.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display font-bold text-xl mb-5">Фотогалерея</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {article.gallery.map((img: any) => (
              <div key={img.id} className="group relative aspect-video rounded-xl overflow-hidden border border-border/40">
                <Image
                  src={img.url}
                  alt={img.caption ?? article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                />
                {img.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-xs px-3 py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                    {img.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </article>
  );
}
