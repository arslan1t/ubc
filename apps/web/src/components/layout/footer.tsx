import Link from 'next/link';
import Image from 'next/image';

const LINKS = {
  platform: [
    { href: '/courts', label: 'Корты' },
    { href: '/pickup-games', label: 'Pickup Games' },
    { href: '/pickup-games/create', label: 'Создать игру' },
    { href: '/players', label: 'Игроки' },
    { href: '/ranking', label: 'Рейтинг' },
  ],
  content: [
    { href: '/news', label: 'Новости' },
    { href: '/media', label: 'Медиа' },
    { href: '/events', label: 'Ивенты' },
    { href: '/about', label: 'О нас' },
  ],
  community: [
    { href: '/courts/suggest', label: 'Предложить корт' },
    { href: '/news/suggest', label: 'Предложить новость' },
  ],
};

const SOCIALS = [
  {
    href: 'https://www.youtube.com/@ubculture',
    label: 'YouTube',
    hoverBg: 'hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30',
    svg: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
  },
  {
    href: 'https://t.me/ubculture',
    label: 'Telegram',
    hoverBg: 'hover:bg-sky-500/20 hover:text-sky-400 hover:border-sky-500/30',
    svg: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>,
  },
  {
    href: 'https://www.instagram.com/ubcbasketbal/',
    label: 'Instagram',
    hoverBg: 'hover:bg-pink-500/20 hover:text-pink-400 hover:border-pink-500/30',
    svg: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>,
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/20">
      {/* Top bar — brand statement */}
      <div className="border-b border-border/40">
        <div className="container-page py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="font-display font-black text-2xl tracking-tight mb-1">
              <span className="text-primary">U</span>ZBEK{' '}
              <span className="text-primary">B</span>ASKETBALL{' '}
              <span className="text-primary">C</span>ULTURE
            </div>
            <p className="text-sm text-muted-foreground">Объединяем баскетбольное сообщество Узбекистана</p>
          </div>
          <div className="flex items-center gap-2">
            {SOCIALS.map(({ href, label, hoverBg, svg }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={`w-9 h-9 rounded-xl border border-border/60 bg-secondary/40 flex items-center justify-center text-muted-foreground transition-all duration-200 ${hoverBg}`}
              >
                {svg}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Links grid */}
      <div className="container-page py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand col */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <Image src="/logo.png" alt="UBC" width={36} height={36} className="h-9 w-9 object-contain" />
              <div>
                <div className="font-display font-black text-base leading-none">
                  <span className="text-primary">U</span>BC
                </div>
                <div className="text-[10px] text-muted-foreground">Uzbek Basketball</div>
              </div>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Площадки, игры, сообщество — всё баскетбольное сообщество Узбекистана на одной платформе.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-display font-bold text-xs uppercase tracking-widest mb-4 text-muted-foreground">
              Платформа
            </h4>
            <ul className="space-y-2.5">
              {LINKS.platform.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Content */}
          <div>
            <h4 className="font-display font-bold text-xs uppercase tracking-widest mb-4 text-muted-foreground">
              Контент
            </h4>
            <ul className="space-y-2.5">
              {LINKS.content.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-display font-bold text-xs uppercase tracking-widest mb-4 text-muted-foreground">
              Сообщество
            </h4>
            <ul className="space-y-2.5">
              {LINKS.community.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2">
              <div className="text-xs text-muted-foreground/60">Скоро</div>
              {['Турниры', 'Статистика', 'Достижения'].map((l) => (
                <div key={l} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary/40" />
                  <span className="text-xs text-muted-foreground/40">{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/40">
        <div className="container-page py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} UBC — Uzbek Basketball Culture
          </p>
          <p className="text-xs text-muted-foreground">Ташкент, Узбекистан 🏀</p>
        </div>
      </div>
    </footer>
  );
}
