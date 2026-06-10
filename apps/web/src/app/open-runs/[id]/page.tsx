import type { Metadata } from 'next';
import { OpenRunDetailContent } from './open-run-detail-content';

export const metadata: Metadata = {
  title: 'Open Run',
};

export default async function OpenRunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OpenRunDetailContent id={id} />;
}
