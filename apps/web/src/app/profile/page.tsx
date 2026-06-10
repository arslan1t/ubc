import type { Metadata } from 'next';
import { ProfileContent } from './profile-content';

export const metadata: Metadata = { title: 'Мой профиль' };

export default function ProfilePage() {
  return <ProfileContent />;
}
