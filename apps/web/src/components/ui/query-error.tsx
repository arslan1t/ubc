'use client';

import { WifiOff, RotateCcw } from 'lucide-react';

interface QueryErrorProps {
  onRetry?: () => void;
  message?: string;
}

/** Shown when a list/page query fails — instead of a misleading empty state. */
export function QueryError({ onRetry, message }: QueryErrorProps) {
  return (
    <div className="text-center py-16">
      <WifiOff className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
      <p className="text-muted-foreground mb-1">
        {message ?? 'Не удалось загрузить данные.'}
      </p>
      <p className="text-xs text-muted-foreground/70 mb-5">
        Сервер может «просыпаться» — обычно это занимает меньше минуты.
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Повторить
        </button>
      )}
    </div>
  );
}
