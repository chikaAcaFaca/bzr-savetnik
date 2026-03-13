'use client';

/**
 * Public Company Mini Website
 *
 * Professional mini web page for each company in the 136k+ directory.
 * Client component - fetches data on mount to avoid Vercel SSR timeout
 * when Render backend is sleeping (free tier).
 *
 * Phase 2: Financial data, social share, agency onboard button.
 * Phase 3: Blog posts, offers, image gallery.
 */

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface CompanyPost {
  id: number;
  type: 'blog' | 'ponuda' | 'galerija';
  title: string | null;
  content: string | null;
  imageUrl: string | null;
  isPublished: boolean;
  createdAt: string;
}

interface CompanyProfile {
  id: number;
  maticniBroj: string;
  pib: string | null;
  poslovnoIme: string;
  pravnaForma: string | null;
  sifraDelatnosti: string | null;
  opstina: string | null;
  sifraOpstine: string | null;
  datumOsnivanja: string | null;
  status: string | null;
  grad: string | null;
  brojZaposlenih: number | null;
  registrovan: boolean | null;
  pretplataAktivna: boolean | null;
  bzrAgencijaNaziv: string | null;
  kratakOpis: string | null;
  usluge: string | null;
  logoUrl: string | null;
  claimedAt: string | null;
  telefonVidljiv: boolean | null;
  emailVidljiv: boolean | null;
  telefon: string | null;
  email: string | null;
  webSajt: string | null;
  adresa: string | null;
  // CompanyWall financial data
  prihod: number | null;
  rashod: number | null;
  dobitGubitak: number | null;
  kapital: number | null;
  companyWallUrl: string | null;
}

function getGodinaOsnivanja(datumOsnivanja: string | null): string | null {
  if (!datumOsnivanja) return null;
  const match = datumOsnivanja.match(/\d{4}/);
  return match ? match[0] : null;
}

/** Format number in Serbian style: 1.234.567 RSD */
function formatRsd(amount: number | null | undefined): string {
  if (amount == null) return '-';
  return amount.toLocaleString('sr-RS') + ' RSD';
}

/** Shorten large numbers: 12.500.000 -> 12,5M */
function formatShortRsd(amount: number | null | undefined): string {
  if (amount == null) return '-';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1_000_000_000) return sign + (abs / 1_000_000_000).toFixed(1).replace('.', ',') + ' mlrd';
  if (abs >= 1_000_000) return sign + (abs / 1_000_000).toFixed(1).replace('.', ',') + 'M';
  if (abs >= 1_000) return sign + (abs / 1_000).toFixed(0) + 'K';
  return amount.toLocaleString('sr-RS');
}

export default function CompanyMiniWebsite() {
  const params = useParams();
  const maticniBroj = params.maticniBroj as string;
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isAgency, setIsAgency] = useState(false);
  const [onboarding, setOnboarding] = useState(false);
  const [onboardSuccess, setOnboardSuccess] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [posts, setPosts] = useState<CompanyPost[]>([]);
  const [galleryLightbox, setGalleryLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (!maticniBroj) return;

    fetch(
      `${API_URL}/trpc/companyDirectory.getPublicProfile?input=${encodeURIComponent(JSON.stringify({ json: { maticniBroj } }))}`
    )
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        const profile = data?.result?.data?.json;
        if (!profile) throw new Error('No data');
        profile.poslovnoIme = profile.poslovnoIme?.trim() || 'Nepoznato';
        setCompany(profile);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));

    // Fetch posts
    fetch(
      `${API_URL}/trpc/companyDirectory.listPosts?input=${encodeURIComponent(JSON.stringify({ json: { maticniBroj } }))}`
    )
      .then((res) => res.json())
      .then((data) => {
        const postsData = data?.result?.data?.json;
        if (Array.isArray(postsData)) setPosts(postsData);
      })
      .catch(() => {});

    // Check if user is an agency user
    try {
      const userType = localStorage.getItem('bzr_user_type');
      if (userType === 'agency') setIsAgency(true);
    } catch {}
  }, [maticniBroj]);

  const handleAgencyOnboard = async () => {
    setOnboarding(true);
    try {
      const token = localStorage.getItem('bzr_token');
      if (!token) {
        alert('Morate biti prijavljeni kao agencija');
        return;
      }

      const res = await fetch(`${API_URL}/trpc/companyDirectory.agencyOnboardClient`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ json: { maticniBroj, sendNotification: true } }),
      });

      const data = await res.json();
      if (data?.result?.data?.json?.company) {
        setOnboardSuccess(true);
        // Refresh profile
        setTimeout(() => window.location.reload(), 2000);
      } else {
        const errorMsg = data?.error?.json?.message || 'Greska pri preuzimanju klijenta';
        alert(errorMsg);
      }
    } catch (err) {
      alert('Greska pri preuzimanju klijenta. Pokusajte ponovo.');
    } finally {
      setOnboarding(false);
    }
  };

  const handleCopyLink = () => {
    const url = `https://bzr-savetnik.com/firma/${maticniBroj}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8 sm:px-8 sm:py-10">
              <div className="flex items-start gap-5">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-white/20 animate-pulse" />
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-white/20 rounded w-2/3 animate-pulse" />
                  <div className="h-4 bg-white/20 rounded w-1/3 animate-pulse" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x border-t bg-gray-50/50">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="px-4 py-3 text-center">
                  <div className="h-3 bg-gray-200 rounded w-12 mx-auto mb-1 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-8 mx-auto animate-pulse" />
                </div>
              ))}
            </div>
          </div>
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-r-transparent" />
            <p className="text-gray-500 mt-3 text-sm">Ucitavanje profila firme...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-xl border shadow-sm p-8 max-w-md mx-auto">
            <h1 className="text-xl font-bold text-gray-900 mb-2">Firma nije pronadjena</h1>
            <p className="text-gray-500 mb-4">
              Ne postoji firma sa maticnim brojem {maticniBroj} u nasoj bazi.
            </p>
            <Link
              href="/firma"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Pretrazite firme
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const godinaOsnivanja = getGodinaOsnivanja(company.datumOsnivanja);
  const isClaimed = !!company.claimedAt;
  const hasFinancialData = company.prihod != null || company.rashod != null || company.dobitGubitak != null;
  const pageUrl = `https://bzr-savetnik.com/firma/${company.maticniBroj}`;

  const blogPosts = posts.filter(p => p.type === 'blog');
  const offers = posts.filter(p => p.type === 'ponuda');
  const galleryImages = posts.filter(p => p.type === 'galerija');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8 sm:px-8 sm:py-10">
            <div className="flex items-start gap-5">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={`${company.poslovnoIme} logo`}
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-white object-contain p-1 flex-shrink-0"
                />
              ) : (
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-2xl sm:text-3xl font-bold">
                    {company.poslovnoIme.charAt(0)}
                  </span>
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                    {company.poslovnoIme}
                  </h1>
                  {/* Share buttons */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      title="Podeli na LinkedIn"
                    >
                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      title="Podeli na Facebook"
                    >
                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                    <button
                      onClick={handleCopyLink}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      title={linkCopied ? 'Kopirano!' : 'Kopiraj link'}
                    >
                      {linkCopied ? (
                        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-3.318a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364l1.757 1.757" /></svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-green-100">
                  {company.sifraDelatnosti && <span>Delatnost {company.sifraDelatnosti}</span>}
                  {company.opstina && <span>{company.opstina}</span>}
                  {godinaOsnivanja && <span>Od {godinaOsnivanja}.</span>}
                </div>

                {isClaimed && (
                  <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 backdrop-blur rounded-full px-3 py-1 text-xs font-medium text-white">
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    Verifikovana firma
                  </div>
                )}

                {company.status && company.status !== 'Активан' && (
                  <div className="mt-3 inline-flex items-center gap-1.5 bg-red-500/20 backdrop-blur rounded-full px-3 py-1 text-xs font-medium text-red-100">
                    {company.status}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 border-t bg-gray-50/50">
            <StatItem label="Zaposlenih" value={company.brojZaposlenih?.toString() || '-'} />
            <StatItem label="Delatnost" value={company.sifraDelatnosti || '-'} />
            <StatItem label="Opstina" value={company.opstina || '-'} />
            <StatItem label="Osnovana" value={godinaOsnivanja ? `${godinaOsnivanja}.` : '-'} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* O nama */}
            <section className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">O nama</h2>
              <p className="text-gray-600 leading-relaxed">
                {company.kratakOpis || (
                  `${company.poslovnoIme} je ${company.pravnaForma || 'privredno drustvo'} ` +
                  `registrovano u Agenciji za privredne registre` +
                  (company.opstina ? `, sa sedistem u opstini ${company.opstina}` : '') +
                  (company.sifraDelatnosti ? `. Sifra pretezne delatnosti: ${company.sifraDelatnosti}` : '') +
                  `.`
                )}
              </p>

              {company.usluge && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Usluge i delatnosti</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{company.usluge}</p>
                </div>
              )}
            </section>

            {/* Blog postovi */}
            {blogPosts.length > 0 && (
              <section className="bg-white rounded-xl border shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Blog</h2>
                <div className="space-y-4">
                  {blogPosts.map((post) => (
                    <article key={post.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                      {post.imageUrl && (
                        <img src={post.imageUrl} alt={post.title || ''} className="w-full h-48 object-cover rounded-lg mb-3" />
                      )}
                      {post.title && (
                        <h3 className="font-medium text-gray-900">{post.title}</h3>
                      )}
                      {post.content && (
                        <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{post.content}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(post.createdAt).toLocaleDateString('sr-Latn', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Ponude */}
            {offers.length > 0 && (
              <section className="bg-white rounded-xl border shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ponude</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {offers.map((post) => (
                    <div key={post.id} className="rounded-lg border p-4 hover:shadow-sm transition-shadow">
                      {post.imageUrl && (
                        <img src={post.imageUrl} alt={post.title || ''} className="w-full h-32 object-cover rounded-md mb-3" />
                      )}
                      {post.title && (
                        <h3 className="font-medium text-gray-900 text-sm">{post.title}</h3>
                      )}
                      {post.content && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-3">{post.content}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Galerija */}
            {galleryImages.length > 0 && (
              <section className="bg-white rounded-xl border shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Galerija</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {galleryImages.map((post) => (
                    post.imageUrl && (
                      <button
                        key={post.id}
                        onClick={() => setGalleryLightbox(post.imageUrl)}
                        className="aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                      >
                        <img
                          src={post.imageUrl}
                          alt={post.title || ''}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    )
                  ))}
                </div>
              </section>
            )}

            {/* Finansijski podaci (CompanyWall) */}
            {hasFinancialData && (
              <section className="bg-white rounded-xl border shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Finansijski podaci</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                  {company.prihod != null && (
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <p className="text-xs text-gray-500 mb-1">Prihod</p>
                      <p className="text-lg font-bold text-green-700">{formatShortRsd(company.prihod)}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{formatRsd(company.prihod)}</p>
                    </div>
                  )}
                  {company.rashod != null && (
                    <div className="bg-red-50 rounded-lg p-4 text-center">
                      <p className="text-xs text-gray-500 mb-1">Rashod</p>
                      <p className="text-lg font-bold text-red-700">{formatShortRsd(company.rashod)}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{formatRsd(company.rashod)}</p>
                    </div>
                  )}
                  {company.dobitGubitak != null && (
                    <div className={`${company.dobitGubitak >= 0 ? 'bg-blue-50' : 'bg-orange-50'} rounded-lg p-4 text-center`}>
                      <p className="text-xs text-gray-500 mb-1">{company.dobitGubitak >= 0 ? 'Dobit' : 'Gubitak'}</p>
                      <p className={`text-lg font-bold ${company.dobitGubitak >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                        {formatShortRsd(company.dobitGubitak)}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{formatRsd(company.dobitGubitak)}</p>
                    </div>
                  )}
                </div>
                {company.kapital != null && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Kapital:</span> {formatRsd(company.kapital)}
                  </p>
                )}
                <p className="text-[11px] text-gray-400 mt-3">
                  Izvor: {company.companyWallUrl ? (
                    <a href={company.companyWallUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      CompanyWall.rs
                    </a>
                  ) : 'CompanyWall.rs'}
                </p>
              </section>
            )}

            {/* Osnovni podaci */}
            <section className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Osnovni podaci</h2>
              <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                <DataRow label="Maticni broj" value={company.maticniBroj} mono />
                {company.pib && <DataRow label="PIB" value={company.pib} mono />}
                <DataRow label="Pravna forma" value={company.pravnaForma} />
                <DataRow label="Sifra delatnosti" value={company.sifraDelatnosti} />
                <DataRow label="Opstina" value={company.opstina} />
                <DataRow label="Datum osnivanja" value={company.datumOsnivanja} />
                <DataRow label="Status" value={company.status} />
                <DataRow label="Broj zaposlenih" value={company.brojZaposlenih?.toString()} />
                {company.grad && <DataRow label="Grad" value={company.grad} />}
              </dl>
            </section>

            {/* BZR Status */}
            <section className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">BZR Status</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                <StatusBadge active={!!company.registrovan} label={company.registrovan ? 'Registrovan na platformi' : 'Nije registrovan'} />
                <StatusBadge active={!!company.pretplataAktivna} label={company.pretplataAktivna ? 'Aktivna pretplata' : 'Nema pretplatu'} />
                {company.bzrAgencijaNaziv && <StatusBadge active label={`Agencija: ${company.bzrAgencijaNaziv}`} />}
              </div>
              {!company.registrovan && (
                <p className="text-sm text-gray-500">Ova firma jos nije aktivirala svoj profil na BZR Savetnik platformi.</p>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Kontakt */}
            <section className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Kontakt</h2>
              <div className="space-y-3 text-sm">
                {company.adresa && <ContactItem icon="map" label="Adresa" value={company.adresa} />}
                {company.telefon && <ContactItem icon="phone" label="Telefon" value={company.telefon} href={`tel:${company.telefon}`} />}
                {company.email && <ContactItem icon="mail" label="Email" value={company.email} href={`mailto:${company.email}`} />}
                {company.webSajt && (
                  <ContactItem
                    icon="globe"
                    label="Web sajt"
                    value={company.webSajt.replace(/^https?:\/\//, '')}
                    href={company.webSajt.startsWith('http') ? company.webSajt : `https://${company.webSajt}`}
                    external
                  />
                )}
                {!company.adresa && !company.telefon && !company.email && !company.webSajt && (
                  <p className="text-gray-400 italic">Kontakt podaci nisu dostupni</p>
                )}
              </div>
            </section>

            {/* CTA Card - Agency Onboard or Standard CTA */}
            {isAgency && !company.bzrAgencijaNaziv ? (
              <section className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 shadow-sm p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                  </svg>
                </div>
                {onboardSuccess ? (
                  <>
                    <h3 className="font-semibold text-green-900 mb-1">Klijent preuzet!</h3>
                    <p className="text-sm text-green-700">{company.poslovnoIme} je dodat kao vas klijent.</p>
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold text-indigo-900 mb-1">Preuzmite kao klijenta</h3>
                    <p className="text-sm text-indigo-700 mb-4">Dodajte ovu firmu kao klijenta vase agencije</p>
                    <button
                      onClick={handleAgencyOnboard}
                      disabled={onboarding}
                      className="block w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {onboarding ? 'Preuzimanje...' : 'Preuzmi kao klijenta'}
                    </button>
                  </>
                )}
              </section>
            ) : !company.registrovan ? (
              <section className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-green-900 mb-1">Ovo je vasa firma?</h3>
                <p className="text-sm text-green-700 mb-4">Aktivirajte besplatnu web stranicu i upravljajte vasim profilom</p>
                <Link
                  href={`/registracija?ref=firma&mb=${company.maticniBroj}`}
                  className="block w-full px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Aktivirajte besplatno
                </Link>
                <p className="text-xs text-green-600 mt-2">Bez kreditne kartice</p>
              </section>
            ) : (
              <section className="bg-blue-50 rounded-xl border border-blue-200 shadow-sm p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-semibold text-blue-900 mb-1">Verifikovana firma</h3>
                <p className="text-sm text-blue-700 mb-3">Ova firma koristi BZR Savetnik platformu</p>
                <Link
                  href="/prijava"
                  className="inline-block px-4 py-2 border border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  Prijavite se kao vlasnik
                </Link>
              </section>
            )}

            {/* BZR Savetnik promo */}
            <section className="bg-white rounded-xl border shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">BZR Savetnik Platforma</h3>
              <ul className="space-y-2 text-xs text-gray-600">
                {['Akt o proceni rizika', 'Evidencije 1-11 iz oblasti BZR', 'Povezivanje sa BZR agencijama', 'Direktorijum 136.000+ firmi'].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <svg className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/registracija"
                className="block w-full mt-4 text-center px-4 py-2 border border-green-600 text-green-600 rounded-lg text-xs font-medium hover:bg-green-50 transition-colors"
              >
                Saznajte vise
              </Link>
            </section>
          </div>
        </div>
      </main>

      {/* Gallery lightbox */}
      {galleryLightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setGalleryLightbox(null)}
        >
          <button
            onClick={() => setGalleryLightbox(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={galleryLightbox}
            alt=""
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Footer */}
      <footer className="border-t bg-white mt-12">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="BZR Savetnik" className="h-10 w-10 object-contain" />
              <span className="text-sm text-gray-600">
                Powered by <Link href="/" className="text-green-600 hover:underline font-medium">BZR Savetnik</Link>
              </span>
            </div>
            <p className="text-xs text-gray-400">Podaci iz Agencije za privredne registre (APR) i CompanyWall.rs</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ============ Helper Components ============ */

function Header() {
  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="BZR Savetnik" className="h-14 w-14 object-contain" />
          <span className="font-bold text-gray-900">Savetnik</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/firma" className="text-sm text-gray-600 hover:text-gray-900">Direktorijum firmi</Link>
          <Link href="/registracija" className="text-sm font-medium text-white bg-green-600 px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
            Registrujte se
          </Link>
        </div>
      </div>
    </header>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3 text-center">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-sm font-semibold text-gray-900 mt-0.5">{value}</dd>
    </div>
  );
}

function DataRow({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-gray-500 text-xs">{label}</dt>
      <dd className={`text-gray-900 font-medium ${mono ? 'font-mono' : ''}`}>{value || '-'}</dd>
    </div>
  );
}

function StatusBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
      active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-green-500' : 'bg-gray-400'}`} />
      {label}
    </span>
  );
}

function ContactItem({ icon, label, value, href, external }: {
  icon: 'map' | 'phone' | 'mail' | 'globe';
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}) {
  const iconSvg = {
    map: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>,
    phone: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>,
    mail: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>,
    globe: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>,
  };

  return (
    <div className="flex items-start gap-3">
      <div className="text-gray-400 mt-0.5 flex-shrink-0">{iconSvg[icon]}</div>
      <div className="min-w-0">
        <p className="text-gray-500 text-xs">{label}</p>
        {href ? (
          <a href={href} className="text-green-600 hover:underline break-all" {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
            {value}
          </a>
        ) : (
          <p className="text-gray-900 break-all">{value}</p>
        )}
      </div>
    </div>
  );
}
