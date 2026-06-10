import type { Metadata } from 'next';
import { RegisterForm } from './register-form';

export const metadata: Metadata = { title: 'Регистрация' };

export default function RegisterPage() {
  return (
    <div className="container-page py-16 flex justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl mb-2">
            Создать аккаунт
          </h1>
          <p className="text-muted-foreground text-sm">
            Присоединись к UBC сообществу
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
