import type { Metadata } from 'next';
import { MediaDetailContent } from './media-detail-content';

export const metadata: Metadata = { title: 'Медиа' };

export default async function MediaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MediaDetailContent id={id} />;
}
