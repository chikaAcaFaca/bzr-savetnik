'use client';

import { useState } from 'react';
import Link from 'next/link';

// Prijave idu u NKNET CRM (segment BZR), gde ih operateri odmah zovu.
const CRM_URL = 'https://nknet-consulting.com/crm/api.php?a=lead_in';

export function PrijavaForma() {
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const data = Object.fromEntries(new FormData(e.currentTarget));
    if (!data.telefon && !data.email) {
      setError('Upisite telefon ili email, da bismo vas kontaktirali.');
      return;
    }
    setState('sending');
    try {
      const params = new URLSearchParams(window.location.search);
      const res = await fetch(CRM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ ...data, saglasnost: data.saglasnost === 'on', izvor: params.get('utm_source') || document.referrer || '' }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Slanje nije uspelo.');
      setState('done');
    } catch (err) {
      setState('idle');
      setError(err instanceof Error ? err.message : 'Slanje nije uspelo. Pozovite nas na 064 125 86 86.');
    }
  }

  if (state === 'done') {
    return (
      <div className="rounded-lg border-2 border-green-500 bg-green-50 p-8 text-center">
        <h3 className="text-xl font-bold text-green-700">Hvala, prijava je primljena</h3>
        <p className="mt-2 text-muted-foreground">
          Javljamo vam se u toku radnog dana. Ako zelite odmah da pocnete, registrujte firmu i koristite platformu mesec dana besplatno.
        </p>
        <Link
          href="/registracija?ref=akcija"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 mt-5 text-base font-medium text-primary-foreground shadow hover:bg-primary/90"
        >
          Registrujte firmu besplatno
        </Link>
      </div>
    );
  }

  const input = 'mt-1 block w-full rounded-md border border-input bg-background px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-ring';
  return (
    <form onSubmit={onSubmit} className="rounded-lg border bg-card p-6 sm:p-8 shadow-sm space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block text-sm font-medium sm:col-span-2">
          Naziv firme *
          <input name="firma" required maxLength={120} className={input} autoComplete="organization" />
        </label>
        <label className="block text-sm font-medium">
          Ime i prezime
          <input name="ime" maxLength={120} className={input} autoComplete="name" />
        </label>
        <label className="block text-sm font-medium">
          Broj zaposlenih
          <input name="zaposleni" type="number" min={1} max={500} inputMode="numeric" className={input} />
        </label>
        <label className="block text-sm font-medium">
          Mobilni telefon
          <input name="telefon" type="tel" maxLength={40} className={input} autoComplete="tel" placeholder="06x xxx xxxx" />
        </label>
        <label className="block text-sm font-medium">
          Email
          <input name="email" type="email" maxLength={120} className={input} autoComplete="email" />
        </label>
        <label className="block text-sm font-medium">
          Grad
          <input name="grad" maxLength={80} className={input} autoComplete="address-level2" />
        </label>
        <label className="block text-sm font-medium">
          PIB (nije obavezno)
          <input name="pib" inputMode="numeric" maxLength={9} className={input} />
        </label>
      </div>
      <fieldset className="text-sm">
        <legend className="font-medium">Posle besplatnog meseca vise mi odgovara</legend>
        <div className="mt-2 flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2"><input type="radio" name="plan" value="mesecno" defaultChecked /> 990 RSD mesecno</label>
          <label className="inline-flex items-center gap-2"><input type="radio" name="plan" value="godisnje" /> 8.990 RSD godisnje</label>
        </div>
      </fieldset>
      <label className="block text-sm font-medium">
        Poruka (nije obavezno)
        <textarea name="poruka" rows={3} maxLength={500} className={input} placeholder="Npr. imamo agenciju, ugovor istice u decembru" />
      </label>
      {/* zamka za botove */}
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <label className="flex items-start gap-2 text-sm text-muted-foreground">
        <input type="checkbox" name="saglasnost" required className="mt-1" />
        <span>Saglasan sam da me BZR Savetnik (NKNet Consulting DOO) kontaktira telefonom ili emailom u vezi sa ovom ponudom. Podatke ne prodajemo i ne delimo sa trecim licima.</span>
      </label>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={state === 'sending'}
        className="w-full inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-60"
      >
        {state === 'sending' ? 'Saljem...' : 'Zelim besplatan prvi mesec'}
      </button>
    </form>
  );
}
