/**
 * Public Agency Profile Page (SSR)
 *
 * SEO-friendly public page for each BZR agency on the marketplace.
 * Server Component - no 'use client'. Uses generateMetadata for dynamic SEO.
 * ISR with revalidate: 86400 (24 hours).
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface AgencyProfile {
  id: number;
  name: string;
  city: string | null;
  address: string;
  phone: string | null;
  email: string;
  website: string | null;
  description: string | null;
  specializations: string | null;
  rating: string | null;
  reviewCount: number | null;
  coverageArea: string | null;
  logoUrl: string | null;
  licenseNumber: string | null;
  isPremium: boolean | null;
  bannerUrl: string | null;
  socialLinks: string | null;
}

interface SocialLinks {
  linkedin?: string;
  facebook?: string;
  instagram?: string;
}

async function getAgencyProfile(id: number): Promise<AgencyProfile | null> {
  try {
    const response = await fetch(
      `${API_URL}/trpc/agencies.getPublicProfile?input=${encodeURIComponent(JSON.stringify({ id }))}`,
      { next: { revalidate: 86400 } }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data?.result?.data ?? null;
  } catch {
    return null;
  }
}

function parseSocialLinks(raw: string | null): SocialLinks {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const agencyId = parseInt(id);
  if (isNaN(agencyId)) return { title: 'Agencija nije pronadjena - BZR Savetnik' };

  const agency = await getAgencyProfile(agencyId);

  if (!agency) {
    return { title: 'Agencija nije pronadjena - BZR Savetnik' };
  }

  const descParts = [
    agency.description || `${agency.name} - BZR agencija`,
    agency.city ? `Lokacija: ${agency.city}` : null,
    agency.coverageArea ? `Podrucje rada: ${agency.coverageArea}` : null,
  ].filter(Boolean);

  return {
    title: `${agency.name} - BZR Agencija | BZR Savetnik`,
    description: descParts.join('. '),
    openGraph: {
      title: `${agency.name} - BZR Agencija`,
      description: descParts.join('. '),
      type: 'website',
    },
  };
}

export default async function AgencyPublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agencyId = parseInt(id);
  if (isNaN(agencyId)) notFound();

  const agency = await getAgencyProfile(agencyId);
  if (!agency) notFound();

  const specializations = parseSpecializations(agency.specializations);
  const socialLinks = parseSocialLinks(agency.socialLinks);
  const ratingNum = agency.rating ? parseFloat(agency.rating) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-green-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">BZR</span>
            </div>
            <span className="font-bold text-gray-900">Savetnik</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/agencija" className="text-sm text-gray-600 hover:text-gray-900">
              Sve agencije
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

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-8">
          {/* Banner */}
          {agency.bannerUrl && agency.isPremium ? (
            <div className="h-32 sm:h-48 bg-gray-200">
              <img src={agency.bannerUrl} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="h-24 sm:h-32 bg-gradient-to-r from-green-600 to-emerald-700" />
          )}

          <div className="px-6 sm:px-8 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-8 sm:-mt-10">
              {/* Logo */}
              {agency.logoUrl ? (
                <img
                  src={agency.logoUrl}
                  alt={`${agency.name} logo`}
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-white border-4 border-white object-contain shadow-sm flex-shrink-0"
                />
              ) : (
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-green-600 border-4 border-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-white text-xl sm:text-2xl font-bold">
                    {agency.name.charAt(0)}
                  </span>
                </div>
              )}

              <div className="flex-1 min-w-0 sm:pb-1">
                <div className="flex items-start gap-3">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                    {agency.name}
                  </h1>
                  {agency.isPremium && (
                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 mt-1">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Premium
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-gray-500">
                  {agency.city && <span>{agency.city}</span>}
                  {agency.licenseNumber && <span>Licenca: {agency.licenseNumber}</span>}
                </div>
                {/* Rating */}
                {ratingNum && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`h-4 w-4 ${star <= Math.round(ratingNum) ? 'text-amber-400' : 'text-gray-200'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 font-medium">{ratingNum.toFixed(1)}</span>
                    {agency.reviewCount ? (
                      <span className="text-sm text-gray-400">({agency.reviewCount} recenzija)</span>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* O agenciji */}
            {agency.description && (
              <section className="bg-white rounded-xl border shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">O agenciji</h2>
                <p className="text-gray-600 leading-relaxed">{agency.description}</p>
              </section>
            )}

            {/* Specijalizacije */}
            {specializations.length > 0 && (
              <section className="bg-white rounded-xl border shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Specijalizacije</h2>
                <div className="flex flex-wrap gap-2">
                  {specializations.map((spec, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-50 text-green-800 border border-green-200"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Podrucje rada */}
            {agency.coverageArea && (
              <section className="bg-white rounded-xl border shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Podrucje rada</h2>
                <p className="text-gray-600">{agency.coverageArea}</p>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Kontakt */}
            <section className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Kontakt</h2>
              <div className="space-y-3 text-sm">
                {agency.address && (
                  <div className="flex items-start gap-3">
                    <svg className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <div>
                      <p className="text-gray-500 text-xs">Adresa</p>
                      <p className="text-gray-900">{agency.address}</p>
                    </div>
                  </div>
                )}
                {agency.phone && (
                  <div className="flex items-start gap-3">
                    <svg className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    <div>
                      <p className="text-gray-500 text-xs">Telefon</p>
                      <a href={`tel:${agency.phone}`} className="text-green-600 hover:underline">{agency.phone}</a>
                    </div>
                  </div>
                )}
                {agency.email && (
                  <div className="flex items-start gap-3">
                    <svg className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    <div>
                      <p className="text-gray-500 text-xs">Email</p>
                      <a href={`mailto:${agency.email}`} className="text-green-600 hover:underline break-all">{agency.email}</a>
                    </div>
                  </div>
                )}
                {agency.website && (
                  <div className="flex items-start gap-3">
                    <svg className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                    <div>
                      <p className="text-gray-500 text-xs">Web sajt</p>
                      <a
                        href={agency.website.startsWith('http') ? agency.website : `https://${agency.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline break-all"
                      >
                        {agency.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Social links (premium only) */}
              {agency.isPremium && (socialLinks.linkedin || socialLinks.facebook || socialLinks.instagram) && (
                <div className="flex gap-3 mt-4 pt-4 border-t">
                  {socialLinks.linkedin && (
                    <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600" title="LinkedIn">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                    </a>
                  )}
                  {socialLinks.facebook && (
                    <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500" title="Facebook">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                    </a>
                  )}
                  {socialLinks.instagram && (
                    <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500" title="Instagram">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" /></svg>
                    </a>
                  )}
                </div>
              )}
            </section>

            {/* CTA Card */}
            <section className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm p-6 text-center">
              <h3 className="font-semibold text-green-900 mb-1">Potrebna vam je BZR agencija?</h3>
              <p className="text-sm text-green-700 mb-4">
                Registrujte vasu firmu i zatrazite saradnju sa ovom agencijom
              </p>
              <Link
                href="/registracija"
                className="block w-full px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Registrujte firmu besplatno
              </Link>
            </section>

            {/* Marketplace info */}
            <section className="bg-white rounded-xl border shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">BZR Savetnik Marketplace</h3>
              <p className="text-xs text-gray-500 mb-3">
                Pronadjite pravu BZR agenciju za vasu firmu
              </p>
              <Link
                href="/agencija"
                className="block w-full text-center px-4 py-2 border border-green-600 text-green-600 rounded-lg text-xs font-medium hover:bg-green-50 transition-colors"
              >
                Pregledajte sve agencije
              </Link>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-12">
        <div className="max-w-5xl mx-auto px-4 py-6">
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
