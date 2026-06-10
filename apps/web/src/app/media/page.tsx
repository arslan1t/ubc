import type { Metadata } from 'next';
import { Suspense } from 'react';
import { MediaPageContent } from './media-content';

export const metadata: Metadata = {
  title: 'Медиа',
  description: 'Видео, фото, интервью и подкасты о баскетболе Узбекистана',
};

export default function MediaPage() {
  return (
    <Suspense>
      <MediaPageContent />
    </Suspense>
  );
}
