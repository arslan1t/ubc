import type { Metadata } from 'next';
import { SuggestCourtForm } from '@/components/courts/suggest-court-form';

export const metadata: Metadata = {
  title: 'Предложить корт — UBC',
  description: 'Знаешь корт, которого нет на карте? Добавь его в базу UBC.',
};

export default function SuggestCourtPage() {
  return (
    <div className="container-page py-8 max-w-2xl">
      <h1 className="font-display font-bold text-3xl mb-2">
        Предложить <span className="text-primary">корт</span>
      </h1>
      <p className="text-muted-foreground mb-8">
        Знаешь площадку, которой нет на карте? Помоги сообществу — добавь её.
      </p>
      <SuggestCourtForm />
    </div>
  );
}
