'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Plus, Search, Users, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { getIdToken } from '@/lib/firebase';

interface Client {
  id: number;
  name: string;
  pib: string;
  city: string | null;
  employeeCount: number | null;
  pricingTier: string | null;
  createdAt: string;
}

export default function ClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchClients() {
      try {
        const token = await getIdToken();
        if (!token) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/trpc/companies.listByAgency`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setClients(data?.result?.data?.json || []);
        }
      } catch (err) {
        console.error('Failed to fetch clients:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user) fetchClients();
  }, [user]);

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.pib.includes(search)
  );

  function getTierLabel(tier: string | null): string {
    const labels: Record<string, string> = {
      tier_5: 'Do 5',
      tier_10: 'Do 10',
      tier_20: 'Do 20',
      tier_50: 'Do 50',
      tier_50plus: '50+',
    };
    return tier ? labels[tier] || tier : '-';
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Klijenti</h1>
          <p className="text-muted-foreground mt-1">
            Upravljajte vasim klijentima i njihovom BZR dokumentacijom
          </p>
        </div>
        <Link
          href="/app/klijenti/novi"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Dodaj klijenta
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pretrazite po nazivu ili PIB-u..."
          className="w-full rounded-md border px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Clients List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-semibold text-lg">
            {search ? 'Nema rezultata pretrage' : 'Nemate klijenata'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {search
              ? 'Pokusajte sa drugim terminom za pretragu'
              : 'Dodajte prvog klijenta da biste poceli sa radom'}
          </p>
          {!search && (
            <Link
              href="/app/klijenti/novi"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground mt-4"
            >
              <Plus className="h-4 w-4" />
              Dodaj klijenta
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-lg border bg-card divide-y">
          {filteredClients.map((client) => (
            <Link
              key={client.id}
              href={`/app/klijenti/${client.id}`}
              className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{client.name}</p>
                  <p className="text-sm text-muted-foreground">
                    PIB: {client.pib}
                    {client.city && ` • ${client.city}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <div className="flex items-center gap-1 text-sm">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{client.employeeCount || 0} zaposlenih</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Paket: {getTierLabel(client.pricingTier)}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Stats */}
      {clients.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border bg-card p-4 text-center">
            <p className="text-2xl font-bold">{clients.length}</p>
            <p className="text-xs text-muted-foreground">Ukupno klijenata</p>
          </div>
          <div className="rounded-lg border bg-card p-4 text-center">
            <p className="text-2xl font-bold">
              {clients.reduce((sum, c) => sum + (c.employeeCount || 0), 0)}
            </p>
            <p className="text-xs text-muted-foreground">Ukupno zaposlenih</p>
          </div>
          <div className="rounded-lg border bg-card p-4 text-center">
            <p className="text-2xl font-bold">
              {clients.filter((c) => c.pricingTier).length}
            </p>
            <p className="text-xs text-muted-foreground">Aktivnih pretplata</p>
          </div>
        </div>
      )}
    </div>
  );
}
