import type { Metadata } from 'next';
import { GiveawaysListContent } from './giveaways-list-content';

export const metadata: Metadata = {
  title: 'Розыгрыши — UBC',
  description: 'Розыгрыши призов от Uzbek Basketball Culture: участвуй и выигрывай.',
};

export default function GiveawaysPage() {
  return <GiveawaysListContent />;
}
