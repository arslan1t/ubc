'use client';

import { useEffect, useRef } from 'react';
import { useTelegramLogin, type TelegramAuthPayload } from '@/hooks/use-auth';

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramAuthPayload) => void;
  }
}

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? 'ubculturebot';

export function TelegramLoginButton() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { mutate: telegramLogin, isPending } = useTelegramLogin();

  useEffect(() => {
    window.onTelegramAuth = (user: TelegramAuthPayload) => telegramLogin(user);

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', BOT_USERNAME);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '12');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');

    containerRef.current?.appendChild(script);

    return () => {
      delete window.onTelegramAuth;
    };
  }, [telegramLogin]);

  return (
    <div className="relative flex justify-center min-h-[44px] w-full">
      <div ref={containerRef} className="flex justify-center" />
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-background/80 backdrop-blur-sm text-sm text-muted-foreground">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Входим… сервер может «просыпаться», это иногда занимает до минуты
        </div>
      )}
    </div>
  );
}
