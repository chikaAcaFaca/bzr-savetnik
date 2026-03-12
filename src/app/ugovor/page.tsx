'use client';

/**
 * Electronic Contract Acceptance Page
 *
 * Full-text of service agreement (Ugovor o koriscenju BZR Savetnik platforme).
 * Company must accept this before making their first payment.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const CONTRACT_VERSION = '1.0';

interface ContractStatus {
  accepted: boolean;
  acceptedAt: string | null;
  contractVersion: string | null;
  companyName: string;
  companyPib: string;
  companyAddress: string;
  companyCity: string | null;
}

export default function ContractPage() {
  const router = useRouter();
  const [status, setStatus] = useState<ContractStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContractStatus();
  }, []);

  async function fetchContractStatus() {
    try {
      const token = localStorage.getItem('bzr_token');
      if (!token) {
        router.push('/prijava?redirect=/ugovor');
        return;
      }

      const res = await fetch(
        `${API_URL}/trpc/billing.contractStatus`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/prijava?redirect=/ugovor');
          return;
        }
        throw new Error('Greska pri ucitavanju');
      }

      const data = await res.json();
      const contractData = data?.result?.data?.json;
      if (contractData) {
        setStatus(contractData);
      }
    } catch (err) {
      setError('Ne mozemo da ucitamo podatke o ugovoru. Pokusajte ponovo.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept() {
    if (!accepted) {
      setError('Morate prihvatiti uslove ugovora');
      return;
    }

    setAccepting(true);
    setError(null);

    try {
      const token = localStorage.getItem('bzr_token');
      const res = await fetch(`${API_URL}/trpc/billing.acceptContract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          json: { contractVersion: CONTRACT_VERSION, accepted: true },
        }),
      });

      const data = await res.json();
      if (data?.result?.data?.json?.success) {
        // Redirect to subscription/payment page
        router.push('/pretplata');
      } else {
        const errorMsg = data?.error?.json?.message || 'Greska pri prihvatanju ugovora';
        setError(errorMsg);
      }
    } catch {
      setError('Greska pri prihvatanju ugovora. Pokusajte ponovo.');
    } finally {
      setAccepting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-r-transparent" />
          <p className="text-gray-500 mt-3">Ucitavanje ugovora...</p>
        </div>
      </div>
    );
  }

  // Already accepted
  if (status?.accepted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-xl border shadow-sm p-8">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Ugovor je vec prihvacen</h1>
            <p className="text-gray-600 mb-1">Verzija ugovora: {status.contractVersion}</p>
            <p className="text-gray-500 text-sm mb-6">
              Prihvacen: {status.acceptedAt ? new Date(status.acceptedAt).toLocaleDateString('sr-RS') : '-'}
            </p>
            <Link
              href="/pretplata"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Nastavite na pretplatu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="BZR Savetnik" className="h-8 w-8 object-contain" />
            <span className="font-bold text-gray-900">Savetnik</span>
          </Link>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-600">Ugovor o koriscenju</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6 text-center">
            <h1 className="text-xl font-bold text-white">Ugovor o koriscenju BZR Savetnik platforme</h1>
            <p className="text-green-100 text-sm mt-1">Verzija {CONTRACT_VERSION} | Datum: {today}</p>
          </div>

          {/* Company info */}
          {status && (
            <div className="bg-gray-50 border-b px-8 py-4">
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Firma:</span>{' '}
                  <strong>{status.companyName}</strong>
                </div>
                <div>
                  <span className="text-gray-500">PIB:</span>{' '}
                  <strong className="font-mono">{status.companyPib}</strong>
                </div>
                <div>
                  <span className="text-gray-500">Adresa:</span>{' '}
                  <strong>{status.companyAddress}</strong>
                </div>
                {status.companyCity && (
                  <div>
                    <span className="text-gray-500">Grad:</span>{' '}
                    <strong>{status.companyCity}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contract text */}
          <div className="px-8 py-6 prose prose-sm max-w-none text-gray-700">
            <h2 className="text-base font-bold text-gray-900">1. Predmet ugovora</h2>
            <p>
              Ovim ugovorom se uredjuju uslovi koriscenja BZR Savetnik platforme (u daljem tekstu: Platforma)
              koju pruza NKNet Consulting DOO, Karadjordeva 18a, 26101 Pancevo, PIB: 115190346, MB: 22125338
              (u daljem tekstu: Pruzalac usluge).
            </p>
            <p>
              Platforma omogucava elektronsko vodjenje dokumentacije iz oblasti bezbednosti i zdravlja na radu (BZR),
              ukljucujuci ali ne ogranicavajuci se na: Akt o proceni rizika, evidencije prema Pravilniku o evidencijama
              u oblasti BZR (2025), povezivanje sa BZR agencijama, i druge funkcionalnosti.
            </p>

            <h2 className="text-base font-bold text-gray-900">2. Uslovi koriscenja</h2>
            <p>
              Korisnik se obavezuje da ce Platformu koristiti u skladu sa zakonima Republike Srbije i ovim ugovorom.
              Korisnik je odgovoran za tacnost podataka koje unosi na Platformu.
            </p>

            <h2 className="text-base font-bold text-gray-900">3. Cene i placanje</h2>
            <p>
              Mesecna pretplata se obracunava prema broju zaposlenih u firmi Korisnika, u skladu sa
              cenovnikom koji je dostupan na stranici /cene.
            </p>
            <p>
              <strong>Godisnja pretplata:</strong> Korisnik koji odabere godisnje placanje placa 10 mesecnih
              pretplata i koristi Platformu 12 meseci (2 meseca besplatno).
            </p>
            <p>
              Placanje se vrsi uplatom na racun Pruzaoca usluge ili putem IPS QR koda. Faktura se izdaje
              elektronskim putem na email adresu Korisnika.
            </p>

            <h2 className="text-base font-bold text-gray-900">4. Probni period</h2>
            <p>
              Korisnik ima pravo na besplatan probni period od 30 dana od dana registracije.
              Tokom probnog perioda dostupne su sve funkcionalnosti Platforme.
              Nakon isteka probnog perioda, Korisnik moze nastaviti koriscenje uz aktivnu pretplatu.
            </p>

            <h2 className="text-base font-bold text-gray-900">5. Zastita podataka</h2>
            <p>
              Pruzalac usluge se obavezuje da ce podatke Korisnika obradjivati u skladu sa Zakonom o
              zastiti podataka o licnosti Republike Srbije. Podaci se cuvaju na serverima u EU
              (PostgreSQL baza na Supabase/Neon) i ne dele se sa trecim stranama bez saglasnosti Korisnika.
            </p>

            <h2 className="text-base font-bold text-gray-900">6. Raskid ugovora</h2>
            <p>
              Korisnik moze raskinuti ovaj ugovor u svakom trenutku otkazivanjem pretplate.
              Pristup Platformi ce biti aktivan do kraja placenog perioda.
              Pruzalac usluge zadrzava pravo da raskine ugovor u slucaju krsenja uslova koriscenja.
            </p>

            <h2 className="text-base font-bold text-gray-900">7. Ogranicenje odgovornosti</h2>
            <p>
              Platforma sluzi kao alat za vodjenje BZR dokumentacije i ne zamenjuje strucni savet
              licenciranog BZR savetnika. Pruzalac usluge ne odgovara za odluke donete na osnovu
              podataka generisanih putem Platforme.
            </p>

            <h2 className="text-base font-bold text-gray-900">8. Zavrsne odredbe</h2>
            <p>
              Ovaj ugovor stupa na snagu danom elektronskog prihvatanja od strane Korisnika.
              Za sve sto nije regulisano ovim ugovorom primenjuju se pozitivni propisi Republike Srbije.
              Za resavanje sporova nadlezan je sud u Pancevu.
            </p>
          </div>

          {/* Accept section */}
          <div className="border-t bg-gray-50 px-8 py-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">
                Procitao/la sam i prihvatam uslove Ugovora o koriscenju BZR Savetnik platforme
                (verzija {CONTRACT_VERSION}).
              </span>
            </label>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={handleAccept}
                disabled={!accepted || accepting}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {accepting ? 'Prihvatanje...' : 'Prihvatam ugovor'}
              </button>
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Odustani
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
