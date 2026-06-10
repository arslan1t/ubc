import type { Metadata } from 'next';
import { Suspense } from 'react';
import { OpenRunsPageContent } from './open-runs-content';

export const metadata: Metadata = {
  title: 'Open Runs',
  description: 'Баскетбольные Open Runs в Узбекистане — находи игры и записывайся',
};

export default function OpenRunsPage() {
  return (
    <Suspense>
      <OpenRunsPageContent />
    </Suspense>
  );
}
