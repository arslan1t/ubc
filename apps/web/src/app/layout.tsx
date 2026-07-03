import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/layout/providers';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ubc-web-azure.vercel.app'),
  title: {
    default: 'UBC — Uzbek Basketball Culture',
    template: '%s | UBC',
  },
  description:
    'Узбекистанская баскетбольная культура. Находи игры, создавай Open Run, открывай корты.',
  keywords: ['баскетбол', 'узбекистан', 'ташкент', 'open run', 'корты', 'UBC'],
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'UBC',
    title: 'UBC — Uzbek Basketball Culture',
    description:
      'Узбекистанская баскетбольная культура. Находи игры, создавай Open Run, открывай корты.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'UBC — Uzbek Basketball Culture' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UBC — Uzbek Basketball Culture',
    description: 'Баскетбольное сообщество Узбекистана: игры, корты, турниры.',
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${montserrat.variable}`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 min-w-0 pb-20 lg:pb-0">{children}</main>
            <Footer />
          </div>
          <BottomNav />
          <Toaster theme="dark" position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
