import type { Metadata } from 'next';
import { Noto_Sans } from 'next/font/google';
import { AuthProvider } from '@/providers/AuthProvider';
import { TRPCProvider } from '@/providers/TRPCProvider';
import { BackendKeepalive } from '@/components/backend-keepalive';
import './globals.css';

const notoSans = Noto_Sans({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-noto-sans',
});

export const metadata: Metadata = {
  title: {
    default: 'BZR Savetnik - AI platforma za bezbednost i zdravlje na radu',
    template: '%s | BZR Savetnik',
  },
  description:
    'Automatizujte procenu rizika na radnom mestu, generisanje akta o proceni rizika i svih obrazaca za BZR. AI savetnik za agencije i poslodavce u Srbiji.',
  keywords: [
    'bezbednost i zdravlje na radu',
    'procena rizika',
    'akt o proceni rizika',
    'BZR softver',
    'obrazac 6',
    'savetnik za BZR',
    'bezbednost na radu Srbija',
    'procena rizika na radnom mestu',
  ],
  authors: [{ name: 'BZR Savetnik' }],
  creator: 'BZR Savetnik',
  metadataBase: new URL('https://bzr-savetnik.com'),
  openGraph: {
    type: 'website',
    locale: 'sr_RS',
    url: 'https://bzr-savetnik.com',
    siteName: 'BZR Savetnik',
    title: 'BZR Savetnik - AI platforma za bezbednost i zdravlje na radu',
    description:
      'Automatizujte procenu rizika i generisanje BZR dokumentacije. Za agencije i poslodavce.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BZR Savetnik - AI platforma za BZR',
    description: 'Automatizujte procenu rizika i generisanje dokumentacije.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sr" className={notoSans.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className={`${notoSans.className} antialiased`}>
        <AuthProvider>
          <TRPCProvider>
            <BackendKeepalive />
            {children}
          </TRPCProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
