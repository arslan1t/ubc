import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'О нас — UBC',
  description: 'Uzbek Basketball Culture — объединяем баскетбольное сообщество Узбекистана',
};

const SOCIAL = [
  {
    name: 'YouTube',
    handle: '@ubculture',
    href: 'https://www.youtube.com/@ubculture',
    colorClass: 'text-red-400 border-red-500/20 bg-red-500/5 hover:border-red-500/40',
  },
  {
    name: 'Telegram',
    handle: '@ubculture',
    href: 'https://t.me/ubculture',
    colorClass: 'text-sky-400 border-sky-500/20 bg-sky-500/5 hover:border-sky-500/40',
  },
  {
    name: 'Instagram',
    handle: '@ubcbasketbal',
    href: 'https://www.instagram.com/ubcbasketbal/',
    colorClass: 'text-pink-400 border-pink-500/20 bg-pink-500/5 hover:border-pink-500/40',
  },
];

export default function AboutPage() {
  return (
    <div className="container-page py-16 max-w-3xl">
      {/* Лого + заголовок */}
      <div className="flex flex-col items-center text-center gap-6 mb-16">
        <Image
          src="/logo.png"
          alt="UBC"
          width={100}
          height={100}
          className="h-24 w-24 object-contain"
        />
        <div>
          <h1 className="font-display font-black text-4xl md:text-5xl mb-3">
            <span className="text-primary">Uzbek Basketball</span> Culture
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            Первая цифровая экосистема для баскетбольного сообщества Узбекистана.
          </p>
        </div>
      </div>

      {/* Миссия */}
      <section className="mb-12">
        <h2 className="font-display font-bold text-2xl mb-4 text-primary">Миссия</h2>
        <p className="text-muted-foreground leading-relaxed text-base">
          UBC — это платформа, которая объединяет игроков, организаторов, корты и
          медиа в едином пространстве. Мы создаём инфраструктуру для развития
          стритбола и баскетбольной культуры в Узбекистане: от Pickup Games во дворах
          до профессиональных ивентов.
        </p>
      </section>

      {/* Что предлагаем */}
      <section className="mb-12">
        <h2 className="font-display font-bold text-2xl mb-6 text-primary">Что мы предлагаем</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: 'Корты', desc: 'Карта и каталог баскетбольных площадок с отзывами и рейтингами.' },
            { title: 'Pickup Games', desc: 'Создавай и находи игры рядом с тобой. Собирай команду за минуты.' },
            { title: 'Новости', desc: 'Последние события узбекского баскетбола в одном месте.' },
            { title: 'Медиа', desc: 'Лучшие моменты, интервью и видео-контент сообщества.' },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-border bg-card p-5">
              <div className="font-display font-bold text-base mb-1">{item.title}</div>
              <p className="text-muted-foreground text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Соцсети */}
      <section>
        <h2 className="font-display font-bold text-2xl mb-6 text-primary">Наши каналы</h2>
        <div className="flex flex-col gap-3">
          {SOCIAL.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between rounded-xl border p-4 transition-colors ${s.colorClass}`}
            >
              <div>
                <div className="font-display font-bold text-sm">{s.name}</div>
                <div className="text-xs opacity-70 mt-0.5">{s.handle}</div>
              </div>
              <ArrowUpRight className="w-4 h-4 opacity-60" />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
