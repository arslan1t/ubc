import type { Metadata } from 'next';
import { Suspense } from 'react';
import { EventsPageContent } from './events-content';

export const metadata: Metadata = {
  title: 'Ивенты',
  description: 'Баскетбольные турниры и события Узбекистана',
};

export default function EventsPage() {
  return (
    <Suspense>
      <EventsPageContent />
    </Suspense>
  );
}
