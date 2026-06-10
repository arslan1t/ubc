'use client';

import { use } from 'react';
import { useNewsArticleById } from '@/hooks/use-news';
import { NewsForm } from '@/components/admin/news-form';
import { useUpdateNews } from '@/hooks/use-news';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminNewsEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: article, isLoading } = useNewsArticleById(id);
  const { mutateAsync } = useUpdateNews();

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!article) return <div className="p-8 text-muted-foreground">Статья не найдена</div>;

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl">Редактировать статью</h1>
        <p className="text-muted-foreground text-sm mt-1 line-clamp-1">{article.title}</p>
      </div>
      <NewsForm
        defaultValues={{ ...article, id }}
        onSubmit={(values) => mutateAsync({ id, ...values })}
      />
    </div>
  );
}
