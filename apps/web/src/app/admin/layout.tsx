'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth, useMe, useLogout } from '@/hooks/use-auth';
import { useModerationStats } from '@/hooks/use-moderation';
import { Newspaper, Home, LogOut, ShieldCheck, Users, Trophy, MapPin, Zap, Film, Star, Bell, BarChart3, ScrollText, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const STAFF_ROLES = ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'];
const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { data: user, isLoading } = useMe();
  const logout = useLogout();
  const isStaff = !!user && STAFF_ROLES.includes(user.role);
  const { data: modStats } = useModerationStats();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center rounded-2xl border border-border bg-card p-8">
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="font-display font-bold text-lg mb-2">Нет доступа к админке</h1>
          <p className="text-sm text-muted-foreground mb-1">
            Ты вошёл как <span className="text-foreground font-medium">{user.firstName} {user.lastName}</span>
            {user.email ? <> ({user.email})</> : null} — у этого аккаунта роль «Игрок».
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Админ-доступ привязан к отдельному аккаунту. Выйди и войди под ним — если это email/пароль,
            на странице входа открой «Уже есть аккаунт с email или Google?».
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={logout}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Выйти и войти под другим аккаунтом
            </button>
            <Link
              href="/"
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-secondary transition-colors"
            >
              На главную
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = ADMIN_ROLES.includes(user.role);
  const pending = modStats?.totalPending ?? 0;

  const nav = [
    { href: '/admin/moderation', label: 'Модерация', icon: ShieldCheck, badge: pending, show: true },
    { href: '/admin/events', label: 'Турниры', icon: Trophy, show: isAdmin },
    { href: '/admin/courts', label: 'Корты', icon: MapPin, show: true },
    { href: '/admin/pickup-games', label: 'Pickup Games', icon: Zap, show: true },
    { href: '/admin/news', label: 'Новости', icon: Newspaper, show: true },
    { href: '/admin/media', label: 'Медиа', icon: Film, show: true },
    { href: '/admin/reviews', label: 'Отзывы', icon: Star, show: true },
    { href: '/admin/notifications', label: 'Уведомления', icon: Bell, show: true },
    { href: '/admin/analytics', label: 'Аналитика', icon: BarChart3, show: true },
    { href: '/admin/logs', label: 'Журнал', icon: ScrollText, show: isAdmin },
    { href: '/admin/users', label: 'Пользователи', icon: Users, show: isAdmin },
  ].filter((n) => n.show);

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 shrink-0 border-r border-border bg-card/50 flex flex-col">
        <div className="p-5 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="UBC" width={32} height={32} className="h-8 w-8 object-contain" />
            <span className="font-display font-bold text-sm">
              <span className="text-primary">UBC</span> Admin
            </span>
          </Link>
          <div className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            {user.role.replace('_', ' ')}
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ href, label, icon: Icon, badge }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname.startsWith(href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="flex-1">{label}</span>
              {badge ? (
                <span className="min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center">
                  {badge}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            <Home className="w-4 h-4" />
            На сайт
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Выйти
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-background">{children}</main>
    </div>
  );
}
