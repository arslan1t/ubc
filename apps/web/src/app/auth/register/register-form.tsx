'use client';

import Link from 'next/link';
import { TelegramLoginButton } from '@/components/auth/telegram-login-button';

export function RegisterForm() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl glass-content-card p-6 flex flex-col items-center gap-4 text-center">
        <p className="text-sm text-muted-foreground">
          Аккаунт создаётся автоматически после входа через Telegram — пароли не нужны.
        </p>
        <TelegramLoginButton />
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Уже есть аккаунт?{' '}
        <Link href="/auth/login" className="text-primary hover:underline font-medium">
          Войти
        </Link>
      </p>
    </div>
  );
}
