import type { Metadata } from 'next';
import { Suspense } from 'react';
import { EventDetailContent } from './event-detail-content';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${API_URL}/events/${slug}`, { next: { revalidate: 300 } });
    if (res.ok) {
      const event = await res.json();
      const description =
        event.description?.slice(0, 160) ?? 'Баскетбольный турнир на UBC';
      return {
        title: event.title,
        description,
        openGraph: { title: event.title, description },
      };
    }
  } catch {
    // fall through to generic metadata
  }
  return { title: 'Турнир', description: 'Баскетбольный турнир на UBC' };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Suspense>
      <EventDetailContent slug={slug} />
    </Suspense>
  );
}
