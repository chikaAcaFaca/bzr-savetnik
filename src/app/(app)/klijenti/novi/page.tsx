'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getIdToken } from '@/lib/firebase';

const PRICING_TIERS = [
  { tier: 'tier_5', maxEmployees: 5, price: '1.990', label: 'Do 5 zaposlenih' },
  { tier: 'tier_10', maxEmployees: 10, price: '2.490', label: 'Do 10 zaposlenih' },
  { tier: 'tier_20', maxEmployees: 20, price: '6.990', label: 'Do 20 zaposlenih' },
  { tier: 'tier_50', maxEmployees: 50, price: '12.990', label: 'Do 50 zaposlenih' },
  { tier: 'tier_50plus', maxEmployees: Infinity, price: '19.990', label: '50+ zaposlenih' },
];

function getPricingTier(employeeCount: number) {
  return PRICING_TIERS.find((t) => employeeCount <= t.maxEmployees) || PRICING_TIERS[PRICING_TIERS.length - 1];
}

export default function NewClientPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [pib, setPib] = useState('');
  const [activityCode, setActivityCode] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [director, setDirector] = useState('');
  const [bzrResponsiblePerson, setBzrResponsiblePerson] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');

  const tier = employeeCount ? getPricingTier(parseInt(employeeCount) || 0) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = await getIdToken();
      if (!token) throw new Error('Niste prijavljeni');

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/trpc/companies.createForAgency`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            json: {
              name,
              pib,
              activityCode,
              activityDescription: activityDescription || undefined,
              address,
              city: city || undefined,
              postalCode: postalCode || undefined,
              phone: phone || undefined,
              email: email || undefined,
              director,
              bzrResponsiblePerson,
              employeeCount: parseInt(employeeCount) || 0,
            },
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.error?.json?.message || 'Greska pri dodavanju klijenta'
        );
      }

      router.push('/app/klijenti');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greska pri dodavanju klijenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/app/klijenti" className="p-2 rounded-md hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Dodaj novog klijenta</h1>
          <p className="text-muted-foreground text-sm">Unesite podatke o firmi</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Company Info */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Osnovni podaci</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Naziv firme *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Primer d.o.o."
                required
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">PIB *</label>
              <input
                type="text"
                value={pib}
                onChange={(e) => setPib(e.target.value)}
                placeholder="123456789"
                required
                maxLength={9}
                pattern="[0-9]{9}"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Sifra delatnosti *</label>
              <input
                type="text"
                value={activityCode}
                onChange={(e) => setActivityCode(e.target.value)}
                placeholder="4120"
                required
                maxLength={4}
                pattern="[0-9]{4}"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Opis delatnosti</label>
              <input
                type="text"
                value={activityDescription}
                onChange={(e) => setActivityDescription(e.target.value)}
                placeholder="Gradjevinarstvo"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Kontakt podaci</h2>
          <div>
            <label className="block text-sm font-medium mb-1.5">Adresa *</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Nemanjina 11, 11000 Beograd"
              required
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Grad</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Beograd"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Postanski broj</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="11000"
                maxLength={10}
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Telefon</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+381 11 123 4567"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@primer.rs"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Responsible Persons */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Odgovorna lica</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Direktor *</label>
              <input
                type="text"
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                placeholder="Ime i prezime direktora"
                required
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Lice za BZR *</label>
              <input
                type="text"
                value={bzrResponsiblePerson}
                onChange={(e) => setBzrResponsiblePerson(e.target.value)}
                placeholder="Ime i prezime lica za BZR"
                required
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Employee Count & Pricing */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Zaposleni i cena</h2>
          <div>
            <label className="block text-sm font-medium mb-1.5">Broj zaposlenih *</label>
            <input
              type="number"
              value={employeeCount}
              onChange={(e) => setEmployeeCount(e.target.value)}
              placeholder="0"
              required
              min={1}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {tier && (
            <div className="rounded-md bg-primary/5 border border-primary/20 p-4">
              <p className="text-sm font-medium">Mesecna cena za ovog klijenta:</p>
              <p className="text-2xl font-bold text-primary mt-1">
                {tier.price} <span className="text-sm font-normal text-muted-foreground">RSD/mesec</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Paket: {tier.label} | Godisnje: {parseInt(tier.price.replace('.', '')) * 10} RSD (usteda 2 meseca)
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/app/klijenti"
            className="flex-1 text-center rounded-md border px-4 py-2.5 text-sm font-medium hover:bg-muted"
          >
            Otkazi
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Dodavanje...' : 'Dodaj klijenta'}
          </button>
        </div>
      </form>
    </div>
  );
}
