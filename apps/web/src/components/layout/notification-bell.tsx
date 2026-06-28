'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMyNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/use-notifications';
import { formatRelativeDate, cn } from '@/lib/utils';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data } = useMyNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const items = data?.data ?? [];
  const unread = data?.unreadCount ?? 0;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Уведомления"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-border bg-card shadow-xl shadow-black/40 z-50"
            >
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 sticky top-0 bg-card">
                <span className="text-sm font-semibold">Уведомления</span>
                {unread > 0 && (
                  <button
                    onClick={() => markAllRead.mutate()}
                    className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Прочитать все
                  </button>
                )}
              </div>

              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Пока пусто</p>
              ) : (
                <div>
                  {items.map((n) => {
                    const content = (
                      <div
                        className={cn(
                          'px-4 py-3 border-b border-border/40 hover:bg-secondary/40 transition-colors cursor-pointer',
                          !n.isRead && 'bg-primary/5',
                        )}
                        onClick={() => !n.isRead && markRead.mutate(n.id)}
                      >
                        <div className="flex items-start gap-2">
                          {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium leading-snug">{n.title}</p>
                            {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                            <p className="text-[11px] text-muted-foreground/60 mt-1">{formatRelativeDate(n.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    );
                    return n.link ? (
                      <Link key={n.id} href={n.link} onClick={() => setOpen(false)}>{content}</Link>
                    ) : (
                      <div key={n.id}>{content}</div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
