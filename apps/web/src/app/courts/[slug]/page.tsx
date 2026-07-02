import type { Metadata } from 'next';
import { CourtDetailContent } from './court-detail-content';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${API_URL}/courts/${slug}`, { next: { revalidate: 300 } });
    if (res.ok) {
      const court = await res.json();
      const description =
        court.description ??
        `Баскетбольный корт «${court.name}» — ${court.address}, ${court.city}`;
      const image = court.images?.[0]?.url;
      return {
        title: `${court.name} — корты UBC`,
        description,
        openGraph: {
          title: court.name,
          description,
          ...(image ? { images: [image] } : {}),
        },
      };
    }
  } catch {
    // fall through to generic metadata
  }
  return {
    title: `Корт — ${slug}`,
    description: 'Баскетбольный корт на UBC',
  };
}

export default async function CourtDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CourtDetailContent slug={slug} />;
}
