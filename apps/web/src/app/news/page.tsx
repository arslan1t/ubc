import type { Metadata } from 'next';
import { Suspense } from 'react';
import { NewsPageContent } from './news-content';

export const metadata: Metadata = {
  title: 'Новости',
  description: 'Новости баскетбола Узбекистана — турниры, игроки, интервью',
};

export default function NewsPage() {
  return (
    <Suspense>
      <NewsPageContent />
    </Suspense>
  );
}
