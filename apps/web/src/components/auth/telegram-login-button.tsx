'use client';

import { ExternalLink } from 'lucide-react';
import { useTelegramBotLogin } from '@/hooks/use-auth';

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M22 3.5 2.6 11.1c-1.3.5-1.3 1.3-.2 1.6l4.9 1.5 1.9 5.8c.2.6.4.9.9.9.5 0 .7-.2 1-.5l2.3-2.2 4.8 3.5c.9.5 1.5.2 1.8-.8L23.9 4.9c.4-1.3-.5-1.9-1.9-1.4Zm-13 12-.3 4-1.6-5.1 9.6-6-7.7 7.1Z" />
    </svg>
  );
}

export function TelegramLoginButton() {
  const { start, phase, deepLink, isStarting, reset } = useTelegramBotLogin();

  if (phase === 'waiting' && deepLink) {
    return (
      <div className="w-full rounded-xl border border-[#29A9EA]/30 bg-[#29A9EA]/5 p-4 text-left">
        <div className="flex items-center gap-2 mb-3">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#29A9EA]/60 border-t-transparent shrink-0" />
          <p className="text-sm font-semibold">Ждём подтверждения в Telegram…</p>
        </div>

        <ol className="space-y-1.5 text-xs text-muted-foreground list-decimal list-inside mb-4">
          <li>Открой чат с ботом (кнопка ниже)</li>
          <li>Нажми в боте «📱 Поделиться контактом»</li>
          <li>Напиши в ответ своё имя и фамилию</li>
          <li>Вернись сюда — вход выполнится сам</li>
        </ol>

        <a
          href={deepLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#29A9EA] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#29A9EA]/90"
        >
          <TelegramIcon className="w-4 h-4 shrink-0" />
          Открыть Telegram
          <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
        </a>

        <button
          type="button"
          onClick={reset}
          className="mt-2 w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Отменить
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={start}
        disabled={isStarting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#29A9EA] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#29A9EA]/90 disabled:opacity-70"
      >
        {isStarting ? (
          <>
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
            Подключаемся… сервер может «просыпаться» до минуты
          </>
        ) : (
          <>
            <TelegramIcon className="w-4 h-4 shrink-0" />
            Войти через Telegram
          </>
        )}
      </button>

      {phase === 'expired' && (
        <p className="mt-2 text-center text-xs text-destructive">
          Время ожидания истекло (5 минут). Нажми «Войти через Telegram» ещё раз.
        </p>
      )}

      {phase === 'error' && (
        <p className="mt-2 text-center text-xs text-destructive">
          Не удалось связаться с сервером. Подожди немного и попробуй ещё раз.
        </p>
      )}
    </div>
  );
}
