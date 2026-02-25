'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { getIdToken } from '@/lib/firebase';

interface AgencyProfile {
  agency: {
    id: number;
    name: string;
    pib: string;
    maticniBroj: string | null;
    licenseNumber: string | null;
    address: string;
    city: string | null;
    postalCode: string | null;
    phone: string | null;
    email: string;
    website: string | null;
    directorName: string;
    subscriptionStatus: string;
    trialEndsAt: string | null;
  };
  user: {
    id: number;
    email: string;
    fullName: string;
    role: string;
  } | null;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<AgencyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [directorName, setDirectorName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = await getIdToken();
        if (!token) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/trpc/agencies.me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.ok) {
          const data = await res.json();
          const p = data?.result?.data?.json as AgencyProfile;
          if (p) {
            setProfile(p);
            setName(p.agency.name);
            setAddress(p.agency.address || '');
            setCity(p.agency.city || '');
            setPostalCode(p.agency.postalCode || '');
            setPhone(p.agency.phone || '');
            setWebsite(p.agency.website || '');
            setDirectorName(p.agency.directorName);
            setLicenseNumber(p.agency.licenseNumber || '');
          }
        }
      } catch (err) {
        setError('Greska pri ucitavanju profila');
      } finally {
        setLoading(false);
      }
    }

    if (user) fetchProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const token = await getIdToken();
      if (!token) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/trpc/agencies.update`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            json: {
              name,
              address: address || undefined,
              city: city || undefined,
              postalCode: postalCode || undefined,
              phone: phone || undefined,
              website: website || undefined,
              directorName: directorName || undefined,
              licenseNumber: licenseNumber || undefined,
            },
          }),
        }
      );

      if (res.ok) {
        setSuccess('Podaci su uspesno sacuvani');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.json?.message || 'Greska pri cuvanju');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greska pri cuvanju');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Podesavanja</h1>
        <p className="text-muted-foreground mt-1">Upravljajte podacima vase agencije</p>
      </div>

      {/* Subscription Status */}
      {profile && (
        <div className="rounded-lg border bg-card p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Status pretplate</p>
            <p className="text-xs text-muted-foreground">
              {profile.agency.subscriptionStatus === 'trial'
                ? `Probni period do ${profile.agency.trialEndsAt ? new Date(profile.agency.trialEndsAt).toLocaleDateString('sr-RS') : 'N/A'}`
                : profile.agency.subscriptionStatus === 'active'
                  ? 'Aktivna pretplata'
                  : profile.agency.subscriptionStatus}
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              profile.agency.subscriptionStatus === 'active'
                ? 'bg-green-100 text-green-800'
                : profile.agency.subscriptionStatus === 'trial'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-red-100 text-red-800'
            }`}
          >
            {profile.agency.subscriptionStatus === 'trial' ? 'Trial' : profile.agency.subscriptionStatus}
          </span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">
            {success}
          </div>
        )}

        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Podaci o agenciji</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Naziv agencije</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">PIB</label>
              <input
                type="text"
                value={profile?.agency.pib || ''}
                disabled
                className="w-full rounded-md border px-3 py-2 text-sm bg-muted cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Direktor</label>
              <input
                type="text"
                value={directorName}
                onChange={(e) => setDirectorName(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Broj licence</label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="BZR licenca"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Kontakt</h2>
          <div>
            <label className="block text-sm font-medium mb-1.5">Adresa</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ulica i broj"
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
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Postanski broj</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Telefon</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Web sajt</label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? 'Cuvanje...' : 'Sacuvaj promene'}
        </button>
      </form>
    </div>
  );
}
