'use client';

/**
 * Agency Finder Page
 *
 * Companies search for BZR agencies by name, city, specializations.
 * Uses existing agencies.listPublic endpoint.
 */

import { useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, Star, Building2, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function AgencyFinderPage() {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');

  const { data: agencies, isLoading } = (trpc as any).agencies.listPublic.useQuery(
    { search: search || undefined, city: city || undefined },
    { keepPreviousData: true }
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pronadjite BZR agenciju</h1>
        <p className="text-muted-foreground mt-1">
          Pretrazite licencirane agencije za bezbednost i zdravlje na radu
        </p>
      </div>

      {/* Search Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Pretrazite po nazivu agencije..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="relative w-full sm:w-64">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Grad..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : agencies?.length === 0 ? (
        <div className="text-center py-16">
          <Building2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Nema rezultata pretrage</p>
          <p className="text-sm text-muted-foreground mt-1">Pokusajte sa drugim kriterijumima</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agencies?.map((agency: any) => (
            <Link
              key={agency.id}
              href={`/app/pronadji-agenciju/${agency.id}`}
              className="rounded-lg border bg-card p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                {agency.logoUrl ? (
                  <img
                    src={agency.logoUrl}
                    alt={agency.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{agency.name}</h3>
                  {agency.city && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" />
                      {agency.city}
                    </p>
                  )}
                </div>
              </div>

              {agency.description && (
                <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                  {agency.description}
                </p>
              )}

              <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                {agency.rating && (
                  <span className="flex items-center gap-1 text-sm">
                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                    {agency.rating}
                    {agency.reviewCount > 0 && (
                      <span className="text-muted-foreground">({agency.reviewCount})</span>
                    )}
                  </span>
                )}
                {agency.specializations && (
                  <span className="text-xs text-muted-foreground truncate">
                    {agency.specializations}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
