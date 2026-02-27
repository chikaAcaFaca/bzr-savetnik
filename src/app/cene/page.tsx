import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cene - BZR Savetnik',
  description:
    'Transparentne cene BZR Savetnik platforme. Od 990 RSD mesecno za firme prema broju zaposlenih. Agencije besplatno. Placanje IPS QR kodom.',
  alternates: {
    canonical: 'https://bzr-savetnik.com/cene',
  },
};

const tiers = [
  { name: '1 zaposlen', price: '990', annual: '9.900', employees: '1', tier: 'tier_1' },
  { name: 'Do 5 zaposlenih', price: '1.990', annual: '19.900', employees: '2-5', tier: 'tier_5' },
  { name: 'Do 10 zaposlenih', price: '3.990', annual: '39.900', employees: '6-10', tier: 'tier_10' },
  { name: 'Do 20 zaposlenih', price: '6.990', annual: '69.900', employees: '11-20', tier: 'tier_20', popular: true },
  { name: 'Do 50 zaposlenih', price: '9.990', annual: '99.900', employees: '21-50', tier: 'tier_50' },
  { name: '51+ zaposlenih', price: '14.990', annual: '149.900', employees: '51+', tier: 'tier_50plus' },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav (simplified) */}
      <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">BZR</span>
            </div>
            <span className="font-bold text-xl">Savetnik</span>
          </Link>
          <Link
            href="/registracija"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Registracija
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold">Jednostavne i transparentne cene</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Firme placaju prema broju zaposlenih.
            Agencije koriste platformu besplatno.
            Prvih 30 dana besplatno za firme.
          </p>
        </div>

        {/* Agency: FREE */}
        <div className="max-w-md mx-auto mb-12 rounded-lg border-2 border-green-500 bg-green-50 p-6 text-center">
          <h3 className="font-semibold text-sm text-green-700 uppercase tracking-wider">Za BZR agencije</h3>
          <div className="mt-3 text-4xl font-bold text-green-600">
            BESPLATNO
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Kompletna platforma, neogranicen broj klijenata i agenata. Zauvek besplatno.
          </p>
          <Link
            href="/registracija"
            className="inline-flex items-center justify-center rounded-md bg-green-600 px-6 py-2.5 text-sm font-medium text-white shadow hover:bg-green-700 transition-colors mt-4"
          >
            Registrujte agenciju
          </Link>
        </div>

        {/* Per-Company Tiers */}
        <h2 className="text-2xl font-bold text-center mb-8">Cene za firme (prema broju zaposlenih)</h2>
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-lg border p-6 text-center ${
                tier.popular ? 'border-2 border-primary relative' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full whitespace-nowrap">
                  Popularno
                </div>
              )}
              <h3 className="font-semibold text-sm">{tier.name}</h3>
              <p className="text-xs text-muted-foreground">{tier.employees} zaposlenih</p>
              <div className="mt-4 text-2xl font-bold">
                {tier.price}
                <span className="text-sm font-normal text-muted-foreground"> RSD</span>
              </div>
              <p className="text-xs text-muted-foreground">mesecno</p>
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground">Godisnje: {tier.annual} RSD</p>
                <p className="text-xs text-green-600 font-medium">Usteda 2 meseca!</p>
              </div>
            </div>
          ))}
        </div>

        {/* What's Included */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Sta je ukljuceno</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              'Akt o proceni rizika (DOCX)',
              'Svi obrasci 1-11 (novi Pravilnik 2025)',
              'Evidencije po novom zakonu',
              'AI savetnik Botislav za BZR pitanja',
              'Prijava povreda sa ESAW kodiranjem',
              'Podsetnici za zakonske rokove',
              'Kinney ExPxF kalkulacija',
              'Automatsko pracenje propisa',
              'Email obavestenja o promenama i rokovima',
              'Profil firme u bazi od 136.000+ firmi',
              'Marketplace BZR agencija',
              'DOCX export svih dokumenata',
              'Pristup bazi od 43+ pravilnika',
              'Dnevni backup podataka',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="text-green-600">&#10003;</span>
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Payment Info */}
        <div className="mt-16 max-w-xl mx-auto rounded-lg border bg-blue-50 p-6 text-center">
          <h3 className="font-semibold mb-2">Placanje putem IPS QR koda</h3>
          <p className="text-sm text-muted-foreground">
            Skenirajte QR kod bankarskom aplikacijom na telefonu - instant uplata,
            bez provizije, bez kreditne kartice. Direktan bankovni transfer.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/registracija"
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-base font-medium text-primary-foreground shadow-lg hover:bg-primary/90"
          >
            Pocnite besplatno
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            Sve cene su bez PDV-a. Placanje IPS QR kodom (instant bankovni transfer).
          </p>
        </div>
      </div>
    </div>
  );
}
