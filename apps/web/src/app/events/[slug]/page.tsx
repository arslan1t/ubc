import { Suspense } from 'react';
import { EventDetailContent } from './event-detail-content';

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Suspense>
      <EventDetailContent slug={slug} />
    </Suspense>
  );
}
