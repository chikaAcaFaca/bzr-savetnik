'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface AgencyListItem {
  id: number;
  name: string;
  city: string | null;
  description: string | null;
  specializations: string | null;
  rating: string | null;
  reviewCount: number | null;
  coverageArea: string | null;
  logoUrl: string | null;
  isPremium: boolean | null;
  featuredOrder: number | null;
}

function parseSpecializations(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [raw];
  } catch {
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
  }
}

export default function AgencyMarketplacePage() {
  const [agencies, setAgencies] = useState<AgencyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    fetchAgencies();
  }, []);

  async function fetchAgencies(searchVal?: string, cityVal?: string) {
    setLoading(true);
    try {
      const input: Record<string, any> = {
        page: 1,
        pageSize: 50,
      };
      if (searchVal) input.search = searchVal;
      if (cityVal) input.city = cityVal;

      const response = await fetch(
        `${API_URL}/trpc/agencies.listPublic?input=${encodeURIComponent(JSON.stringify(input))}`
      );

      if (response.ok) {
        const data = await response.json();
        setAgencies(data?.result?.data ?? []);
      }
    } catch {
      // Ignore fetch errors
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchAgencies(search || undefined, city || undefined);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-green-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">BZR</span>
            </div>
            <span className="font-bold text-gray-900">Savetnik</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/firma" className="text-sm text-gray-600 hover:text-gray-900">
              Firme
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

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            BZR Agencije - Marketplace
          </h1>
          <p className="text-gray-500 mt-2 max-w-lg mx-auto">
            Pronadjite pouzdanu agenciju za bezbednost i zdravlje na radu za vasu firmu
          </p>
        </div>

        {/* Search & Filter */}
        <form onSubmit={handleSearch} className="bg-white rounded-xl border shadow-sm p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pretrazite agencije po imenu..."
                className="w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="sm:w-48">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Grad..."
                className="w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Pretrazi
            </button>
          </div>
        </form>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-r-transparent" />
            <p className="text-gray-500 mt-3 text-sm">Ucitavanje agencija...</p>
          </div>
        ) : agencies.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <p className="text-gray-500">Nema rezultata za vasu pretragu</p>
            <button
              onClick={() => { setSearch(''); setCity(''); fetchAgencies(); }}
              className="mt-3 text-sm text-green-600 hover:underline"
            >
              Prikazite sve agencije
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agencies.map((agency) => (
              <AgencyCard key={agency.id} agency={agency} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-green-600 flex items-center justify-center">
                <span className="text-white font-bold text-[10px]">BZR</span>
              </div>
              <span className="text-sm text-gray-600">
                <Link href="/" className="text-green-600 hover:underline font-medium">BZR Savetnik</Link> Marketplace
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Bezbednost i zdravlje na radu
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AgencyCard({ agency }: { agency: AgencyListItem }) {
  const specializations = parseSpecializations(agency.specializations);
  const ratingNum = agency.rating ? parseFloat(agency.rating) : null;

  return (
    <Link href={`/agencija/${agency.id}`} className="block">
      <div className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow p-5 h-full ${
        agency.isPremium ? 'ring-1 ring-amber-200' : ''
      }`}>
        <div className="flex items-start gap-3 mb-3">
          {/* Logo */}
          {agency.logoUrl ? (
            <img
              src={agency.logoUrl}
              alt={`${agency.name} logo`}
              className="h-12 w-12 rounded-lg object-contain bg-gray-50 flex-shrink-0"
            />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg font-bold">{agency.name.charAt(0)}</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 truncate">{agency.name}</h3>
              {agency.isPremium && (
                <span className="inline-flex items-center bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[10px] font-semibold flex-shrink-0">
                  Premium
                </span>
              )}
            </div>
            {agency.city && (
              <p className="text-sm text-gray-500">{agency.city}</p>
            )}
          </div>
        </div>

        {/* Rating */}
        {ratingNum && (
          <div className="flex items-center gap-1 mb-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`h-3.5 w-3.5 ${star <= Math.round(ratingNum) ? 'text-amber-400' : 'text-gray-200'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">
              {ratingNum.toFixed(1)}
              {agency.reviewCount ? ` (${agency.reviewCount})` : ''}
            </span>
          </div>
        )}

        {/* Description */}
        {agency.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {agency.description}
          </p>
        )}

        {/* Specializations */}
        {specializations.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {specializations.slice(0, 3).map((spec, i) => (
              <span
                key={i}
                className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-green-50 text-green-700"
              >
                {spec}
              </span>
            ))}
            {specializations.length > 3 && (
              <span className="inline-block px-2 py-0.5 rounded text-[11px] text-gray-400">
                +{specializations.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
