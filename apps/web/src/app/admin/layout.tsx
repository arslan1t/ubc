'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth, useMe } from '@/hooks/use-auth';
import { Newspaper, Home, LogOut } from 'lucide-react';
import { useLogout } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/admin/news', label: 'Новости', icon: Newspaper },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { data: user, isLoading } = useMe();
  const logout = useLogout();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user && user.role !== 'ADMIN' && user.role !== 'MODERATOR'))) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') return null;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border bg-card/50 flex flex-col">
        <div className="p-5 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="UBC" width={32} height={32} className="h-8 w-8 object-contain" />
            <span className="font-display font-bold text-sm">
              <span className="text-primary">UBC</span> Admin
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
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
              {label}
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

      {/* Main */}
      <main className="flex-1 overflow-auto bg-background">
        {children}
      </main>
    </div>
  );
}
