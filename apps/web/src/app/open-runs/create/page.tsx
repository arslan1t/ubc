import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CreateOpenRunForm } from './create-form';

export const metadata: Metadata = {
  title: 'Создать Open Run',
  description: 'Организуй баскетбольную игру',
};

export default function CreateOpenRunPage() {
  return (
    <div className="container-page py-8 max-w-2xl">
      <h1 className="font-display font-bold text-3xl mb-2">
        Создать <span className="text-primary">Open Run</span>
      </h1>
      <p className="text-muted-foreground mb-8">
        Организуй баскетбольную игру и собери команду
      </p>
      <Suspense>
        <CreateOpenRunForm />
      </Suspense>
    </div>
  );
}
