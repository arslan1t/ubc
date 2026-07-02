'use client';

import { useState } from 'react';
import { Search, ShieldCheck, Ban, RotateCcw, ChevronDown, FileText } from 'lucide-react';
import {
  useAdminUsers,
  useSetUserRole,
  useSetUserActive,
  useUserSubmissions,
} from '@/hooks/use-moderation';
import { useMe } from '@/hooks/use-auth';
import { getInitials, formatDate, formatRelativeDate, cn } from '@/lib/utils';
import { payloadSummary, SUBMISSION_TYPE_LABEL } from '@/lib/submission-summary';
import { toast } from 'sonner';

const SUBMISSION_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Ожидает',
  APPROVED: 'Одобрено',
  REJECTED: 'Отклонено',
  CHANGES_REQUESTED: 'На доработке',
};
const SUBMISSION_STATUS_COLOR: Record<string, string> = {
  PENDING: 'text-amber-400 bg-amber-400/10',
  APPROVED: 'text-emerald-400 bg-emerald-400/10',
  REJECTED: 'text-destructive bg-destructive/10',
  CHANGES_REQUESTED: 'text-sky-400 bg-sky-400/10',
};

function UserSubmissionsPanel({ userId }: { userId: string }) {
  const { data, isLoading } = useUserSubmissions(userId, true);
  const items = data?.data ?? [];

  if (isLoading) {
    return <div className="px-3 pb-3 text-xs text-muted-foreground">Загрузка...</div>;
  }
  if (items.length === 0) {
    return <div className="px-3 pb-3 text-xs text-muted-foreground">Заявок пока нет</div>;
  }

  return (
    <div className="px-3 pb-3 space-y-1.5">
      {items.map((s) => {
        const summary = payloadSummary(s);
        return (
          <div key={s.id} className="flex items-center gap-2 rounded-lg bg-secondary/30 px-2.5 py-1.5 text-xs">
            <span className="text-muted-foreground shrink-0">{SUBMISSION_TYPE_LABEL[s.type]}</span>
            <span className="truncate flex-1">{summary.title}</span>
            <span className={cn('shrink-0 rounded-full px-2 py-0.5 font-medium', SUBMISSION_STATUS_COLOR[s.status])}>
              {SUBMISSION_STATUS_LABEL[s.status]}
            </span>
            <span className="text-muted-foreground shrink-0">{formatRelativeDate(s.createdAt)}</span>
          </div>
        );
      })}
    </div>
  );
}

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
  const [expandedId, setExpandedId] = useState<string | null>(null);
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
            const expanded = expandedId === u.id;
            return (
              <div key={u.id} className={cn(
                'rounded-xl border bg-card',
                u.isActive ? 'border-border' : 'border-destructive/40',
              )}>
                <div className="flex items-center gap-3 p-3">
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
                    <button
                      onClick={() => setExpandedId(expanded ? null : u.id)}
                      className="flex items-center gap-1 text-[11px] text-muted-foreground/70 hover:text-foreground transition-colors mt-0.5"
                    >
                      <FileText className="w-3 h-3" />
                      {u._count.organizedRuns} игр · {u._count.reviews} отзывов · {u._count.submissions} заявок
                      <ChevronDown className={cn('w-3 h-3 transition-transform', expanded && 'rotate-180')} />
                    </button>
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

                {expanded && <UserSubmissionsPanel userId={u.id} />}
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
