import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BZR Savetnik - Sve za bezbednost i zdravlje na radu na jednom mestu',
  description:
    'Marketplace za bezbednost i zdravlje na radu. Firme nalaze BZR agencije, generisu dokumentaciju i upravljaju uskladjenoscu sa zakonom. Od 990 RSD mesecno.',
  alternates: {
    canonical: 'https://bzr-savetnik.com',
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">BZR</span>
              </div>
              <span className="font-bold text-xl">Savetnik</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/funkcionalnosti" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Funkcionalnosti
              </Link>
              <Link href="/cene" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cene
              </Link>
              <Link href="/propisi" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Propisi
              </Link>
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </Link>
              <Link href="/kontakt" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Kontakt
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/prijava"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Prijava
              </Link>
              <Link
                href="/registracija"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
              >
                Registracija
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm mb-6">
              Novi zakon od 1.1.2026. - SVE firme moraju imati BZR
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Sve za bezbednost i zdravlje na radu{' '}
              <span className="text-primary">na jednom mestu</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Firme generisu BZR dokumentaciju, pronalaze agencije i upravljaju uskladjenoscu.
              Agencije koriste platformu besplatno i dobijaju nove klijente.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/registracija"
                className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-base font-medium text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors w-full sm:w-auto"
              >
                Registruj firmu - besplatno 30 dana
              </Link>
              <Link
                href="/registracija"
                className="inline-flex items-center justify-center rounded-md border-2 border-primary px-8 py-3 text-base font-medium text-primary hover:bg-primary/5 transition-colors w-full sm:w-auto"
              >
                Registruj agenciju - besplatno
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Bez kreditne kartice. Placanje IPS QR kodom - instant sa telefona.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">750.000</div>
              <div className="text-sm text-muted-foreground mt-1">Firmi u Srbiji</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">400+</div>
              <div className="text-sm text-muted-foreground mt-1">BZR agencija</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">990 RSD</div>
              <div className="text-sm text-muted-foreground mt-1">Od mesecno</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground mt-1">Uskladenost sa zakonom</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Kako funkcionise</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              4 jednostavna koraka do kompletne BZR dokumentacije
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Registrujte firmu',
                description: 'Unesite osnovne podatke o firmi i broju zaposlenih. 30 dana besplatno.',
              },
              {
                step: '2',
                title: 'Generisajte dokumenta',
                description: 'AI automatski kreira akt o proceni rizika, obrasce i pravilnike.',
              },
              {
                step: '3',
                title: 'Pronadjite agenciju',
                description: 'Na marketplace-u izaberite licenciranu BZR agenciju za pregled i potpis.',
              },
              {
                step: '4',
                title: 'Budite uskladjeni',
                description: 'Agencija pregleda i potpisuje dokumenta. Vi ste potpuno uskladjeni sa zakonom.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30" id="funkcionalnosti">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Sve sto vam treba za BZR</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Jedna platforma za kompletno upravljanje bezbednoscu i zdravljem na radu
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Akt o proceni rizika',
                description: 'AI automatski generise kompletni akt na osnovu podataka o radnom mestu, opasnostima i merama zastite.',
              },
              {
                title: 'Svi obrasci (1-6)',
                description: 'Obrazac za osposobljavanje, evidencije o povredama, lekarski pregledi - sve u DOCX formatu.',
              },
              {
                title: 'AI savetnik',
                description: 'Pitajte bilo sta o BZR propisima. AI agent poznaje sve zakone, pravilnike i uredbe.',
              },
              {
                title: 'Marketplace agencija',
                description: 'Pronadjite licenciranu BZR agenciju u vasem gradu. Ocene i recenzije od drugih firmi.',
              },
              {
                title: 'Automatske novosti',
                description: 'Dnevno pratimo Ministarstvo rada i obavestavamo vas o svim promenama propisa.',
              },
              {
                title: 'Kinney metoda',
                description: 'ExPxF kalkulacija rizika sa automatskom validacijom i predlozima korektivnih mera.',
              },
            ].map((feature, i) => (
              <div key={i} className="rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Agencies Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center rounded-full bg-green-100 text-green-800 px-3 py-1 text-sm font-medium mb-4">
                BESPLATNO za agencije
              </div>
              <h2 className="text-3xl font-bold">Za BZR agencije</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Koristite platformu besplatno, dobijate nove klijente preko marketplace-a,
                i upravljate svom dokumentacijom na jednom mestu.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Besplatan pristup platformi - zauvek',
                  'Novi klijenti preko marketplace-a',
                  'AI generisanje dokumentacije',
                  'Neogranicen broj agenata',
                  'Upravljanje svim klijentima',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-green-600 font-bold">&#10003;</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/registracija"
                className="inline-flex items-center justify-center rounded-md bg-green-600 px-6 py-2.5 text-sm font-medium text-white shadow hover:bg-green-700 transition-colors mt-6"
              >
                Registrujte agenciju besplatno
              </Link>
            </div>
            <div className="rounded-lg border bg-card p-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-green-600">0 RSD</div>
                <p className="text-muted-foreground mt-2">mesecno / zauvek</p>
                <div className="mt-6 pt-6 border-t text-left space-y-3">
                  {[
                    'Kompletna BZR platforma',
                    'Marketplace profil',
                    'AI asistent',
                    'Generisanje dokumenata',
                    'Neogranicen broj klijenata',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-green-600">&#10003;</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-muted/30" id="cene">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold">Jednostavne cene za firme</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Placate prema broju zaposlenih. Agencije besplatno.
          </p>
          <div className="mt-10 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold">1 zaposlen</h3>
              <div className="mt-4 text-3xl font-bold">990 <span className="text-base font-normal text-muted-foreground">RSD/mes</span></div>
              <p className="text-sm text-muted-foreground mt-2">Preduzetnici</p>
            </div>
            <div className="rounded-lg border-2 border-primary bg-card p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                Najpopularnije
              </div>
              <h3 className="font-semibold">Do 20 zaposlenih</h3>
              <div className="mt-4 text-3xl font-bold">6.990 <span className="text-base font-normal text-muted-foreground">RSD/mes</span></div>
              <p className="text-sm text-muted-foreground mt-2">Mala i srednja preduzeca</p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold">51+ zaposlenih</h3>
              <div className="mt-4 text-3xl font-bold">14.990 <span className="text-base font-normal text-muted-foreground">RSD/mes</span></div>
              <p className="text-sm text-muted-foreground mt-2">Velika preduzeca</p>
            </div>
          </div>
          <Link
            href="/cene"
            className="inline-flex items-center justify-center mt-8 text-sm font-medium text-primary hover:underline"
          >
            Pogledajte sve cene i pakete &rarr;
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold">Spremni da budete uskladjeni sa zakonom?</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Od 1.1.2026. sve firme moraju imati BZR dokumentaciju. Pocnite danas.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/registracija"
              className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-base font-medium text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
            >
              Registrujte firmu besplatno
            </Link>
            <Link
              href="/registracija"
              className="inline-flex items-center justify-center rounded-md border px-8 py-3 text-base font-medium hover:bg-muted transition-colors"
            >
              Registrujte agenciju
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">BZR</span>
                </div>
                <span className="font-bold">Savetnik</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Marketplace za bezbednost i zdravlje na radu. Za firme i agencije u Srbiji.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Platforma</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/funkcionalnosti" className="hover:text-foreground">Funkcionalnosti</Link></li>
                <li><Link href="/cene" className="hover:text-foreground">Cene</Link></li>
                <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Resursi</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/propisi" className="hover:text-foreground">Propisi</Link></li>
                <li><Link href="/novosti" className="hover:text-foreground">Novosti</Link></li>
                <li><Link href="/kontakt" className="hover:text-foreground">Kontakt</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Pravno</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/uslovi-koriscenja" className="hover:text-foreground">Uslovi koriscenja</Link></li>
                <li><Link href="/privatnost" className="hover:text-foreground">Politika privatnosti</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} BZR Savetnik. Sva prava zadrzana.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
