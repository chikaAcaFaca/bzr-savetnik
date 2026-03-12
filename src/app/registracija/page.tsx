'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, Shield, CheckCircle2, Loader2 } from 'lucide-react';
import { refreshCachedToken } from '@/lib/trpc';

type UserTypeChoice = null | 'company' | 'agency';
type Step = 'choose' | 'account' | 'details';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface InviteCompanyData {
  poslovnoIme: string;
  maticniBroj: string;
  brojZaposlenih: number | null;
  opstina: string | null;
}

interface PibLookupResult {
  found: boolean;
  source?: 'directory' | 'registered';
  alreadyRegistered?: boolean;
  poslovnoIme?: string;
  maticniBroj?: string;
  opstina?: string | null;
  grad?: string | null;
  brojZaposlenih?: number | null;
  sifraDelatnosti?: string | null;
  adresa?: string | null;
  pravnaForma?: string | null;
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center mx-auto">
            <span className="text-primary-foreground font-bold">BZR</span>
          </div>
          <p className="text-muted-foreground mt-4">Ucitavanje...</p>
        </div>
      </div>
    }>
      <RegisterPageInner />
    </Suspense>
  );
}

function RegisterPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userTypeChoice, setUserTypeChoice] = useState<UserTypeChoice>(null);
  const [step, setStep] = useState<Step>('choose');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  // Company fields
  const [companyName, setCompanyName] = useState('');
  const [companyPib, setCompanyPib] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');
  const [tekuciRacun, setTekuciRacun] = useState('');
  // PIB auto-lookup
  const [pibLookupResult, setPibLookupResult] = useState<PibLookupResult | null>(null);
  const [pibLookupLoading, setPibLookupLoading] = useState(false);
  const pibLookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Agency fields
  const [agencyName, setAgencyName] = useState('');
  const [agencyPib, setAgencyPib] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  // Invite pre-population
  const [inviteData, setInviteData] = useState<InviteCompanyData | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);

  // Check for invite link params: ?ref=firma&mb={maticniBroj}
  const refParam = searchParams.get('ref');
  const mbParam = searchParams.get('mb');

  useEffect(() => {
    if (refParam === 'firma' && mbParam) {
      setInviteLoading(true);
      // Auto-select company type and skip to account step
      setUserTypeChoice('company');
      setStep('account');

      // Fetch company data from directory
      fetch(
        `${API_URL}/trpc/companyDirectory.getPublicProfile?input=${encodeURIComponent(JSON.stringify({ json: { maticniBroj: mbParam } }))}`
      )
        .then((res) => res.json())
        .then((data) => {
          const company = data?.result?.data?.json;
          if (company) {
            setInviteData({
              poslovnoIme: company.poslovnoIme,
              maticniBroj: company.maticniBroj,
              brojZaposlenih: company.brojZaposlenih,
              opstina: company.opstina,
            });
            setCompanyName(company.poslovnoIme);
            if (company.brojZaposlenih) {
              setEmployeeCount(company.brojZaposlenih.toString());
            }
          }
        })
        .catch(() => {
          // Ignore fetch errors, user can still register manually
        })
        .finally(() => setInviteLoading(false));
    }
  }, [refParam, mbParam]);

  // PIB auto-lookup with debounce
  const lookupPib = useCallback(async (pib: string) => {
    if (!/^[0-9]{9}$/.test(pib)) {
      setPibLookupResult(null);
      return;
    }

    setPibLookupLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/trpc/companyDirectory.lookupByPib?input=${encodeURIComponent(JSON.stringify({ json: { pib } }))}`
      );
      const data = await res.json();
      const result = data?.result?.data?.json as PibLookupResult | undefined;

      if (result) {
        setPibLookupResult(result);

        // Auto-populate fields if found in directory
        if (result.found && result.source === 'directory' && !result.alreadyRegistered) {
          if (result.poslovnoIme) setCompanyName(result.poslovnoIme);
          if (result.brojZaposlenih) setEmployeeCount(result.brojZaposlenih.toString());
        }

        // Clear error if lookup succeeded (inline message handles alreadyRegistered)
        setError('');
      }
    } catch {
      // Silently fail - user can still proceed manually
    } finally {
      setPibLookupLoading(false);
    }
  }, []);

  const handlePibChange = (value: string) => {
    // Only allow digits
    const cleaned = value.replace(/\D/g, '').slice(0, 9);
    setCompanyPib(cleaned);
    setPibLookupResult(null);
    setError('');

    // Debounce lookup
    if (pibLookupTimer.current) clearTimeout(pibLookupTimer.current);
    if (cleaned.length === 9) {
      pibLookupTimer.current = setTimeout(() => lookupPib(cleaned), 300);
    }
  };

  const handleChooseType = (type: UserTypeChoice) => {
    setUserTypeChoice(type);
    setStep('account');
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Lozinka mora imati najmanje 8 karaktera');
      return;
    }

    // For company flow: validate PIB before proceeding
    if (userTypeChoice === 'company' && companyPib.length !== 9) {
      setError('PIB mora imati tacno 9 cifara');
      return;
    }

    if (userTypeChoice === 'company' && pibLookupResult?.alreadyRegistered) {
      setError('Firma sa ovim PIB-om je vec registrovana. Prijavite se sa postojecim nalogom.');
      return;
    }

    setStep('details');
  };

  const handleGoogleRegister = async () => {
    setError('');
    setLoading(true);

    try {
      const { loginWithGoogle } = await import('@/lib/firebase');
      const user = await loginWithGoogle();
      setEmail(user.email || '');
      setFullName(user.displayName || '');
      setIsGoogleUser(true);
      setStep('details');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greska pri Google registraciji');
    } finally {
      setLoading(false);
    }
  };

  async function registerCompanyOnBackend(userEmail: string): Promise<{ profileClaimed?: boolean }> {
    const token = await refreshCachedToken();
    if (!token) throw new Error('Firebase token nije dostupan');

    const response = await fetch(
      `${API_URL}/trpc/companies.registerSelf`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          json: {
            name: companyName,
            pib: companyPib,
            employeeCount: parseInt(employeeCount) || 1,
            email: userEmail,
            fullName,
            tekuciRacun: tekuciRacun || undefined,
          },
        }),
      }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      const message =
        data?.error?.json?.message ||
        data?.error?.message ||
        'Greska pri registraciji firme';
      throw new Error(message);
    }

    const data = await response.json().catch(() => null);
    return {
      profileClaimed: data?.result?.data?.json?.profileClaimed ?? false,
    };
  }

  async function registerAgencyOnBackend(userEmail: string) {
    const token = await refreshCachedToken();
    if (!token) throw new Error('Firebase token nije dostupan');

    const response = await fetch(
      `${API_URL}/trpc/agencies.register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          json: {
            agencyName,
            pib: agencyPib,
            fullName,
            email: userEmail,
          },
        }),
      }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      const message =
        data?.error?.json?.message ||
        data?.error?.message ||
        'Greska pri registraciji agencije';
      throw new Error(message);
    }
  }

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let userEmail = email;

      // If not a Google user, create Firebase account first
      if (!isGoogleUser) {
        const { registerWithEmail } = await import('@/lib/firebase');
        const user = await registerWithEmail(email, password);
        userEmail = user.email || email;
      }

      // Register on backend based on user type
      if (userTypeChoice === 'company') {
        const result = await registerCompanyOnBackend(userEmail);
        localStorage.setItem('bzr_user_type', 'company');

        // Redirect based on whether profile was auto-claimed
        if (result.profileClaimed) {
          router.push('/app/moja-stranica');
        } else {
          router.push('/app/dashboard');
        }
      } else {
        await registerAgencyOnBackend(userEmail);
        localStorage.setItem('bzr_user_type', 'agency');
        router.push('/app/dashboard');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Greska pri registraciji';
      // Translate Firebase error codes to Serbian
      if (msg.includes('auth/email-already-in-use')) {
        setError('Nalog sa ovom email adresom vec postoji. Prijavite se na stranici za prijavu.');
      } else if (msg.includes('auth/weak-password')) {
        setError('Lozinka je preslaba. Koristite najmanje 8 karaktera.');
      } else if (msg.includes('auth/invalid-email')) {
        setError('Email adresa nije validna.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const isInviteFlow = refParam === 'firma' && mbParam;
  const stepIndex = step === 'choose' ? 0 : step === 'account' ? 1 : 2;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">BZR</span>
            </div>
            <span className="font-bold text-2xl">Savetnik</span>
          </Link>
          {isInviteFlow && inviteData ? (
            <div className="mt-3">
              <p className="text-sm text-muted-foreground">Aktivirajte stranicu za</p>
              <p className="font-semibold text-lg">{inviteData.poslovnoIme}</p>
            </div>
          ) : (
            <p className="text-muted-foreground mt-2">Kreirajte besplatan nalog</p>
          )}
        </div>

        {/* Registration Card */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Invite banner */}
          {isInviteFlow && inviteData && step !== 'choose' && (
            <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200 text-xs text-green-800">
              <strong>Besplatna web stranica</strong> za {inviteData.poslovnoIme}
              {inviteData.opstina && ` (${inviteData.opstina})`}
            </div>
          )}

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {(isInviteFlow ? [0, 1] : [0, 1, 2]).map((i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  i <= (isInviteFlow ? stepIndex - 1 : stepIndex) ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Step 0: Choose user type (skipped for invite flow) */}
          {step === 'choose' && !isInviteFlow && (
            <div className="space-y-4">
              <h3 className="font-semibold text-center">Ko ste vi?</h3>
              <p className="text-sm text-muted-foreground text-center">
                Izaberite tip naloga koji zelite da kreirate
              </p>
              <div className="grid gap-3">
                <button
                  onClick={() => handleChooseType('company')}
                  className="flex items-start gap-4 rounded-lg border p-4 text-left hover:bg-muted hover:border-primary transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Firma / Poslodavac</p>
                    <p className="text-sm text-muted-foreground">
                      Kreirajte besplatnu web stranicu za vasu firmu.
                      Blog, ponude, galerija - zauvek besplatno.
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => handleChooseType('agency')}
                  className="flex items-start gap-4 rounded-lg border p-4 text-left hover:bg-muted hover:border-primary transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">BZR Agencija</p>
                    <p className="text-sm text-muted-foreground">
                      Pruzate usluge bezbednosti i zdravlja na radu.
                      Besplatno, zauvek.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Account creation */}
          {step === 'account' && (
            <>
              {/* Google */}
              <button
                onClick={handleGoogleRegister}
                disabled={loading || inviteLoading}
                className="w-full flex items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Registruj se sa Google nalogom
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">ili</span>
                </div>
              </div>

              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Ime i prezime</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Marko Petrovic"
                    required
                    className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Email adresa</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vas@email.com"
                    required
                    className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Lozinka</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 karaktera"
                    required
                    minLength={8}
                    className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* PIB field moved here for company flow */}
                {userTypeChoice === 'company' && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5">PIB firme</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={companyPib}
                        onChange={(e) => handlePibChange(e.target.value)}
                        placeholder="123456789"
                        required
                        maxLength={9}
                        inputMode="numeric"
                        className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                          pibLookupResult?.alreadyRegistered ? 'border-destructive' : ''
                        } ${pibLookupResult?.found && !pibLookupResult?.alreadyRegistered ? 'border-green-500' : ''}`}
                      />
                      {pibLookupLoading && (
                        <div className="absolute right-3 top-2.5">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                      {pibLookupResult?.found && !pibLookupResult?.alreadyRegistered && (
                        <div className="absolute right-3 top-2.5">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                    </div>

                    {/* PIB lookup success badge */}
                    {pibLookupResult?.found && pibLookupResult.source === 'directory' && !pibLookupResult.alreadyRegistered && (
                      <div className="mt-2 p-2 rounded-md bg-green-50 border border-green-200 text-xs text-green-800">
                        <span className="font-medium">Pronadjeno:</span> {pibLookupResult.poslovnoIme}
                        {pibLookupResult.opstina && ` (${pibLookupResult.grad || pibLookupResult.opstina}`}
                        {pibLookupResult.brojZaposlenih && `, ${pibLookupResult.brojZaposlenih} zaposlenih`}
                        {(pibLookupResult.opstina || pibLookupResult.brojZaposlenih) && ')'}
                      </div>
                    )}

                    {/* Already registered - suggest login */}
                    {pibLookupResult?.alreadyRegistered && (
                      <div className="mt-2 p-2 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-800">
                        <p className="font-medium">Firma sa ovim PIB-om vec postoji na platformi.</p>
                        <p className="mt-1">
                          Ako je ovo vasa firma,{' '}
                          <Link href="/prijava" className="text-primary font-medium hover:underline">
                            prijavite se
                          </Link>{' '}
                          sa nalogom koji ste koristili pri registraciji.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  {!isInviteFlow && (
                    <button
                      type="button"
                      onClick={() => { setStep('choose'); setUserTypeChoice(null); }}
                      className="flex-1 rounded-md border px-4 py-2.5 text-sm font-medium hover:bg-muted"
                    >
                      Nazad
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={pibLookupResult?.alreadyRegistered === true}
                    className={`${isInviteFlow ? 'w-full' : 'flex-1'} rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50`}
                  >
                    Dalje
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Step 2a: Company details */}
          {step === 'details' && userTypeChoice === 'company' && (
            <form onSubmit={handleSubmitDetails} className="space-y-4">
              <h3 className="font-semibold">
                {isInviteFlow ? 'Potvrdite podatke firme' : 'Podaci o vasoj firmi'}
              </h3>
              <p className="text-sm text-muted-foreground">Mozete promeniti ove podatke kasnije u podesavanjima.</p>
              <div>
                <label className="block text-sm font-medium mb-1.5">Naziv firme</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Moja Firma d.o.o."
                  required
                  className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Broj zaposlenih</label>
                <input
                  type="number"
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(e.target.value)}
                  placeholder="5"
                  required
                  min={1}
                  className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Tekuci racun firme</label>
                <input
                  type="text"
                  value={tekuciRacun}
                  onChange={(e) => setTekuciRacun(e.target.value)}
                  placeholder="265-XXXXXXXXXXXXX-XX"
                  pattern="\d{3}-\d{13}-\d{2}"
                  className="w-full rounded-md border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">Format: XXX-XXXXXXXXXXXXX-XX (opciono, potrebno za uplatnice)</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(isGoogleUser ? (isInviteFlow ? 'account' : 'choose') : 'account')}
                  className="flex-1 rounded-md border px-4 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  Nazad
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? 'Kreiranje...' : 'Kreiraj nalog'}
                </button>
              </div>
            </form>
          )}

          {/* Step 2b: Agency details */}
          {step === 'details' && userTypeChoice === 'agency' && (
            <form onSubmit={handleSubmitDetails} className="space-y-4">
              <h3 className="font-semibold">Podaci o vasoj agenciji</h3>
              <p className="text-sm text-muted-foreground">Ove podatke mozete promeniti kasnije.</p>
              <div>
                <label className="block text-sm font-medium mb-1.5">Naziv agencije</label>
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="SafeWork d.o.o."
                  required
                  className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">PIB agencije</label>
                <input
                  type="text"
                  value={agencyPib}
                  onChange={(e) => setAgencyPib(e.target.value)}
                  placeholder="123456789"
                  required
                  maxLength={9}
                  pattern="[0-9]{9}"
                  className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(isGoogleUser ? 'choose' : 'account')}
                  className="flex-1 rounded-md border px-4 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  Nazad
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? 'Kreiranje...' : 'Kreiraj nalog'}
                </button>
              </div>
            </form>
          )}

          {/* Info banner */}
          {userTypeChoice === 'company' && (
            <div className="mt-4 p-3 rounded-md bg-blue-50 border border-blue-200 text-xs text-blue-800">
              <strong>Besplatna web stranica zauvek</strong> - dodajte slike, tekstove, blog postove
              i ponude. BZR dokumentacija dostupna u premium paketu.
            </div>
          )}
          {userTypeChoice === 'agency' && (
            <div className="mt-4 p-3 rounded-md bg-green-50 border border-green-200 text-xs text-green-800">
              <strong>Besplatno zauvek</strong> - BZR agencije koriste platformu bez naknade.
            </div>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Vec imate nalog?{' '}
          <Link href="/prijava" className="text-primary hover:underline font-medium">
            Prijavite se
          </Link>
        </p>
      </div>
    </div>
  );
}
