import type { ReactNode } from 'react';
import Image from 'next/image';

/**
 * Единая шапка всех списочных страниц: градиентный фон + сетка площадки,
 * маленький надзаголовок, крупный display-заголовок с золотой частью,
 * подпись, опциональная кнопка и опциональное фото 4:3 справа. Используется
 * на кортах, играх, ивентах, розыгрышах, новостях и медиа — чтобы весь сайт
 * выглядел идентично.
 */
export function PageHero({
  eyebrow,
  title,
  goldTitle,
  subtitle,
  action,
  imageSrc,
}: {
  eyebrow: string;
  title?: string;
  goldTitle: string;
  subtitle: string;
  action?: ReactNode;
  imageSrc?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,hsl(43_85%_53%/0.07)_0%,transparent_70%)]" />
      <div className="absolute inset-0 bg-court-grid opacity-40" />
      <div className="container-page relative py-12 md:py-16 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        <div className="flex-1 min-w-0">
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
          {action && <div className="mt-5">{action}</div>}
        </div>

        {imageSrc && (
          <div className="relative w-full lg:w-[380px] xl:w-[440px] aspect-[4/3] shrink-0 rounded-2xl overflow-hidden border border-border/50 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
            <Image
              src={imageSrc}
              alt=""
              fill
              priority
              quality={90}
              sizes="(max-width: 1024px) 100vw, 440px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/40 via-transparent to-transparent" />
          </div>
        )}
      </div>
    </section>
  );
}
