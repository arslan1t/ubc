'use client';

import { useState } from 'react';
import { useAuditLogs } from '@/hooks/use-audit-logs';
import { formatDate, cn } from '@/lib/utils';

const METHOD_COLOR: Record<string, string> = {
  POST: 'bg-emerald-500/15 text-emerald-400',
  PATCH: 'bg-sky-500/15 text-sky-400',
  PUT: 'bg-sky-500/15 text-sky-400',
  DELETE: 'bg-destructive/15 text-destructive',
};

const METHOD_TABS = ['', 'POST', 'PATCH', 'DELETE'];

export default function AdminLogsPage() {
  const [page, setPage] = useState(1);
  const [method, setMethod] = useState('');
  const { data, isLoading } = useAuditLogs(method ? { page, method } : { page });

  const logs = data?.data ?? [];

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl md:text-3xl">Журнал действий</h1>
        <p className="text-muted-foreground text-sm mt-1">Все изменения, внесённые администраторами и модераторами</p>
      </div>

      <div className="flex gap-2 mb-5">
        {METHOD_TABS.map((m) => (
          <button key={m || 'all'} onClick={() => { setMethod(m); setPage(1); }}
            className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              method === m ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:text-foreground')}>
            {m || 'Все'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 rounded-lg bg-secondary/40 animate-pulse" />)}
        </div>
      ) : logs.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-12">Записей пока нет</p>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="text-left px-3 py-2">Кто</th>
                <th className="text-left px-3 py-2">Действие</th>
                <th className="text-left px-3 py-2">Путь</th>
                <th className="text-left px-3 py-2">Статус</th>
                <th className="text-left px-3 py-2">Время</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-secondary/20">
                  <td className="px-3 py-2 whitespace-nowrap">
                    {log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : '—'}
                  </td>
                  <td className="px-3 py-2">
                    <span className={cn('text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5', METHOD_COLOR[log.method] ?? 'bg-secondary')}>
                      {log.method}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground truncate max-w-xs">{log.path}</td>
                  <td className="px-3 py-2">
                    <span className={log.statusCode >= 400 ? 'text-destructive' : 'text-emerald-400'}>{log.statusCode}</span>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{formatDate(log.createdAt, 'd MMM, HH:mm')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 rounded-lg bg-secondary/50 text-sm disabled:opacity-40">Назад</button>
          <span className="text-sm text-muted-foreground">{page} / {data.totalPages}</span>
          <button disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-lg bg-secondary/50 text-sm disabled:opacity-40">Далее</button>
        </div>
      )}
    </div>
  );
}
