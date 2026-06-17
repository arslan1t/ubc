import type { Metadata } from 'next';
import { OpenRunDetailContent } from '@/app/open-runs/[id]/open-run-detail-content';

export const metadata: Metadata = {
  title: 'Pickup Game',
};

export default async function PickupGameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OpenRunDetailContent id={id} />;
}
