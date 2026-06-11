'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flag, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { useCreateSubmission } from '@/hooks/use-submissions';
import { cn } from '@/lib/utils';

const REASONS = [
  'Корт закрыт / не существует',
  'Неверный адрес или точка на карте',
  'Неверная информация (покрытие, кольца и т.д.)',
  'Дубликат',
  'Другое',
];

interface Props {
  targetType: string;
  targetId: string;
  targetName?: string;
  className?: string;
}

export function ReportButton({ targetType, targetId, targetName, className }: Props) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { mutate, isPending } = useCreateSubmission();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [message, setMessage] = useState('');

  const onTrigger = () => {
    if (!isAuthenticated) {
      toast.info('Войдите, чтобы сообщить об ошибке');
      router.push('/auth/login');
      return;
    }
    setOpen(true);
  };

  const submit = () => {
    mutate(
      {
        type: 'REPORT',
        targetType,
        targetId,
        payload: { reason, message, targetName },
      },
      {
        onSuccess: () => {
          toast.success('Спасибо! Сообщение отправлено модераторам.');
          setOpen(false);
          setMessage('');
        },
        onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Ошибка'),
      },
    );
  };

  return (
    <>
      <button
        onClick={onTrigger}
        className={cn(
          'inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors',
          className,
        )}
      >
        <Flag className="w-3.5 h-3.5" />
        Сообщить об ошибке
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg">Сообщить об ошибке</h3>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {targetName && (
              <p className="text-sm text-muted-foreground mb-4">Объект: {targetName}</p>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Причина</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1 w-full h-10 rounded-lg border border-input bg-input px-3 text-sm"
                >
                  {REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Подробности</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Что именно не так?"
                  className="mt-1 w-full rounded-lg border border-input bg-input px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={submit}
                disabled={isPending}
                className="flex-1 rounded-lg bg-primary text-primary-foreground py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {isPending ? 'Отправка...' : 'Отправить'}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary/50 transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
