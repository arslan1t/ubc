import type { Metadata } from 'next';
import { Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Игроки — UBC',
  description: 'База игроков баскетбольного сообщества Узбекистана',
};

export default function PlayersPage() {
  return (
    <div className="container-page py-24 flex flex-col items-center text-center gap-6">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
        <Users className="w-10 h-10 text-primary" />
      </div>
      <div>
        <h1 className="font-display font-bold text-4xl mb-3">
          <span className="text-primary">Игроки</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-md">
          Каталог игроков баскетбольного сообщества Узбекистана скоро появится здесь.
        </p>
      </div>
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-sm font-medium text-primary">
        Скоро
      </div>
    </div>
  );
}
