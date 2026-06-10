'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, useLogout, useMe } from '@/hooks/use-auth';

const NAV_LINKS = [
  { href: '/courts', label: 'Корты' },
  { href: '/pickup-games', label: 'Pickup Games' },
  { href: '/players', label: 'Игроки' },
  { href: '/ranking', label: 'Ранг' },
  { href: '/news', label: 'Новости' },
  { href: '/events', label: 'Ивенты' },
  { href: '/media', label: 'Медиа' },
  { href: '/about', label: 'О нас' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { data: user } = useMe();
  const logout = useLogout();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo.png"
            alt="UBC"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
            priority
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-xs font-medium uppercase tracking-wider transition-colors hover:text-primary',
                pathname.startsWith(link.href)
                  ? 'text-primary'
                  : 'text-muted-foreground',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative hidden lg:block">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <span className="max-w-24 truncate">{user?.firstName}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-border bg-card shadow-lg py-1 z-50">
                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Мой профиль
                  </Link>
                  <hr className="my-1 border-border" />
                  <button
                    onClick={() => { logout(); setUserMenuOpen(false); }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-secondary transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Выйти
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Войти
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Регистрация
              </Link>
            </div>
          )}

          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="container-page py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'text-sm font-medium py-2.5 px-2 rounded-lg transition-colors',
                  pathname.startsWith(link.href)
                    ? 'text-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
                )}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-border my-2" />
            {isAuthenticated ? (
              <>
                <Link href="/profile" onClick={() => setOpen(false)} className="text-sm font-medium py-2.5 px-2 rounded-lg hover:bg-secondary/50 transition-colors">
                  Мой профиль
                </Link>
                <button onClick={() => { logout(); setOpen(false); }} className="text-sm font-medium py-2.5 px-2 rounded-lg text-left text-destructive hover:bg-destructive/5 transition-colors">
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setOpen(false)} className="text-sm font-medium py-2.5 px-2 rounded-lg hover:bg-secondary/50 transition-colors">
                  Войти
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setOpen(false)}
                  className="inline-flex justify-center px-4 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg mt-1"
                >
                  Регистрация
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
