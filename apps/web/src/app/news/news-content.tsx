'use client';

import { PageHero } from '@/components/shared/page-hero';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, X } from 'lucide-react';
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

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  // Debounce so we don't hammer the API on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isError, refetch } = useNews({
    category: activeCategory || undefined,
    search: search || undefined,
  });

  const setCategory = (cat: string) => {
    const params = new URLSearchParams();
    if (cat) params.set('category', cat);
    router.push(`/news?${params.toString()}`);
  };

  const articles = data?.data ?? [];
  // Magazine rhythm: hero → two large secondary cards → the rest in a 3-col grid.
  // Search results skip the hero treatment so matches are scannable.
  const isSearching = !!search;
  const featured = isSearching ? undefined : articles[0];
  const secondary = isSearching ? [] : articles.slice(1, 3);
  const rest = isSearching ? articles : articles.slice(3);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <PageHero
        eyebrow="Редакция"
        goldTitle="Новости"
        subtitle="Баскетбол Узбекистана в деталях"
        action={
          <Link
            href="/news/suggest"
            className="shrink-0 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-[0_0_20px_hsl(43_85%_53%/0.3)]"
          >
            <Plus className="w-4 h-4" /> Предложить новость
          </Link>
        }
      />

      <div className="container-page py-8 space-y-8">
        {/* Category pills + search */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 pb-6 border-b border-border/60">
          <div className="flex gap-2 flex-wrap flex-1">
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
          <div className="relative shrink-0 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Поиск по новостям…"
              className="w-full h-10 rounded-xl border border-border bg-secondary/40 pl-9 pr-8 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
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

            {/* Two large secondary cards */}
            {secondary.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {secondary.map((article: any) => (
                  <motion.div
                    key={article.id}
                    variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                  >
                    <NewsCard article={article} large />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Remaining grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
