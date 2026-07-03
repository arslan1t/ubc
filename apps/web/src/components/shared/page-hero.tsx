import type { ReactNode } from 'react';

/**
 * Единая шапка всех списочных страниц: градиентный фон + сетка площадки,
 * маленький надзаголовок, крупный display-заголовок с золотой частью,
 * подпись и опциональная кнопка справа. Используется на кортах, новостях,
 * ивентах, медиа и розыгрышах, чтобы весь сайт выглядел идентично.
 */
export function PageHero({
  eyebrow,
  title,
  goldTitle,
  subtitle,
  action,
}: {
  eyebrow: string;
  title?: string;
  goldTitle: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,hsl(43_85%_53%/0.07)_0%,transparent_70%)]" />
      <div className="absolute inset-0 bg-court-grid opacity-40" />
      <div className="container-page relative py-12 md:py-16 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">{eyebrow}</p>
          <h1 className="font-display font-black text-4xl md:text-5xl leading-none mb-2">
            {title && <>{title} </>}
            <span
              style={{
                background: 'linear-gradient(135deg, hsl(43 85% 65%), hsl(43 85% 45%))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {goldTitle}
            </span>
          </h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </section>
  );
}
