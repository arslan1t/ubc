import Link from 'next/link';
import { MapPin, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 md:py-36 px-4 text-center">
      <p className="font-display font-black text-7xl md:text-9xl leading-none gradient-gold mb-4">
        404
      </p>
      <h1 className="font-display font-bold text-xl md:text-2xl mb-2">Мяч ушёл в аут</h1>
      <p className="text-sm text-muted-foreground max-w-sm mb-8">
        Такой страницы нет — возможно, её перенесли или ссылка устарела.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-[#0a0a0a] transition-shadow shadow-[0_0_28px_hsl(43_75%_47%/0.35)] hover:shadow-[0_0_50px_hsl(43_75%_47%/0.55)]"
        >
          <Home className="w-4 h-4" />
          На главную
        </Link>
        <Link
          href="/courts"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
        >
          <MapPin className="w-4 h-4" />
          Найти корт
        </Link>
      </div>
    </div>
  );
}
