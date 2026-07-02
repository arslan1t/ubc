import type { Metadata } from 'next';
import { PlayerProfileContent } from './player-profile-content';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_URL}/users/${id}/public`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error();
    const player = await res.json();
    const name = `${player.firstName} ${player.lastName}`.trim();
    return {
      title: `${name} — игрок UBC`,
      description:
        player.bio ??
        `Профиль игрока ${name} на Uzbek Basketball Culture${player.city ? ` · ${player.city}` : ''}`,
      openGraph: player.avatarUrl ? { images: [player.avatarUrl] } : undefined,
    };
  } catch {
    return { title: 'Игрок — UBC' };
  }
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PlayerProfileContent id={id} />;
}
