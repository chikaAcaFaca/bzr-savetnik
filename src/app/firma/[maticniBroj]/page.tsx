/**
 * Public Company Profile Page (SSR)
 *
 * SEO-friendly public page for each company in the directory.
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
      `${API_URL}/trpc/companyDirectory.getPublicProfile?input=${encodeURIComponent(JSON.stringify({ maticniBroj }))}`,
      { next: { revalidate: 86400 } }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data?.result?.data ?? null;
  } catch {
    return null;
  }
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

  const description = [
    company.poslovnoIme,
    company.pravnaForma,
    company.opstina ? `Opstina: ${company.opstina}` : null,
    company.sifraDelatnosti ? `Delatnost: ${company.sifraDelatnosti}` : null,
    `Maticni broj: ${company.maticniBroj}`,
  ].filter(Boolean).join(' | ');

  return {
    title: `${company.poslovnoIme} - BZR Savetnik`,
    description,
    openGraph: {
      title: company.poslovnoIme,
      description,
      type: 'website',
    },
  };
}

export default async function CompanyPublicProfilePage({
  params,
}: {
  params: Promise<{ maticniBroj: string }>;
}) {
  const { maticniBroj } = await params;
  const company = await getCompanyProfile(maticniBroj);

  if (!company) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-green-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">BZR</span>
            </div>
            <span className="font-bold text-gray-900">Savetnik</span>
          </Link>
          <Link
            href="/registracija"
            className="text-sm font-medium text-green-600 hover:text-green-700"
          >
            Registrujte se
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Company Name */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{company.poslovnoIme}</h1>
          <p className="text-gray-500 mt-1 font-mono text-sm">Maticni broj: {company.maticniBroj}</p>

          {/* Status badges */}
          <div className="flex flex-wrap gap-2 mt-3">
            {company.status && (
              <span className="px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                {company.status}
              </span>
            )}
            {company.registrovan && (
              <span className="px-2.5 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Registrovan na BZR Savetnik
              </span>
            )}
            {company.pretplataAktivna && (
              <span className="px-2.5 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                Aktivna pretplata
              </span>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Info */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Osnovni podaci</h2>
            <dl className="space-y-3 text-sm">
              <DataRow label="Maticni broj" value={company.maticniBroj} />
              <DataRow label="Pravna forma" value={company.pravnaForma} />
              <DataRow label="Sifra delatnosti" value={company.sifraDelatnosti} />
              <DataRow label="Opstina" value={company.opstina} />
              <DataRow label="Datum osnivanja" value={company.datumOsnivanja} />
              <DataRow label="Broj zaposlenih" value={company.brojZaposlenih?.toString()} />
            </dl>
          </div>

          {/* BZR Status */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">BZR Status</h2>
            <dl className="space-y-3 text-sm">
              <DataRow
                label="Registrovan na platformi"
                value={company.registrovan ? 'Da' : 'Ne'}
              />
              <DataRow
                label="Aktivna pretplata"
                value={company.pretplataAktivna ? 'Da' : 'Ne'}
              />
              <DataRow
                label="BZR agencija"
                value={company.bzrAgencijaNaziv || 'Nema'}
              />
            </dl>

            {/* Contact info if visible */}
            {(company.telefon || company.email || company.webSajt || company.adresa) && (
              <>
                <h3 className="text-sm font-semibold text-gray-900 mt-6 mb-3">Kontakt</h3>
                <dl className="space-y-3 text-sm">
                  <DataRow label="Adresa" value={company.adresa} />
                  <DataRow label="Telefon" value={company.telefon} />
                  <DataRow label="Email" value={company.email} />
                  <DataRow label="Web sajt" value={company.webSajt} />
                </dl>
              </>
            )}
          </div>
        </div>

        {/* CTA for non-registered companies */}
        {!company.registrovan && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-green-900">
              Ova firma jos nije na BZR Savetnik platformi
            </h3>
            <p className="text-green-700 text-sm mt-2">
              Registrujte vasu firmu i dobijte pristup automatizovanoj proceni rizika,
              generisanju dokumenata i povezivanju sa BZR agencijama.
            </p>
            <Link
              href="/registracija"
              className="inline-block mt-4 px-6 py-2.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Registrujte se besplatno
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-xs text-gray-500">
          <p>Podaci iz Agencije za privredne registre (APR). BZR Savetnik platforma.</p>
          <p className="mt-1">
            <Link href="/" className="text-green-600 hover:underline">bzr-savetnik.com</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-gray-900 font-medium text-right">{value || '-'}</dd>
    </div>
  );
}
