import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Sora } from 'next/font/google';
import '@/styles/globals.css';
import { AppShell } from '@/components/shell/app-shell';

const body = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const display = Sora({ subsets: ['latin'], variable: '--font-display', weight: ['600', '700', '800'], display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Sawan Music — Feel every drop', template: '%s · Sawan Music' },
  description: 'Sawan Music: a personal music streaming app with curated mixes, original tracks and your own library.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
  appleWebApp: { capable: true, title: 'Sawan Music', statusBarStyle: 'black-translucent' },
};

export const viewport: Viewport = {
  themeColor: '#05060b',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
