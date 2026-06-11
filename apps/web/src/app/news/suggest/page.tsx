import type { Metadata } from 'next';
import { SuggestNewsForm } from '@/components/news/suggest-news-form';

export const metadata: Metadata = {
  title: 'Предложить новость — UBC',
  description: 'Есть баскетбольная новость? Поделись с сообществом UBC.',
};

export default function SuggestNewsPage() {
  return (
    <div className="container-page py-8 max-w-2xl">
      <h1 className="font-display font-bold text-3xl mb-2">
        Предложить <span className="text-primary">новость</span>
      </h1>
      <p className="text-muted-foreground mb-8">
        Турнир, результат, история из площадки — расскажи сообществу.
      </p>
      <SuggestNewsForm />
    </div>
  );
}
