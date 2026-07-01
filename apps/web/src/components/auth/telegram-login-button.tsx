'use client';

import { useTelegramBotLogin } from '@/hooks/use-auth';

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? 'ubculturebot';

export function TelegramLoginButton() {
  const { start, phase, reset } = useTelegramBotLogin();
  const isWaiting = phase === 'waiting';

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={start}
        disabled={isWaiting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#29A9EA] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#29A9EA]/90 disabled:opacity-70"
      >
        {isWaiting ? (
          <>
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
            Ждём подтверждения в Telegram…
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="currentColor">
              <path d="M22 3.5 2.6 11.1c-1.3.5-1.3 1.3-.2 1.6l4.9 1.5 1.9 5.8c.2.6.4.9.9.9.5 0 .7-.2 1-.5l2.3-2.2 4.8 3.5c.9.5 1.5.2 1.8-.8L23.9 4.9c.4-1.3-.5-1.9-1.9-1.4Zm-13 12-.3 4-1.6-5.1 9.6-6-7.7 7.1Z" />
            </svg>
            Войти через Telegram
          </>
        )}
      </button>

      {isWaiting && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Открой чат с @{BOT_USERNAME} и нажми «Поделиться контактом».
        </p>
      )}

      {phase === 'expired' && (
        <p className="mt-2 text-center text-xs text-destructive">
          Время ожидания истекло.{' '}
          <button type="button" onClick={reset} className="underline">
            Попробовать снова
          </button>
        </p>
      )}

      {phase === 'error' && (
        <p className="mt-2 text-center text-xs text-destructive">
          Не удалось начать вход. Попробуй ещё раз.
        </p>
      )}
    </div>
  );
}
