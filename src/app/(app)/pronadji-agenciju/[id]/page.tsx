'use client';

/**
 * Agency Detail Page
 *
 * Full public profile of a BZR agency with contact info,
 * description, specializations, and messaging button.
 */

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Shield,
  MessageSquare,
  Handshake,
  Loader2,
  Building2,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function AgencyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { data: agency, isLoading, error } = (trpc as any).agencies.getPublicProfile.useQuery(
    { id },
    { enabled: !isNaN(id) }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !agency) {
    return (
      <div className="text-center py-16">
        <Building2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
        <p className="text-lg font-medium">Agencija nije pronadjena</p>
        <Link href="/app/pronadji-agenciju" className="text-sm text-primary hover:underline mt-2 inline-block">
          Nazad na pretragu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Nazad
      </button>

      {/* Agency Header */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-start gap-4">
          {agency.logoUrl ? (
            <img
              src={agency.logoUrl}
              alt={agency.name}
              className="h-16 w-16 rounded-lg object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{agency.name}</h1>
            {agency.city && (
              <p className="text-muted-foreground flex items-center gap-1.5 mt-1">
                <MapPin className="h-4 w-4" />
                {agency.address ? `${agency.address}, ${agency.city}` : agency.city}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2">
              {agency.rating && (
                <span className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  {agency.rating}
                  {agency.reviewCount > 0 && (
                    <span className="text-muted-foreground">({agency.reviewCount} recenzija)</span>
                  )}
                </span>
              )}
              {agency.licenseNumber && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  Licenca: {agency.licenseNumber}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Link
            href={`/app/poruke?newThread=true&agencyId=${agency.id}&agencyName=${encodeURIComponent(agency.name)}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            Posaljite poruku
          </Link>
          <Link
            href={`/app/poruke?newThread=true&agencyId=${agency.id}&agencyName=${encodeURIComponent(agency.name)}&subject=${encodeURIComponent('Zahtev za saradnju')}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border text-sm font-medium hover:bg-muted transition-colors"
          >
            <Handshake className="h-4 w-4" />
            Zatrazite saradnju
          </Link>
        </div>
      </div>

      {/* Description */}
      {agency.description && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="font-semibold mb-3">O agenciji</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{agency.description}</p>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Contact Info */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="font-semibold mb-3">Kontakt informacije</h2>
          <div className="space-y-3 text-sm">
            {agency.phone && (
              <a href={`tel:${agency.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <Phone className="h-4 w-4" />
                {agency.phone}
              </a>
            )}
            {agency.email && (
              <a href={`mailto:${agency.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <Mail className="h-4 w-4" />
                {agency.email}
              </a>
            )}
            {agency.website && (
              <a href={agency.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <Globe className="h-4 w-4" />
                {agency.website}
              </a>
            )}
          </div>
        </div>

        {/* Specializations */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="font-semibold mb-3">Specijalizacije</h2>
          {agency.specializations ? (
            <div className="flex flex-wrap gap-2">
              {agency.specializations.split(',').map((spec: string, i: number) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs"
                >
                  {spec.trim()}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nije navedeno</p>
          )}

          {agency.coverageArea && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-1">Podrucje pokrivanja</h3>
              <p className="text-sm text-muted-foreground">{agency.coverageArea}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
