import type { Metadata } from 'next';
import { CourtDetailContent } from './court-detail-content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
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
