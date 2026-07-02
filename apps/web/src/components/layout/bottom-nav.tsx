'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MapPin, Zap, CalendarDays, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

const ITEMS = [
  { href: '/', label: 'Главная', icon: Home, exact: true },
  { href: '/courts', label: 'Корты', icon: MapPin },
  { href: '/pickup-games', label: 'Игры', icon: Zap },
  { href: '/events', label: 'Ивенты', icon: CalendarDays },
];

export function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const profileHref = isAuthenticated ? '/profile' : '/auth/login';

  const items = [
    ...ITEMS,
    { href: profileHref, label: 'Профиль', icon: User },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 lg:hidden liquid-glass-bar"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-5 h-16">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px]"
            >
              <Icon className={cn('w-5 h-5', active ? 'text-primary' : 'text-white/50')} />
              <span className={cn('text-[10px] font-semibold uppercase tracking-wide', active ? 'text-primary' : 'text-white/40')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
