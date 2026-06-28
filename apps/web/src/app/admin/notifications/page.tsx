'use client';

import { useState } from 'react';
import { Send, Megaphone } from 'lucide-react';
import { useBroadcastNotification, useAdminNotifications } from '@/hooks/use-notifications';
import { formatRelativeDate } from '@/lib/utils';

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [link, setLink] = useState('');
  const broadcast = useBroadcastNotification();
  const { data, isLoading } = useAdminNotifications();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    broadcast.mutate(
      { title, body: body || undefined, link: link || undefined },
      { onSuccess: () => { setTitle(''); setBody(''); setLink(''); } },
    );
  };

  const items = data?.data ?? [];

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl md:text-3xl">Уведомления</h1>
        <p className="text-muted-foreground text-sm mt-1">Отправляй объявления всем пользователям платформы</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-4 space-y-3 mb-8">
        <div className="flex items-center gap-2 text-sm font-semibold mb-1">
          <Megaphone className="w-4 h-4 text-primary" /> Новое объявление
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Заголовок *</label>
          <input required value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Текст</label>
          <textarea rows={2} value={body} onChange={(e) => setBody(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Ссылка (необязательно)</label>
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="/events/1v1-july-4"
            className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50" />
        </div>
        <button type="submit" disabled={broadcast.isPending}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">
          <Send className="w-4 h-4" /> {broadcast.isPending ? 'Отправляем...' : 'Отправить всем'}
        </button>
      </form>

      <h2 className="text-sm font-semibold text-muted-foreground mb-3">История</h2>
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 rounded-xl bg-secondary/40 animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Пока ничего не отправлено</p>
      ) : (
        <div className="space-y-2">
          {items.map((n: any) => (
            <div key={n.id} className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{n.title}</span>
                <span className="text-xs text-muted-foreground">{formatRelativeDate(n.createdAt)}</span>
              </div>
              {n.body && <p className="text-xs text-muted-foreground mt-1">{n.body}</p>}
              <p className="text-[11px] text-muted-foreground/60 mt-1">→ {n.user.firstName} {n.user.lastName}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
