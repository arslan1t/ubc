'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useNews } from '@/hooks/use-news';
import { NewsCard } from '@/components/news/news-card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { QueryError } from '@/components/ui/query-error';

const CATEGORIES = [
  { value: '', label: 'Все' },
  { value: 'NEWS', label: 'Новости' },
  { value: 'TOURNAMENTS', label: 'Турниры' },
  { value: 'INTERVIEWS', label: 'Интервью' },
  { value: 'PLAYERS', label: 'Игроки' },
  { value: 'AMATEUR', label: 'Любители' },
  { value: 'UNIVERSITY', label: 'Университет' },
];

export function NewsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') ?? '';

  const { data, isLoading, isError, refetch } = useNews({ category: activeCategory || undefined });

  const setCategory = (cat: string) => {
    const params = new URLSearchParams();
    if (cat) params.set('category', cat);
    router.push(`/news?${params.toString()}`);
  };

  const articles = data?.data ?? [];
  const [featured, ...rest] = articles;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,hsl(43_85%_53%/0.07)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-court-grid opacity-40" />
        <div className="container-page relative py-12 md:py-16 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Редакция</p>
            <h1 className="font-display font-black text-4xl md:text-5xl leading-none mb-2">
              <span style={{
                background: 'linear-gradient(135deg, hsl(43 85% 65%), hsl(43 85% 45%))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Новости</span>
            </h1>
            <p className="text-muted-foreground">Баскетбол Узбекистана в деталях</p>
          </div>
          <Link
            href="/news/suggest"
            className="shrink-0 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-[0_0_20px_hsl(43_85%_53%/0.3)]"
          >
            <Plus className="w-4 h-4" /> Предложить новость
          </Link>
        </div>
      </section>

      <div className="container-page py-8 space-y-8">
        {/* Category pills */}
        <div className="flex gap-2 flex-wrap pb-6 border-b border-border/60">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={cn(
                'px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all duration-200',
                activeCategory === cat.value
                  ? 'bg-primary text-primary-foreground shadow-[0_0_12px_hsl(43_85%_53%/0.3)]'
                  : 'bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary',
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="aspect-[21/9] rounded-2xl w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="aspect-video rounded-2xl" />
              ))}
            </div>
          </div>
        ) : isError ? (
          <QueryError onRetry={() => refetch()} />
        ) : articles.length ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.07 } }, hidden: {} }}
            className="space-y-4"
          >
            {/* Featured article — full width editorial */}
            {featured && (
              <motion.div
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              >
                <NewsCard article={featured} featured />
              </motion.div>
            )}

            {/* Remaining grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {rest.map((article: any) => (
                  <motion.div
                    key={article.id}
                    variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                  >
                    <NewsCard article={article} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/60 bg-card/20 p-14 text-center">
            <h3 className="font-display font-bold text-lg mb-2">Нет новостей</h3>
            <p className="text-muted-foreground text-sm">Попробуй другую категорию или предложи свою новость</p>
          </div>
        )}
      </div>
    </div>
  );
}
