'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, Search, ChevronDown, Zap, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth, useLogout, useMe } from '@/hooks/use-auth';
import { getInitials } from '@/lib/utils';
import { NotificationBell } from './notification-bell';

const NAV_LINKS = [
  { href: '/courts', label: 'Корты', hot: false },
  { href: '/pickup-games', label: 'Игры', hot: true },
  { href: '/events', label: 'Ивенты', hot: false },
  { href: '/giveaways', label: 'Розыгрыши', hot: true },
  { href: '/news', label: 'Новости', hot: false },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { data: user } = useMe();
  const logout = useLogout();

  const isAdmin = user && ['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(user.role);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className="fixed top-0 inset-x-0 z-50 transition-all duration-500"
        style={scrolled ? {
          background: 'rgba(10, 10, 10, 0.88)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          borderBottom: '1px solid rgba(212,161,30,0.22)',
          boxShadow: '0 1px 0 rgba(0,0,0,0.5)',
        } : {
          background: 'rgba(10, 10, 10, 0.30)',
          backdropFilter: 'blur(24px) saturate(150%)',
          WebkitBackdropFilter: 'blur(24px) saturate(150%)',
          borderBottom: '1px solid rgba(212,161,30,0.10)',
        }}
      >
        <div className="container-page flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="relative w-9 h-9">
              <Image
                src="/logo.png"
                alt="UBC"
                width={38}
                height={38}
                className="h-9 w-9 object-contain transition-transform duration-300 group-hover:scale-110"
                priority
              />
            </div>
            <div className="hidden sm:block leading-none">
              <div className="font-display font-black text-base tracking-tight text-white leading-none">
                UBC
              </div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-white/50 leading-none mt-0.5">
                Uzbek Basketball Culture
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors rounded-md',
                    active ? 'text-primary' : 'text-white/60 hover:text-white',
                  )}
                >
                  {link.hot && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                  {link.label}
                  {active && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-3.5 right-3.5 h-px bg-primary"
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1.5">
            <button className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors">
              <Search className="w-4 h-4" />
            </button>

            {isAuthenticated && <NotificationBell />}

            {isAdmin && (
              <Link
                href="/admin"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors rounded-md hover:bg-amber-400/10"
              >
                <Shield className="w-3.5 h-3.5" />
                Админ
              </Link>
            )}

            <div className="hidden lg:block w-px h-5 bg-white/15 mx-1" />

            {isAuthenticated ? (
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold ring-1 ring-primary/30">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <span className="max-w-20 truncate text-white/70">
                    {user?.firstName}
                  </span>
                  <ChevronDown className={cn('w-3.5 h-3.5 text-white/40 transition-transform duration-200', userMenuOpen && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-border bg-card shadow-xl shadow-black/40 py-1 z-50"
                      >
                        <div className="px-4 py-2.5 border-b border-border/60">
                          <div className="font-display font-semibold text-sm">{user?.firstName} {user?.lastName}</div>
                          <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                        </div>
                        <Link
                          href="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-secondary transition-colors"
                        >
                          <User className="w-4 h-4 text-muted-foreground" />
                          Профиль
                        </Link>
                        <Link
                          href="/pickup-games/create"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-secondary transition-colors"
                        >
                          <Zap className="w-4 h-4 text-primary" />
                          Создать игру
                        </Link>
                        <div className="my-1 border-t border-border/60" />
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Выйти
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-1.5 text-sm font-semibold text-white/70 hover:text-white transition-colors"
                >
                  Войти
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-1.5 text-sm font-bold bg-primary text-[#0a0a0a] rounded-lg hover:bg-primary/90 transition-all hover:shadow-[0_0_20px_hsl(43_75%_47%/0.4)]"
                >
                  Регистрация
                </Link>
              </div>
            )}

            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
              aria-label="Menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {open ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="w-5 h-5 text-white" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="w-5 h-5 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-72 bg-card shadow-2xl lg:hidden flex flex-col"
              style={{ borderLeft: '1px solid rgba(212,161,30,0.15)' }}
            >
              <div className="flex items-center justify-between p-4 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                  <Image src="/logo.png" alt="UBC" width={32} height={32} className="h-8 w-8 object-contain" />
                  <div>
                    <div className="font-display font-black text-base leading-none">UBC</div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Uzbek Basketball</div>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="p-2 rounded-xl hover:bg-secondary transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {[...NAV_LINKS, { href: '/media', label: 'Media', hot: false }].map((link, i) => {
                  const active = pathname === link.href || pathname.startsWith(link.href + '/');
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link
                        href={link.href}
                        className={cn(
                          'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold uppercase tracking-wider transition-colors',
                          active
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60',
                        )}
                      >
                        {link.label}
                        {link.hot && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold uppercase tracking-wider text-amber-400 hover:bg-amber-400/10 transition-colors mt-2"
                  >
                    <Shield className="w-4 h-4" />
                    Админ-панель
                  </Link>
                )}
              </nav>

              <div className="p-4 border-t border-border/60">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-secondary transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                        {user && getInitials(user.firstName, user.lastName)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{user?.firstName} {user?.lastName}</div>
                        <div className="text-xs text-muted-foreground">Профиль</div>
                      </div>
                    </Link>
                    <button
                      onClick={() => { logout(); setOpen(false); }}
                      className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Выйти
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/auth/login"
                      className="block w-full text-center rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-secondary transition-colors"
                    >
                      Войти
                    </Link>
                    <Link
                      href="/auth/register"
                      className="block w-full text-center rounded-xl px-4 py-2.5 text-sm font-bold bg-primary text-[#0a0a0a] hover:bg-primary/90 transition-colors"
                    >
                      Регистрация
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="h-16" />
    </>
  );
}
