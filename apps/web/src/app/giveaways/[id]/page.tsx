import type { Metadata } from 'next';
import { GiveawayDetailContent } from './giveaway-detail-content';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_URL}/giveaways/${id}`, { next: { revalidate: 120 } });
    if (res.ok) {
      const g = await res.json();
      return {
        title: `${g.title} — розыгрыш UBC`,
        description: `Приз: ${g.prize}. ${g.description ?? 'Участвуй в розыгрыше UBC!'}`,
        openGraph: g.coverUrl ? { images: [g.coverUrl] } : undefined,
      };
    }
  } catch {
    // fall through
  }
  return { title: 'Розыгрыш — UBC' };
}

export default async function GiveawayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GiveawayDetailContent id={id} />;
}
