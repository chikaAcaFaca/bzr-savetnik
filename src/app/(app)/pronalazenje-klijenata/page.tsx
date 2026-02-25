'use client';

/**
 * Lead Finder Page (Agency Only)
 *
 * Agencies browse the 750k+ company directory to find potential clients.
 * Tabs: "Sve firme" (all) and "Vruci lidovi" (subscribed, no agency).
 */

import { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, Target, Building2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/providers/AuthProvider';

type TabValue = 'all' | 'hot';

export default function LeadFinderPage() {
  const { userType } = useAuth();
  const [tab, setTab] = useState<TabValue>('all');
  const [search, setSearch] = useState('');
  const [opstina, setOpstina] = useState('');
  const [sifraDelatnosti, setSifraDelatnosti] = useState('');
  const [page, setPage] = useState(1);

  // All companies query
  const allQuery = (trpc as any).companyDirectory.list.useQuery(
    {
      search: search || undefined,
      opstina: opstina || undefined,
      sifraDelatnosti: sifraDelatnosti || undefined,
      page,
      pageSize: 25,
    },
    { enabled: tab === 'all', keepPreviousData: true }
  );

  // Hot leads query
  const hotQuery = (trpc as any).companyDirectory.hotLeads.useQuery(
    {
      opstina: opstina || undefined,
      sifraDelatnosti: sifraDelatnosti || undefined,
      page,
      pageSize: 25,
    },
    { enabled: tab === 'hot', keepPreviousData: true }
  );

  // Stats query
  const statsQuery = (trpc as any).companyDirectory.stats.useQuery();

  const activeQuery = tab === 'all' ? allQuery : hotQuery;
  const items = activeQuery.data?.items ?? [];
  const totalPages = activeQuery.data?.totalPages ?? 0;
  const total = activeQuery.data?.total ?? 0;

  if (userType !== 'agency') {
    return (
      <div className="text-center py-16">
        <Target className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
        <p className="text-lg font-medium">Samo za agencije</p>
        <p className="text-sm text-muted-foreground mt-1">Ova funkcionalnost je dostupna samo BZR agencijama</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pronalazenje klijenata</h1>
        <p className="text-muted-foreground mt-1">
          Pretrazite direktorijum od {statsQuery.data?.total?.toLocaleString() ?? '...'} srpskih firmi
        </p>
      </div>

      {/* Stats */}
      {statsQuery.data && (
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Ukupno firmi', value: statsQuery.data.total?.toLocaleString() },
            { label: 'Registrovane', value: statsQuery.data.registered?.toLocaleString() },
            { label: 'Sa pretplatom', value: statsQuery.data.withSubscription?.toLocaleString() },
            { label: 'Sa agencijom', value: statsQuery.data.withAgency?.toLocaleString() },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-xl font-bold mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        <button
          onClick={() => { setTab('all'); setPage(1); }}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === 'all' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Sve firme
        </button>
        <button
          onClick={() => { setTab('hot'); setPage(1); }}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
            tab === 'hot' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Target className="h-3.5 w-3.5" />
          Vruci lidovi
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {tab === 'all' && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pretrazite po nazivu firme..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}
        <input
          type="text"
          placeholder="Opstina..."
          value={opstina}
          onChange={(e) => { setOpstina(e.target.value); setPage(1); }}
          className="w-full sm:w-48 px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="text"
          placeholder="Sifra delatnosti..."
          value={sifraDelatnosti}
          onChange={(e) => { setSifraDelatnosti(e.target.value); setPage(1); }}
          className="w-full sm:w-40 px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Results Table */}
      {activeQuery.isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <Building2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Nema rezultata</p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium">MB</th>
                    <th className="text-left px-4 py-3 font-medium">Naziv</th>
                    <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Opstina</th>
                    <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Delatnost</th>
                    <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Zaposleni</th>
                    {tab === 'all' && (
                      <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Status</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {items.map((company: any) => (
                    <tr key={company.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{company.maticniBroj}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/app/pronalazenje-klijenata/${company.maticniBroj}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {company.poslovnoIme}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{company.opstina ?? '-'}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{company.sifraDelatnosti ?? '-'}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{company.brojZaposlenih ?? '-'}</td>
                      {tab === 'all' && (
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <div className="flex gap-1.5">
                            {company.registrovan && (
                              <span className="px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-800">Reg.</span>
                            )}
                            {company.pretplataAktivna && (
                              <span className="px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-800">Pretplata</span>
                            )}
                            {company.bzrAgencijaNaziv && (
                              <span className="px-1.5 py-0.5 rounded text-xs bg-purple-100 text-purple-800">Agencija</span>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {total.toLocaleString()} rezultata | Strana {page} od {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md border text-sm disabled:opacity-50 hover:bg-muted transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Prethodna
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md border text-sm disabled:opacity-50 hover:bg-muted transition-colors"
              >
                Sledeca
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
