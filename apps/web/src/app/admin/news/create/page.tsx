'use client';

import { NewsForm } from '@/components/admin/news-form';
import { useCreateNews } from '@/hooks/use-news';

export default function AdminNewsCreatePage() {
  const { mutateAsync } = useCreateNews();

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl">Новая статья</h1>
        <p className="text-muted-foreground text-sm mt-1">Напишите текст в формате Markdown</p>
      </div>
      <NewsForm onSubmit={(values) => mutateAsync(values)} />
    </div>
  );
}
