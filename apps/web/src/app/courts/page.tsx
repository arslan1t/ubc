import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CourtsPageContent } from './courts-content';

export const metadata: Metadata = {
  title: 'Корты',
  description: 'Баскетбольные корты Ташкента и Узбекистана с картой и фильтрами',
};

export default function CourtsPage() {
  return (
    <Suspense>
      <CourtsPageContent />
    </Suspense>
  );
}
