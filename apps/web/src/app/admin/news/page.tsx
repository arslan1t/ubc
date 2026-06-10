'use client';

import Link from 'next/link';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { useAdminNews, useDeleteNews, useUpdateNews } from '@/hooks/use-news';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

const CATEGORY_LABELS: Record<string, string> = {
  NEWS: 'Новости', TOURNAMENTS: 'Турниры', INTERVIEWS: 'Интервью',
  PLAYERS: 'Игроки', AMATEUR: 'Любители', UNIVERSITY: 'Университет',
};

export default function AdminNewsPage() {
  const { data, isLoading, refetch } = useAdminNews({ limit: 50 });
  const deleteMutation = useDeleteNews();
  const updateMutation = useUpdateNews();

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Удалить статью "${title}"?`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Статья удалена');
    } catch {
      toast.error('Ошибка удаления');
    }
  };

  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    try {
      await updateMutation.mutateAsync({ id, isPublished: !isPublished });
      toast.success(isPublished ? 'Статья снята с публикации' : 'Статья опубликована');
    } catch {
      toast.error('Ошибка');
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl">Новости</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {data?.total ?? 0} статей
          </p>
        </div>
        <Button asChild variant="gold">
          <Link href="/admin/news/create">
            <Plus className="w-4 h-4 mr-2" />
            Написать
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-card/50 animate-pulse" />
          ))}
        </div>
      ) : data?.data?.length ? (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Заголовок</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Категория</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Дата</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Статус</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {data.data.map((article: any) => (
                <tr key={article.id} className="border-b border-border/50 hover:bg-card/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium line-clamp-1 max-w-xs">{article.title}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs">
                      {CATEGORY_LABELS[article.category] ?? article.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {article.publishedAt
                      ? formatDate(article.publishedAt, 'd MMM yyyy')
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={article.isPublished ? 'success' : 'outline'} className="text-xs">
                      {article.isPublished ? 'Опубликовано' : 'Черновик'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => handleTogglePublish(article.id, article.isPublished)}
                        className="p-1.5 rounded hover:bg-secondary transition-colors"
                        title={article.isPublished ? 'Снять с публикации' : 'Опубликовать'}
                      >
                        {article.isPublished
                          ? <EyeOff className="w-4 h-4 text-muted-foreground" />
                          : <Eye className="w-4 h-4 text-primary" />}
                      </button>
                      <Link
                        href={`/admin/news/${article.id}/edit`}
                        className="p-1.5 rounded hover:bg-secondary transition-colors"
                      >
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                      </Link>
                      <button
                        onClick={() => handleDelete(article.id, article.title)}
                        className="p-1.5 rounded hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-border/50 bg-card/30 p-12 text-center">
          <p className="text-muted-foreground mb-4">Нет статей</p>
          <Button asChild variant="gold">
            <Link href="/admin/news/create">Написать первую</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
