import Link from 'next/link';
import type { Metadata } from 'next';
import { FileCheck, ClipboardList, BellRing, Bot, ShieldCheck, Signature, Phone, MapPin, Building2, Mail } from 'lucide-react';
import { PrijavaForma } from './prijava-forma';

export const metadata: Metadata = {
  title: 'Prvi mesec besplatno - BZR Savetnik za firme do 20 zaposlenih',
  description:
    'BZR dokumentacija za firme do 20 zaposlenih: prvi mesec besplatno, zatim 990 RSD mesecno ili 8.990 RSD godisnje. Dokumentaciju pregledaju i potpisuju licencirane BZR agencije.',
  alternates: { canonical: 'https://bzr-savetnik.com/akcija' },
  openGraph: {
    title: 'BZR Savetnik: prvi mesec besplatno',
    description: 'Za firme do 20 zaposlenih: 990 RSD mesecno ili 8.990 RSD godisnje posle besplatnog meseca.',
    url: 'https://bzr-savetnik.com/akcija',
  },
};

const comparison = [
  { who: 'BZR agencija, firma do 5 zaposlenih', price: 'od oko 600 EUR', note: 'godisnje' },
  { who: 'BZR agencija, firma do 20 zaposlenih', price: 'do oko 2.000 EUR', note: 'godisnje' },
  { who: 'Lice za BZR zaposleno u firmi', price: 'preko 10.000 EUR', note: 'godisnje' },
];

const features = [
  { icon: FileCheck, title: 'Pomoc pri izradi BZR dokumentacije', text: 'Akt o proceni rizika, pravilnici i uputstva. Platforma vas vodi korak po korak, a AI predlaze sadrzaj, pa ne pocinjete od praznog papira.' },
  { icon: Signature, title: 'Agencije sa naseg spiska potpisuju', text: 'Povezujemo vas sa licenciranim BZR agencijama koje pregledaju i potpisuju vasu dokumentaciju. Agenciju birate vi.' },
  { icon: ClipboardList, title: 'Evidencije, obrasci 1-11', text: 'Svih 11 obrazaca evidencija po Pravilniku (Sl. glasnik RS, br. 5/2025), na jednom mestu.' },
  { icon: BellRing, title: 'Podsetnici za rokove', text: 'Lekarski pregledi, obuke, pregledi opreme. Email stize pre roka, a ne posle inspekcije.' },
  { icon: Bot, title: 'AI savetnik Botislav', text: 'Pitajte bilo sta o propisima iz oblasti BZR i dobijte odgovor odmah.' },
  { icon: ShieldCheck, title: 'Prijava povrede na radu', text: 'Kompletan izvestaj o povredi na radu, spreman za distribuciju.' },
];

const faq = [
  { q: 'Da li za prvi mesec treba kartica ili uplata?', a: 'Ne. Registrujete firmu i 30 dana koristite sve funkcije bez placanja. Kartica nije potrebna.' },
  { q: 'Sta posle besplatnog meseca?', a: 'Za firme do 20 zaposlenih: 990 RSD mesecno ili 8.990 RSD godisnje. Placa se IPS QR kodom iz bankarske aplikacije. Ako ne nastavite, nista ne placate.' },
  { q: 'Ko potpisuje dokumentaciju?', a: 'Licencirana BZR agencija sa naseg spiska. Na platformi birate agenciju koja pregleda i potpisuje vasa dokumenta.' },
  { q: 'Vec imamo BZR agenciju. Zasto bismo presli?', a: 'Mnoge firme zadrze agenciju, a evidencije, rokove i dokumenta vode kod nas na jednom mestu. Prvi mesec mozete besplatno da uporedite.' },
  { q: 'Da li mala firma uopste mora da ima BZR?', a: 'Da. Po Zakonu o bezbednosti i zdravlju na radu svaki poslodavac mora da ima akt o proceni rizika, bez obzira na broj zaposlenih.' },
];

export default function AkcijaPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">BZR</span>
            </div>
            <span className="font-bold text-xl">Savetnik</span>
          </Link>
          <div className="flex items-center gap-3">
            <a href="tel:+381641258686" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
              <Phone className="h-4 w-4" /> 064 125 86 86
            </a>
            <Link
              href="/registracija?ref=akcija"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Registracija
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/10 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <span className="inline-flex rounded-full bg-primary text-primary-foreground text-xs font-semibold px-3 py-1">
              Za firme do 20 zaposlenih
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl font-bold tracking-tight">
              Prvi mesec besplatno.
              <span className="block text-primary">Posle toga 990 RSD mesecno.</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Kompletna BZR dokumentacija, evidencije i rokovi na jednom mestu, a dokumentaciju pregleda i potpisuje
              licencirana BZR agencija. Ili platite godisnje 8.990 RSD i ustedite 2.890 RSD.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/registracija?ref=akcija"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-lg hover:bg-primary/90"
              >
                Registrujte firmu besplatno
              </Link>
              <a
                href="#prijava"
                className="inline-flex items-center justify-center rounded-md border px-6 py-3 text-base font-semibold hover:bg-muted"
              >
                Ostavite podatke, mi vas zovemo
              </a>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Bez kartice. Bez obaveze. Cene su bez PDV-a.</p>
          </div>

          {/* Uporedjivanje */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="font-semibold text-lg">Koliko BZR obicno kosta</h2>
            <p className="text-sm text-muted-foreground mt-1">Procena trzisnih cena za firme u Srbiji.</p>
            <ul className="mt-5 divide-y">
              {comparison.map((c) => (
                <li key={c.who} className="flex items-baseline justify-between gap-4 py-3">
                  <span className="text-sm">{c.who}</span>
                  <span className="text-right whitespace-nowrap">
                    <span className="font-semibold">{c.price}</span>
                    <span className="block text-xs text-muted-foreground">{c.note}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-md bg-primary text-primary-foreground p-4 flex items-baseline justify-between gap-4">
              <span className="font-semibold">BZR Savetnik, do 20 zaposlenih</span>
              <span className="text-right whitespace-nowrap">
                <span className="text-2xl font-bold">8.990 RSD</span>
                <span className="block text-xs opacity-90">godisnje, ili 990 RSD mesecno</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Sta dobijate */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center">Po cemu se razlikujemo</h2>
          <p className="mt-3 text-center text-muted-foreground max-w-2xl mx-auto">
            Ne prodajemo vam samo program. Pomazemo vam da napravite dokumentaciju i povezujemo vas sa agencijom koja je potpisuje.
          </p>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="rounded-lg border bg-card p-6">
                <f.icon className="h-7 w-7 text-primary" />
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kako */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center">Kako izgleda</h2>
          <ol className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              ['Ostavite podatke ili se registrujte', 'Za par minuta. Treba vam samo PIB i broj zaposlenih.'],
              ['Mesec dana besplatno', 'Napravite dokumentaciju, unesite zaposlene i rokove, izaberite agenciju.'],
              ['Nastavite za 990 RSD', 'Mesecno 990 RSD ili godisnje 8.990 RSD, IPS QR kodom sa telefona.'],
            ].map(([t, d], i) => (
              <li key={t} className="rounded-lg border bg-card p-6">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">{i + 1}</span>
                <h3 className="mt-4 font-semibold">{t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Forma */}
      <section className="py-20" id="prijava">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center">Zelim besplatan prvi mesec</h2>
          <p className="mt-3 mb-8 text-center text-muted-foreground">
            Ostavite podatke i javljamo vam se u toku radnog dana. Pomazemo vam oko registracije i prvih dokumenata.
          </p>
          <PrijavaForma />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center">Cesta pitanja</h2>
          <div className="mt-10 space-y-3">
            {faq.map((f) => (
              <details key={f.q} className="rounded-lg border bg-card p-5 group">
                <summary className="font-semibold cursor-pointer list-none flex justify-between gap-4">
                  {f.q}
                  <span className="text-muted-foreground group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Kontakt */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
          <div className="flex gap-3">
            <Phone className="h-5 w-5 text-primary shrink-0" />
            <div>
              <div className="font-semibold">Telefon</div>
              <a href="tel:+381641258686" className="text-muted-foreground hover:text-foreground">064 125 86 86</a>
            </div>
          </div>
          <div className="flex gap-3">
            <Mail className="h-5 w-5 text-primary shrink-0" />
            <div>
              <div className="font-semibold">Email</div>
              <a href="mailto:office@nknet-consulting.com" className="text-muted-foreground hover:text-foreground break-all">office@nknet-consulting.com</a>
            </div>
          </div>
          <div className="flex gap-3">
            <Building2 className="h-5 w-5 text-primary shrink-0" />
            <div>
              <div className="font-semibold">NKNet Consulting DOO</div>
              <div className="text-muted-foreground">PIB 115190346, MB 22125338</div>
            </div>
          </div>
          <div className="flex gap-3">
            <MapPin className="h-5 w-5 text-primary shrink-0" />
            <div>
              <div className="font-semibold">Adresa</div>
              <div className="text-muted-foreground">Svetozara Miletica 104/18, 26000 Pancevo</div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} BZR Savetnik.{' '}
        <Link href="/cene" className="hover:text-foreground">Cene</Link>{' '}&middot;{' '}
        <Link href="/agencija" className="hover:text-foreground">BZR agencije</Link>{' '}&middot;{' '}
        <Link href="/ugovor" className="hover:text-foreground">Uslovi koriscenja</Link>
      </footer>
    </div>
  );
}
