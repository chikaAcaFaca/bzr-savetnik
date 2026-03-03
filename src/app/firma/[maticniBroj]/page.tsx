/**
 * Public Company Mini Website (SSR)
 *
 * Professional mini web page for each company in the 136k+ directory.
 * Server Component - no 'use client'. Uses generateMetadata for dynamic SEO.
 * ISR with revalidate: 86400 (24 hours).
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface CompanyProfile {
  id: number;
  maticniBroj: string;
  poslovnoIme: string;
  pravnaForma: string | null;
  sifraDelatnosti: string | null;
  opstina: string | null;
  sifraOpstine: string | null;
  datumOsnivanja: string | null;
  status: string | null;
  grad: string | null;
  brojZaposlenih: number | null;
  registrovan: boolean | null;
  pretplataAktivna: boolean | null;
  bzrAgencijaNaziv: string | null;
  kratakOpis: string | null;
  usluge: string | null;
  logoUrl: string | null;
  claimedAt: string | null;
  telefonVidljiv: boolean | null;
  emailVidljiv: boolean | null;
  telefon: string | null;
  email: string | null;
  webSajt: string | null;
  adresa: string | null;
}

async function getCompanyProfile(maticniBroj: string): Promise<CompanyProfile | null> {
  try {
    const response = await fetch(
      `${API_URL}/trpc/companyDirectory.getPublicProfile?input=${encodeURIComponent(JSON.stringify({ json: { maticniBroj } }))}`,
      { next: { revalidate: 86400 } }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data?.result?.data?.json ?? null;
  } catch {
    return null;
  }
}

function getGodinaOsnivanja(datumOsnivanja: string | null): string | null {
  if (!datumOsnivanja) return null;
  const match = datumOsnivanja.match(/\d{4}/);
  return match ? match[0] : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ maticniBroj: string }>;
}): Promise<Metadata> {
  const { maticniBroj } = await params;
  const company = await getCompanyProfile(maticniBroj);

  if (!company) {
    return { title: 'Firma nije pronadjena - BZR Savetnik' };
  }

  const descParts = [
    company.kratakOpis || `${company.poslovnoIme} - poslovna stranica`,
    company.opstina ? `Lokacija: ${company.opstina}` : null,
    company.sifraDelatnosti ? `Sifra delatnosti: ${company.sifraDelatnosti}` : null,
  ].filter(Boolean);

  return {
    title: `${company.poslovnoIme} - Web stranica firme | BZR Savetnik`,
    description: descParts.join('. '),
    openGraph: {
      title: company.poslovnoIme,
      description: descParts.join('. '),
      type: 'website',
    },
  };
}

export default async function CompanyMiniWebsite({
  params,
}: {
  params: Promise<{ maticniBroj: string }>;
}) {
  const { maticniBroj } = await params;
  const company = await getCompanyProfile(maticniBroj);

  if (!company) {
    notFound();
  }

  const godinaOsnivanja = getGodinaOsnivanja(company.datumOsnivanja);
  const isClaimed = !!company.claimedAt;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-green-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">BZR</span>
            </div>
            <span className="font-bold text-gray-900">Savetnik</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/firma"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Direktorijum firmi
            </Link>
            <Link
              href="/registracija"
              className="text-sm font-medium text-white bg-green-600 px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Registrujte se
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8 sm:px-8 sm:py-10">
            <div className="flex items-start gap-5">
              {/* Logo or placeholder */}
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={`${company.poslovnoIme} logo`}
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-white object-contain p-1 flex-shrink-0"
                />
              ) : (
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-2xl sm:text-3xl font-bold">
                    {company.poslovnoIme.charAt(0)}
                  </span>
                </div>
              )}

              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                  {company.poslovnoIme}
                </h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-green-100">
                  {company.sifraDelatnosti && (
                    <span>Delatnost {company.sifraDelatnosti}</span>
                  )}
                  {company.opstina && (
                    <span>{company.opstina}</span>
                  )}
                  {godinaOsnivanja && (
                    <span>Od {godinaOsnivanja}.</span>
                  )}
                </div>

                {/* Verified badge */}
                {isClaimed && (
                  <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 backdrop-blur rounded-full px-3 py-1 text-xs font-medium text-white">
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    Verifikovana firma
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 border-t bg-gray-50/50">
            <StatItem label="Zaposlenih" value={company.brojZaposlenih?.toString() || '-'} />
            <StatItem label="Delatnost" value={company.sifraDelatnosti || '-'} />
            <StatItem label="Opstina" value={company.opstina || '-'} />
            <StatItem label="Osnovana" value={godinaOsnivanja ? `${godinaOsnivanja}.` : '-'} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* O nama */}
            <section className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">O nama</h2>
              <p className="text-gray-600 leading-relaxed">
                {company.kratakOpis || (
                  `${company.poslovnoIme} je ${company.pravnaForma || 'privredno drustvo'} ` +
                  `registrovano u Agenciji za privredne registre` +
                  (company.opstina ? `, sa sedistem u opstini ${company.opstina}` : '') +
                  (company.sifraDelatnosti ? `. Sifra pretezne delatnosti: ${company.sifraDelatnosti}` : '') +
                  `.`
                )}
              </p>

              {company.usluge && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Usluge i delatnosti</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{company.usluge}</p>
                </div>
              )}
            </section>

            {/* Osnovni podaci */}
            <section className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Osnovni podaci</h2>
              <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                <DataRow label="Maticni broj" value={company.maticniBroj} mono />
                <DataRow label="Pravna forma" value={company.pravnaForma} />
                <DataRow label="Sifra delatnosti" value={company.sifraDelatnosti} />
                <DataRow label="Opstina" value={company.opstina} />
                <DataRow label="Datum osnivanja" value={company.datumOsnivanja} />
                <DataRow label="Status" value={company.status} />
                <DataRow label="Broj zaposlenih" value={company.brojZaposlenih?.toString()} />
                {company.grad && <DataRow label="Grad" value={company.grad} />}
              </dl>
            </section>

            {/* BZR Status */}
            <section className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">BZR Status</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                <StatusBadge
                  active={!!company.registrovan}
                  label={company.registrovan ? 'Registrovan na platformi' : 'Nije registrovan'}
                />
                <StatusBadge
                  active={!!company.pretplataAktivna}
                  label={company.pretplataAktivna ? 'Aktivna pretplata' : 'Nema pretplatu'}
                />
                {company.bzrAgencijaNaziv && (
                  <StatusBadge active label={`Agencija: ${company.bzrAgencijaNaziv}`} />
                )}
              </div>
              {!company.registrovan && (
                <p className="text-sm text-gray-500">
                  Ova firma jos nije aktivirala svoj profil na BZR Savetnik platformi.
                </p>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Kontakt */}
            <section className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Kontakt</h2>
              <div className="space-y-3 text-sm">
                {company.adresa && (
                  <ContactItem
                    icon={<MapPinIcon />}
                    label="Adresa"
                    value={company.adresa}
                  />
                )}
                {company.telefon && (
                  <ContactItem
                    icon={<PhoneIcon />}
                    label="Telefon"
                    value={company.telefon}
                    href={`tel:${company.telefon}`}
                  />
                )}
                {company.email && (
                  <ContactItem
                    icon={<MailIcon />}
                    label="Email"
                    value={company.email}
                    href={`mailto:${company.email}`}
                  />
                )}
                {company.webSajt && (
                  <ContactItem
                    icon={<GlobeIcon />}
                    label="Web sajt"
                    value={company.webSajt.replace(/^https?:\/\//, '')}
                    href={company.webSajt.startsWith('http') ? company.webSajt : `https://${company.webSajt}`}
                    external
                  />
                )}
                {!company.adresa && !company.telefon && !company.email && !company.webSajt && (
                  <p className="text-gray-400 italic">Kontakt podaci nisu dostupni</p>
                )}
              </div>
            </section>

            {/* CTA Card */}
            {!company.registrovan ? (
              <section className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-green-900 mb-1">Ovo je vasa firma?</h3>
                <p className="text-sm text-green-700 mb-4">
                  Aktivirajte besplatnu web stranicu i upravljajte vasim profilom
                </p>
                <Link
                  href={`/registracija?ref=firma&mb=${company.maticniBroj}`}
                  className="block w-full px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Aktivirajte besplatno
                </Link>
                <p className="text-xs text-green-600 mt-2">Bez kreditne kartice</p>
              </section>
            ) : (
              <section className="bg-blue-50 rounded-xl border border-blue-200 shadow-sm p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-semibold text-blue-900 mb-1">Verifikovana firma</h3>
                <p className="text-sm text-blue-700">
                  Ova firma koristi BZR Savetnik platformu
                </p>
              </section>
            )}

            {/* BZR Savetnik promo */}
            <section className="bg-white rounded-xl border shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">BZR Savetnik Platforma</h3>
              <ul className="space-y-2 text-xs text-gray-600">
                <li className="flex items-start gap-2">
                  <svg className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Akt o proceni rizika
                </li>
                <li className="flex items-start gap-2">
                  <svg className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Evidencije 1-11 iz oblasti BZR
                </li>
                <li className="flex items-start gap-2">
                  <svg className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Povezivanje sa BZR agencijama
                </li>
                <li className="flex items-start gap-2">
                  <svg className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Direktorijum 136.000+ firmi
                </li>
              </ul>
              <Link
                href="/registracija"
                className="block w-full mt-4 text-center px-4 py-2 border border-green-600 text-green-600 rounded-lg text-xs font-medium hover:bg-green-50 transition-colors"
              >
                Saznajte vise
              </Link>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-12">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-green-600 flex items-center justify-center">
                <span className="text-white font-bold text-[10px]">BZR</span>
              </div>
              <span className="text-sm text-gray-600">
                Powered by <Link href="/" className="text-green-600 hover:underline font-medium">BZR Savetnik</Link>
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Podaci iz Agencije za privredne registre (APR)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ============ Helper Components ============ */

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3 text-center">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-sm font-semibold text-gray-900 mt-0.5">{value}</dd>
    </div>
  );
}

function DataRow({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-gray-500 text-xs">{label}</dt>
      <dd className={`text-gray-900 font-medium ${mono ? 'font-mono' : ''}`}>{value || '-'}</dd>
    </div>
  );
}

function StatusBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
      active
        ? 'bg-green-100 text-green-800'
        : 'bg-gray-100 text-gray-500'
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-green-500' : 'bg-gray-400'}`} />
      {label}
    </span>
  );
}

function ContactItem({
  icon,
  label,
  value,
  href,
  external,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-gray-500 text-xs">{label}</p>
        {href ? (
          <a
            href={href}
            className="text-green-600 hover:underline break-all"
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {value}
          </a>
        ) : (
          <p className="text-gray-900 break-all">{value}</p>
        )}
      </div>
    </div>
  );
}

/* ============ SVG Icons ============ */

function MapPinIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}
