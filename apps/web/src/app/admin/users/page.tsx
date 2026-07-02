'use client';

import { useState } from 'react';
import { Search, ShieldCheck, Ban, RotateCcw } from 'lucide-react';
import { useAdminUsers, useSetUserRole, useSetUserActive } from '@/hooks/use-moderation';
import { useMe } from '@/hooks/use-auth';
import { getInitials, formatDate, cn } from '@/lib/utils';
import { toast } from 'sonner';

const ROLES = ['USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'] as const;
const ROLE_RANK: Record<string, number> = { USER: 1, MODERATOR: 2, ADMIN: 3, SUPER_ADMIN: 4 };
const ROLE_LABEL: Record<string, string> = {
  USER: 'Игрок',
  MODERATOR: 'Модератор',
  ADMIN: 'Админ',
  SUPER_ADMIN: 'Супер админ',
};
const ROLE_COLOR: Record<string, string> = {
  USER: 'text-muted-foreground bg-secondary',
  MODERATOR: 'text-sky-400 bg-sky-400/10',
  ADMIN: 'text-primary bg-primary/10',
  SUPER_ADMIN: 'text-amber-400 bg-amber-400/10',
};

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const { data: me } = useMe();
  const { data, isLoading } = useAdminUsers(search ? { search } : {});
  const setRole = useSetUserRole();
  const setActive = useSetUserActive();
  const users = data?.data ?? [];
  const myRank = ROLE_RANK[me?.role ?? 'USER'] ?? 0;

  const changeRole = (id: string, role: string) => {
    setRole.mutate(
      { id, role },
      { onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Не удалось изменить роль') },
    );
  };

  const toggleActive = (id: string, isActive: boolean, name: string) => {
    const action = isActive ? 'заблокировать' : 'разблокировать';
    if (!window.confirm(`Точно ${action} пользователя "${name}"?`)) return;
    setActive.mutate(
      { id, isActive: !isActive },
      { onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Не удалось изменить статус') },
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl md:text-3xl">Пользователи</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Управление ролями и доступом участников сообщества
        </p>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по имени, email или телефону..."
          className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-secondary/40 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => {
            const isSelf = u.id === me?.id;
            // You can only manage users strictly below your rank.
            const canManage = !isSelf && ROLE_RANK[u.role] < myRank;
            return (
              <div key={u.id} className={cn(
                'flex items-center gap-3 rounded-xl border bg-card p-3',
                u.isActive ? 'border-border' : 'border-destructive/40',
              )}>
                <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                  {getInitials(u.firstName, u.lastName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate flex items-center gap-2">
                    {u.firstName} {u.lastName}
                    {isSelf && <span className="text-[10px] text-muted-foreground">(вы)</span>}
                    {!u.isActive && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-destructive">заблокирован</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {u.email ?? u.phone ?? '—'} · {u.reputation} rep · с {formatDate(u.createdAt, 'MMM yyyy')}
                  </div>
                  <div className="text-[11px] text-muted-foreground/70 truncate mt-0.5">
                    {u._count.organizedRuns} игр · {u._count.reviews} отзывов · {u._count.submissions} заявок
                  </div>
                </div>

                {canManage ? (
                  <select
                    value={u.role}
                    disabled={setRole.isPending}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    className="text-xs rounded-lg bg-secondary border border-border px-2 py-1.5 focus:outline-none focus:border-primary/50"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r} disabled={ROLE_RANK[r] >= myRank}>
                        {ROLE_LABEL[r]}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', ROLE_COLOR[u.role])}>
                    {u.role === 'SUPER_ADMIN' && <ShieldCheck className="w-3 h-3" />}
                    {ROLE_LABEL[u.role]}
                  </span>
                )}

                {canManage && (
                  <button
                    onClick={() => toggleActive(u.id, u.isActive, `${u.firstName} ${u.lastName}`)}
                    disabled={setActive.isPending}
                    title={u.isActive ? 'Заблокировать' : 'Разблокировать'}
                    className="p-2 rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 shrink-0"
                  >
                    {u.isActive ? (
                      <Ban className="w-4 h-4 text-destructive" />
                    ) : (
                      <RotateCcw className="w-4 h-4 text-emerald-400" />
                    )}
                  </button>
                )}
              </div>
            );
          })}
          {users.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">Никого не найдено</p>
          )}
        </div>
      )}
    </div>
  );
}
