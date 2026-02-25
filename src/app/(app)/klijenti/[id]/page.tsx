'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Users,
  FileText,
  Briefcase,
  Loader2,
  Pencil,
  Trash2,
  Save,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { getIdToken } from '@/lib/firebase';

interface ClientDetail {
  id: number;
  name: string;
  pib: string;
  maticniBroj: string | null;
  activityCode: string;
  activityDescription: string | null;
  address: string;
  city: string | null;
  postalCode: string | null;
  phone: string | null;
  email: string | null;
  director: string;
  bzrResponsiblePerson: string;
  employeeCount: number | null;
  pricingTier: string | null;
  billingCycle: string | null;
  createdAt: string;
}

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  const clientId = params.id as string;

  useEffect(() => {
    async function fetchClient() {
      try {
        const token = await getIdToken();
        if (!token) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/trpc/companies.getByIdForAgency?input=${encodeURIComponent(JSON.stringify({ json: { id: parseInt(clientId) } }))}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setClient(data?.result?.data?.json || null);
        }
      } catch (err) {
        console.error('Failed to fetch client:', err);
        setError('Greska pri ucitavanju klijenta');
      } finally {
        setLoading(false);
      }
    }

    if (user && clientId) fetchClient();
  }, [user, clientId]);

  const handleDelete = async () => {
    if (!confirm('Da li ste sigurni da zelite da obrisete ovog klijenta?')) return;

    try {
      const token = await getIdToken();
      if (!token) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/trpc/companies.deleteForAgency`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ json: { id: parseInt(clientId) } }),
        }
      );

      if (res.ok) {
        router.push('/app/klijenti');
      }
    } catch (err) {
      setError('Greska pri brisanju klijenta');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h2 className="text-lg font-semibold">Klijent nije pronadjen</h2>
        <Link href="/app/klijenti" className="text-primary hover:underline text-sm mt-2 inline-block">
          Nazad na listu klijenata
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/app/klijenti" className="p-2 rounded-md hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{client.name}</h1>
            <p className="text-muted-foreground text-sm">PIB: {client.pib}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 rounded-md border border-destructive/50 px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            Obrisi
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <Users className="h-5 w-5 text-blue-600 mb-2" />
          <p className="text-2xl font-bold">{client.employeeCount || 0}</p>
          <p className="text-xs text-muted-foreground">Zaposlenih</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <Briefcase className="h-5 w-5 text-green-600 mb-2" />
          <p className="text-2xl font-bold">0</p>
          <p className="text-xs text-muted-foreground">Radnih mesta</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <FileText className="h-5 w-5 text-purple-600 mb-2" />
          <p className="text-2xl font-bold">0</p>
          <p className="text-xs text-muted-foreground">Dokumenata</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <Building2 className="h-5 w-5 text-orange-600 mb-2" />
          <p className="text-2xl font-bold">{client.activityCode}</p>
          <p className="text-xs text-muted-foreground">Sifra delatnosti</p>
        </div>
      </div>

      {/* Company Details */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="font-semibold mb-4">Podaci o firmi</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Naziv</p>
            <p className="font-medium">{client.name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">PIB</p>
            <p className="font-medium">{client.pib}</p>
          </div>
          {client.maticniBroj && (
            <div>
              <p className="text-muted-foreground">Maticni broj</p>
              <p className="font-medium">{client.maticniBroj}</p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground">Delatnost</p>
            <p className="font-medium">
              {client.activityCode}
              {client.activityDescription && ` - ${client.activityDescription}`}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Adresa</p>
            <p className="font-medium">
              {client.address}
              {client.city && `, ${client.city}`}
              {client.postalCode && ` ${client.postalCode}`}
            </p>
          </div>
          {client.phone && (
            <div>
              <p className="text-muted-foreground">Telefon</p>
              <p className="font-medium">{client.phone}</p>
            </div>
          )}
          {client.email && (
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{client.email}</p>
            </div>
          )}
        </div>
      </div>

      {/* Responsible Persons */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="font-semibold mb-4">Odgovorna lica</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Direktor</p>
            <p className="font-medium">{client.director}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Lice za BZR</p>
            <p className="font-medium">{client.bzrResponsiblePerson}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="font-semibold mb-4">Brze akcije</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <Link
            href={`/app/pozicije?companyId=${client.id}`}
            className="rounded-lg border p-4 text-center hover:bg-muted transition-colors"
          >
            <Briefcase className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Radna mesta</p>
          </Link>
          <Link
            href={`/app/dokumenti?companyId=${client.id}`}
            className="rounded-lg border p-4 text-center hover:bg-muted transition-colors"
          >
            <FileText className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Dokumenti</p>
          </Link>
          <Link
            href={`/app/ai-savetnik?companyId=${client.id}`}
            className="rounded-lg border p-4 text-center hover:bg-muted transition-colors"
          >
            <span className="text-xl block mb-1">🤖</span>
            <p className="text-sm font-medium">AI Savetnik</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
