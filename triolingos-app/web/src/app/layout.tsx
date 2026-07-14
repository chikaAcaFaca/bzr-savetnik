import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Triolingos — Nauči srpski',
  description: 'Srpski jezik za strane radnike. Brojevi, slova, situacije sa posla, AI tutor.',
  manifest: '/manifest.json',
};
export const viewport: Viewport = {
  themeColor: '#C2410C',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr">
      <body>{children}</body>
    </html>
  );
}
