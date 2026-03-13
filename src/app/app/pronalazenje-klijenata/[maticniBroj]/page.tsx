'use client';

/**
 * Company Detail Page (Lead Finder)
 *
 * Agency views a company's details from the directory.
 * Triggers APR enrichment on first view. "Posalji ponudu" button links to messaging.
 */

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Calendar,
  FileText,
  MessageSquare,
  Loader2,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const maticniBroj = params.maticniBroj as string;

  const { data: company, isLoading, error } = (trpc as any).companyDirectory.getByMaticniBroj.useQuery(
    { maticniBroj },
    { enabled: !!maticniBroj }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="text-center py-16">
        <Building2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
        <p className="text-lg font-medium">Firma nije pronadjena</p>
        <Link href="/app/pronalazenje-klijenata" className="text-sm text-primary hover:underline mt-2 inline-block">
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

      {/* Company Header */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{company.poslovnoIme}</h1>
            <p className="text-muted-foreground mt-1 font-mono text-sm">MB: {company.maticniBroj}</p>
          </div>
          <Link
            href={`/firma/${company.maticniBroj}`}
            target="_blank"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-3 w-3" />
            Javni profil
          </Link>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap gap-2 mt-3">
          {company.registrovan && (
            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Registrovan na platformi</span>
          )}
          {company.pretplataAktivna && (
            <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Aktivna pretplata</span>
          )}
          {company.bzrAgencijaNaziv ? (
            <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
              Agencija: {company.bzrAgencijaNaziv}
            </span>
          ) : company.pretplataAktivna ? (
            <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800 font-medium">
              Nema agenciju - Vruc lid!
            </span>
          ) : null}
          {company.status && (
            <span className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">{company.status}</span>
          )}
        </div>

        {/* Action buttons */}
        {company.registrovan && (
          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t">
            <Link
              href={`/app/poruke?newThread=true&companyId=${company.id}&companyName=${encodeURIComponent(company.poslovnoIme)}&subject=${encodeURIComponent('Ponuda za BZR saradnju')}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Posaljite ponudu
            </Link>
          </div>
        )}
      </div>

      {/* Company Info Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Basic Info */}
        <div className="rounded-lg border bg-card p-6 space-y-3">
          <h2 className="font-semibold">Osnovni podaci</h2>
          <InfoRow icon={Building2} label="Pravna forma" value={company.pravnaForma} />
          <InfoRow icon={FileText} label="Sifra delatnosti" value={company.sifraDelatnosti} />
          <InfoRow icon={MapPin} label="Opstina" value={company.opstina} />
          <InfoRow icon={Calendar} label="Datum osnivanja" value={company.datumOsnivanja} />
          <InfoRow icon={Users} label="Broj zaposlenih" value={company.brojZaposlenih?.toString()} />
        </div>

        {/* Contact Info (enriched) */}
        <div className="rounded-lg border bg-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Kontakt podaci</h2>
            {company.enrichedAt && (
              <span className="text-xs text-muted-foreground">
                Azurirano: {new Date(company.enrichedAt).toLocaleDateString('sr-RS')}
              </span>
            )}
          </div>
          <InfoRow icon={MapPin} label="Adresa" value={company.adresa} />
          <InfoRow icon={Phone} label="Telefon" value={company.telefon} />
          <InfoRow icon={Mail} label="Email" value={company.email} />
          <InfoRow icon={Globe} label="Web sajt" value={company.webSajt} />
          <InfoRow icon={Users} label="Vlasnik" value={
            company.imeVlasnika
              ? `${company.imeVlasnika} ${company.prezimeVlasnika || ''}`
              : company.kontaktOsoba
          } />
          {!company.enrichedAt && (
            <p className="text-xs text-muted-foreground italic mt-2">
              Kontakt podaci se ucitavaju iz APR registra...
            </p>
          )}
        </div>
      </div>

      {/* Notes */}
      {company.napomena && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="font-semibold mb-2">Napomena</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{company.napomena}</p>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div>
        <span className="text-muted-foreground">{label}: </span>
        <span className={value ? 'font-medium' : 'text-muted-foreground'}>{value || '-'}</span>
      </div>
    </div>
  );
}
