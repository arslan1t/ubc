import type { Metadata } from 'next';
import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Вход' };

export default function LoginPage() {
  return (
    <div className="container-page py-16 flex justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl mb-2">
            Добро пожаловать
          </h1>
          <p className="text-muted-foreground text-sm">
            Войди в аккаунт UBC
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
