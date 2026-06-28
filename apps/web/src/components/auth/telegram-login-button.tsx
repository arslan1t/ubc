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
  const { mutate: telegramLogin } = useTelegramLogin();

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

  return <div ref={containerRef} className="flex justify-center min-h-[44px]" />;
}
