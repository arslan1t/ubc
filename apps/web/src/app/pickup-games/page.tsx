import type { Metadata } from 'next';
import { Suspense } from 'react';
import { OpenRunsPageContent } from '@/app/open-runs/open-runs-content';

export const metadata: Metadata = {
  title: 'Pickup Games',
  description: 'Баскетбольные Pickup Games в Узбекистане — находи игры и записывайся',
};

export default function PickupGamesPage() {
  return (
    <Suspense>
      <OpenRunsPageContent />
    </Suspense>
  );
}
