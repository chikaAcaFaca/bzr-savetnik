'use client';

/**
 * Admin Settings Page
 *
 * Platform-wide configuration: default social media links,
 * site branding, and other admin settings.
 * Only accessible to agency users (platform admins).
 */

import { useState, useEffect } from 'react';
import { Loader2, Save, Globe, Youtube, Facebook, Instagram } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { getIdToken } from '@/lib/firebase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface SiteSettings {
  social_facebook: string;
  social_instagram: string;
  social_youtube: string;
  social_tiktok: string;
  social_linkedin: string;
  [key: string]: string;
}

export default function AdminSettingsPage() {
  const { user, userType } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Social links state
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [youtube, setYoutube] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [linkedin, setLinkedin] = useState('');

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch(
          `${API_URL}/trpc/siteSettings.getPublic`
        );
        if (res.ok) {
          const data = await res.json();
          const settings = data?.result?.data?.json as SiteSettings;
          if (settings) {
            setFacebook(settings.social_facebook || '');
            setInstagram(settings.social_instagram || '');
            setYoutube(settings.social_youtube || '');
            setTiktok(settings.social_tiktok || '');
            setLinkedin(settings.social_linkedin || '');
          }
        }
      } catch (err) {
        setError('Greska pri ucitavanju podesavanja');
      } finally {
        setLoading(false);
      }
    }

    if (user) fetchSettings();
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
        `${API_URL}/trpc/siteSettings.setBulk`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            json: {
              settings: {
                social_facebook: facebook || null,
                social_instagram: instagram || null,
                social_youtube: youtube || null,
                social_tiktok: tiktok || null,
                social_linkedin: linkedin || null,
              },
            },
          }),
        }
      );

      if (res.ok) {
        setSuccess('Podesavanja su sacuvana');
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
        <h1 className="text-3xl font-bold">Admin podesavanja</h1>
        <p className="text-muted-foreground mt-1">
          Podesavanja platforme - default linkovi za drustvene mreze i brendiranje
        </p>
      </div>

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

        {/* Social Media Links */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <div>
            <h2 className="font-semibold">Default linkovi za drustvene mreze</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Ovi linkovi se prikazuju na profilima firmi koje jos nisu registrovane.
              Kada firma zakupi profil, moze da unese svoje linkove.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
                <Youtube className="h-4 w-4 text-red-600" />
                YouTube kanal
              </label>
              <input
                type="url"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                placeholder="https://www.youtube.com/@vaskkanal"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
                <Facebook className="h-4 w-4 text-blue-600" />
                Facebook stranica
              </label>
              <input
                type="url"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://www.facebook.com/vasastranica"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
                <Instagram className="h-4 w-4 text-pink-600" />
                Instagram profil
              </label>
              <input
                type="url"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://www.instagram.com/vasprofil"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                TikTok profil
              </label>
              <input
                type="url"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                placeholder="https://www.tiktok.com/@vasprofil"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
                <Globe className="h-4 w-4 text-blue-700" />
                LinkedIn stranica
              </label>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://www.linkedin.com/company/vasafirma"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Info card */}
        <div className="rounded-lg border bg-blue-50 border-blue-200 p-4">
          <h3 className="font-medium text-blue-900 text-sm">Kako funkcionisu linkovi?</h3>
          <ul className="mt-2 text-xs text-blue-800 space-y-1">
            <li>Neregistrovane firme - prikazuju se default linkovi (za backlink building)</li>
            <li>Registrovane firme - prikazuju se linkovi firme (ako ih ima)</li>
            <li>Ako firma nema svoje linkove, prikazuju se default linkovi</li>
          </ul>
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
          {saving ? 'Cuvanje...' : 'Sacuvaj podesavanja'}
        </button>
      </form>
    </div>
  );
}
