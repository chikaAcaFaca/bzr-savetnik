'use client';

/**
 * Public Company Directory Listing
 *
 * Browse 136,000+ Serbian companies from APR registry.
 * Each company links to its public profile at /firma/[maticniBroj].
 * No auth required - public page for SEO.
 */

import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';

export default function CompanyDirectoryPage() {
  const [search, setSearch] = useState('');
  const [delatnost, setDelatnost] = useState('');
  const [opstina, setOpstinaFilter] = useState('');
  const [page, setPage] = useState(1);
  const [submittedSearch, setSubmittedSearch] = useState('');

  const { data, isLoading } = (trpc as any).companyDirectory.publicList.useQuery({
    search: submittedSearch || undefined,
    sifraDelatnosti: delatnost || undefined,
    opstina: opstina || undefined,
    page,
    pageSize: 25,
  }) as { data: any; isLoading: boolean };

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSubmittedSearch(search);
    setPage(1);
  }

  const delatnosti = [
    { value: '', label: 'Sve delatnosti' },
    { value: '01', label: 'Poljoprivreda (01-03)' },
    { value: '10', label: 'Proizvodnja hrane (10-12)' },
    { value: '13', label: 'Tekstilna industrija (13-15)' },
    { value: '16', label: 'Prerada drveta (16)' },
    { value: '20', label: 'Hemijska industrija (20-21)' },
    { value: '22', label: 'Proizvodnja gume i plastike (22-23)' },
    { value: '24', label: 'Metalska industrija (24-25)' },
    { value: '26', label: 'Elektronika i elektro (26-27)' },
    { value: '28', label: 'Masinska industrija (28-30)' },
    { value: '33', label: 'Popravka i instaliranje (33)' },
    { value: '35', label: 'Snabdevanje energijom (35-39)' },
    { value: '41', label: 'Gradjevinarstvo (41-43)' },
    { value: '45', label: 'Trgovina vozilima (45)' },
    { value: '46', label: 'Trgovina na veliko (46)' },
    { value: '47', label: 'Trgovina na malo (47)' },
    { value: '49', label: 'Transport (49-53)' },
    { value: '55', label: 'Ugostiteljstvo (55-56)' },
    { value: '58', label: 'Izdavastvo i mediji (58-60)' },
    { value: '61', label: 'Telekomunikacije (61)' },
    { value: '62', label: 'IT i programiranje (62-63)' },
    { value: '64', label: 'Finansije i osiguranje (64-66)' },
    { value: '68', label: 'Nekretnine (68)' },
    { value: '69', label: 'Pravne i racunovodstvene (69-70)' },
    { value: '71', label: 'Arhitektura i inzenjerstvo (71)' },
    { value: '72', label: 'Naucno istrazivanje (72)' },
    { value: '77', label: 'Iznajmljivanje (77-82)' },
    { value: '84', label: 'Javna uprava (84)' },
    { value: '85', label: 'Obrazovanje (85)' },
    { value: '86', label: 'Zdravstvo (86-88)' },
    { value: '90', label: 'Umetnost i kultura (90-93)' },
    { value: '94', label: 'Ostale usluge (94-96)' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-green-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">BZR</span>
            </div>
            <span className="font-bold text-gray-900">Savetnik</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/prijava" className="text-sm text-gray-600 hover:text-gray-900">
              Prijava
            </Link>
            <Link
              href="/registracija"
              className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Registracija
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Baza firmi u Srbiji - 136.000+ kompanija
          </h1>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Pretrazite firme po nazivu, delatnosti ili lokaciji.
            Podaci iz Agencije za privredne registre (APR).
            Svaka firma ima svoj profil sa kontakt podacima i BZR statusom.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-lg border p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Pretrazite po nazivu firme..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <select
              value={delatnost}
              onChange={(e) => { setDelatnost(e.target.value); setPage(1); }}
              className="rounded-md border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {delatnosti.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Opstina..."
              value={opstina}
              onChange={(e) => { setOpstinaFilter(e.target.value); setPage(1); }}
              className="sm:w-40 rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="submit"
              className="rounded-md bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              Pretrazi
            </button>
          </form>
        </div>

        {/* Results count */}
        {data && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              {data.total.toLocaleString('sr-Latn')} firmi pronadjeno
              {data.totalPages > 1 && ` (strana ${data.page} od ${data.totalPages})`}
            </p>
          </div>
        )}

        {/* Results Table */}
        {isLoading ? (
          <div className="bg-white rounded-lg border p-12 text-center text-gray-500">
            Ucitavanje firmi...
          </div>
        ) : data?.items.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center text-gray-500">
            <p className="text-lg font-medium">Nema rezultata</p>
            <p className="text-sm mt-2">Pokusajte sa drugim kriterijumima pretrage.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Naziv firme</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Maticni br.</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Delatnost</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Opstina</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Zaposleni</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">BZR</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data?.items.map((company: any) => (
                    <tr key={company.maticniBroj} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/firma/${company.maticniBroj}`}
                          className="text-green-700 font-medium hover:text-green-900 hover:underline"
                        >
                          {company.poslovnoIme}
                        </Link>
                        {company.pravnaForma && (
                          <span className="text-xs text-gray-400 ml-1">({company.pravnaForma})</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{company.maticniBroj}</td>
                      <td className="px-4 py-3 text-gray-500">{company.sifraDelatnosti || '-'}</td>
                      <td className="px-4 py-3 text-gray-500">{company.opstina || '-'}</td>
                      <td className="px-4 py-3 text-gray-500 text-right">{company.brojZaposlenih ?? '-'}</td>
                      <td className="px-4 py-3 text-center">
                        {company.registrovan ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                            Registrovan
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y">
              {data?.items.map((company: any) => (
                <Link
                  key={company.maticniBroj}
                  href={`/firma/${company.maticniBroj}`}
                  className="block p-4 hover:bg-gray-50"
                >
                  <div className="font-medium text-green-700">{company.poslovnoIme}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    MB: {company.maticniBroj} | {company.opstina || 'N/A'} | {company.sifraDelatnosti || 'N/A'}
                  </div>
                  {company.registrovan && (
                    <span className="inline-flex mt-2 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                      Registrovan na BZR Savetnik
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &larr; Prethodna
            </button>
            <div className="flex items-center gap-1">
              {page > 2 && (
                <button onClick={() => setPage(1)} className="px-3 py-2 rounded-md text-sm hover:bg-gray-50">1</button>
              )}
              {page > 3 && <span className="px-1 text-gray-400">...</span>}
              {page > 1 && (
                <button onClick={() => setPage(page - 1)} className="px-3 py-2 rounded-md text-sm hover:bg-gray-50">
                  {page - 1}
                </button>
              )}
              <button className="px-3 py-2 rounded-md text-sm bg-green-600 text-white font-medium">
                {page}
              </button>
              {page < data.totalPages && (
                <button onClick={() => setPage(page + 1)} className="px-3 py-2 rounded-md text-sm hover:bg-gray-50">
                  {page + 1}
                </button>
              )}
              {page < data.totalPages - 2 && <span className="px-1 text-gray-400">...</span>}
              {page < data.totalPages - 1 && (
                <button onClick={() => setPage(data.totalPages)} className="px-3 py-2 rounded-md text-sm hover:bg-gray-50">
                  {data.totalPages}
                </button>
              )}
            </div>
            <button
              onClick={() => setPage(Math.min(data.totalPages, page + 1))}
              disabled={page >= data.totalPages}
              className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sledeca &rarr;
            </button>
          </div>
        )}

        {/* SEO Bottom Section */}
        <div className="mt-12 bg-white rounded-lg border p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Registar firmi u Srbiji</h2>
          <p className="text-sm text-gray-600 mb-4">
            BZR Savetnik sadrzi podatke o preko 136.000 aktivnih firmi u Srbiji, preuzete iz
            Agencije za privredne registre (APR). Svaka firma ima svoj profil sa osnovnim podacima
            o delatnosti, lokaciji, broju zaposlenih i statusu uskladenosti sa zakonom o
            bezbednosti i zdravlju na radu (BZR).
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Od 1. jula 2026. godine, prema novom Pravilniku o nacinu vodjenja evidencija u oblasti BZR
            (Sl. glasnik RS, br. 5/2025), sve firme su u obavezi da vode evidencije na Obrascima 1-11.
            BZR Savetnik platforma omogucava digitalno vodjenje svih 11 obrazaca, automatsko
            popunjavanje iz Akta o proceni rizika, i generisanje DOCX dokumenata.
          </p>
          <div className="flex flex-wrap gap-2 mt-6">
            <Link href="/registracija" className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
              Registrujte firmu besplatno
            </Link>
            <Link href="/cene" className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Pogledajte cene
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-xs text-gray-500">
          <p>Podaci iz Agencije za privredne registre (APR). BZR Savetnik platforma.</p>
          <p className="mt-1">
            <Link href="/" className="text-green-600 hover:underline">bzr-savetnik.com</Link>
            {' '}&middot;{' '}
            <Link href="/cene" className="text-green-600 hover:underline">Cene</Link>
            {' '}&middot;{' '}
            <Link href="/kontakt" className="text-green-600 hover:underline">Kontakt</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
