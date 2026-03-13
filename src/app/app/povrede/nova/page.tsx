'use client';

/**
 * New Injury Report Form
 *
 * Multi-step wizard form with 9 sections matching the official injury report form.
 * Includes AI ESAW coding panel.
 */

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Save, Bot, CheckCircle } from 'lucide-react';
import EsawCodingWidget from '@/components/esaw-coding-widget';

const steps = [
  { id: 1, title: 'Podaci o poslodavcu', description: 'Automatski popunjeno iz profila firme' },
  { id: 2, title: 'Podaci o povredjenom', description: 'Informacije o zaposlenom' },
  { id: 3, title: 'Podaci o povredi', description: 'Datum, vreme, mesto, opis' },
  { id: 4, title: 'ESAW kodiranje', description: 'AI klasifikacija povrede' },
  { id: 5, title: 'Medicinski podaci', description: 'Dijagnoza i posledice' },
  { id: 6, title: 'Svedoci', description: 'Podaci o svedocima' },
  { id: 7, title: 'Mere zastite', description: 'Status mera bezbednosti' },
  { id: 8, title: 'Posledice', description: 'Odsustvo, invalidnost' },
  { id: 9, title: 'Pregled i potpis', description: 'Zavrsavanje izvestaja' },
];

export default function NovaPovredaPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  const updateField = (key: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Naziv poslodavca</label>
              <input
                type="text"
                value={(formData.poslodavacNaziv as string) || ''}
                onChange={(e) => updateField('poslodavacNaziv', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Automatski se popunjava"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">PIB</label>
              <input
                type="text"
                value={(formData.poslodavacPib as string) || ''}
                onChange={(e) => updateField('poslodavacPib', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Maticni broj</label>
              <input
                type="text"
                value={(formData.poslodavacMaticniBroj as string) || ''}
                onChange={(e) => updateField('poslodavacMaticniBroj', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Delatnost</label>
              <input
                type="text"
                value={(formData.poslodavacDelatnost as string) || ''}
                onChange={(e) => updateField('poslodavacDelatnost', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Adresa</label>
              <input
                type="text"
                value={(formData.poslodavacAdresa as string) || ''}
                onChange={(e) => updateField('poslodavacAdresa', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Ime i prezime *</label>
              <input
                type="text"
                value={(formData.imeIPrezime as string) || ''}
                onChange={(e) => updateField('imeIPrezime', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">JMBG</label>
              <input
                type="text"
                value={(formData.jmbg as string) || ''}
                onChange={(e) => updateField('jmbg', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                maxLength={13}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Pol</label>
              <select
                value={(formData.pol as string) || ''}
                onChange={(e) => updateField('pol', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">Izaberite</option>
                <option value="M">Muski</option>
                <option value="Z">Zenski</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Datum rodjenja</label>
              <input
                type="date"
                value={(formData.datumRodjenja as string) || ''}
                onChange={(e) => updateField('datumRodjenja', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Radno mesto</label>
              <input
                type="text"
                value={(formData.radnoMesto as string) || ''}
                onChange={(e) => updateField('radnoMesto', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Vrsta radnog odnosa</label>
              <input
                type="text"
                value={(formData.vrstaRadnogOdnosa as string) || ''}
                onChange={(e) => updateField('vrstaRadnogOdnosa', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Ukupni staz</label>
              <input
                type="text"
                value={(formData.stazUkupno as string) || ''}
                onChange={(e) => updateField('stazUkupno', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Strucna sprema</label>
              <input
                type="text"
                value={(formData.strucnaSprema as string) || ''}
                onChange={(e) => updateField('strucnaSprema', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Datum povrede *</label>
              <input
                type="date"
                value={(formData.datumPovrede as string) || ''}
                onChange={(e) => updateField('datumPovrede', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Vreme povrede</label>
              <input
                type="time"
                value={(formData.vremePovrede as string) || ''}
                onChange={(e) => updateField('vremePovrede', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Smena</label>
              <select
                value={(formData.smena as string) || ''}
                onChange={(e) => updateField('smena', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">Izaberite</option>
                <option value="prva">Prva smena</option>
                <option value="druga">Druga smena</option>
                <option value="treca">Treca smena</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Mesto povrede</label>
              <input
                type="text"
                value={(formData.mestoPovrede as string) || ''}
                onChange={(e) => updateField('mestoPovrede', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Opis dogadjaja</label>
              <textarea
                value={(formData.opisDogadjaja as string) || ''}
                onChange={(e) => updateField('opisDogadjaja', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[100px]"
                placeholder="Detaljno opisite sta se desilo..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Sta je radio kada je povredjen</label>
              <textarea
                value={(formData.staJeRadioKadaPovredjen as string) || ''}
                onChange={(e) => updateField('staJeRadioKadaPovredjen', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[80px]"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <EsawCodingWidget
            onCodesChange={(codes) => updateField('esawCodes', codes)}
          />
        );

      case 5:
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Tezina povrede</label>
              <select
                value={(formData.tezinaPovrede as string) || ''}
                onChange={(e) => updateField('tezinaPovrede', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">Izaberite</option>
                <option value="laka">Laka povreda</option>
                <option value="teska">Teska povreda</option>
                <option value="smrtna">Smrtna povreda</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Povredjeni deo tela</label>
              <input
                type="text"
                value={(formData.povredjeniDeoTela as string) || ''}
                onChange={(e) => updateField('povredjeniDeoTela', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Dijagnoza</label>
              <textarea
                value={(formData.dijagnoza as string) || ''}
                onChange={(e) => updateField('dijagnoza', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[80px]"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Bolesnicko odsustvo (dani)</label>
              <input
                type="number"
                value={(formData.bolesnickoOdsustvo as string) || ''}
                onChange={(e) => updateField('bolesnickoOdsustvo', parseInt(e.target.value) || 0)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Unesite podatke o svedocima povrede</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-1 block">Ime i prezime svedoka</label>
                <input
                  type="text"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="Ime svedoka"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Kontakt svedoka</label>
                <input
                  type="text"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="Telefon ili adresa"
                />
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Status mera bezbednosti u momentu povrede</p>
            <div className="space-y-3">
              {[
                { key: 'osposobljenZaBzr', label: 'Da li je radnik bio osposobljen za bezbedan rad?' },
                { key: 'lekarskiPregled', label: 'Da li je radnik imao vazecu lekarsku potvrdu?' },
                { key: 'sredstvaLzs', label: 'Da li je radnik koristio sredstva licne zastite?' },
                { key: 'uputstvoZaRad', label: 'Da li je postojalo uputstvo za bezbedan rad?' },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-3 p-3 rounded-md border hover:bg-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(formData[item.key] as boolean) || false}
                    onChange={(e) => updateField(item.key, e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 8:
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-3 p-3 rounded-md border hover:bg-muted cursor-pointer">
              <input
                type="checkbox"
                checked={(formData.invalidnost as boolean) || false}
                onChange={(e) => updateField('invalidnost', e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-sm">Invalidnost kao posledica</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-md border hover:bg-muted cursor-pointer">
              <input
                type="checkbox"
                checked={(formData.smrtniIshod as boolean) || false}
                onChange={(e) => updateField('smrtniIshod', e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-sm">Smrtni ishod</span>
            </label>
            {(formData.smrtniIshod as boolean) && (
              <div>
                <label className="text-sm font-medium mb-1 block">Datum smrtnog ishoda</label>
                <input
                  type="date"
                  value={(formData.datumSmrtnogIshoda as string) || ''}
                  onChange={(e) => updateField('datumSmrtnogIshoda', e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
            )}
          </div>
        );

      case 9:
        return (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-700">Pregled izvestaja</h4>
              </div>
              <p className="text-sm text-green-600">
                Proverite sve unete podatke pre cuvanja. Izvestaj ce biti sacuvan kao nacrt
                koji mozete kasnije dopuniti i distribuirati.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Sastavio izvestaj</label>
              <input
                type="text"
                value={(formData.sastavioIzvestaj as string) || ''}
                onChange={(e) => updateField('sastavioIzvestaj', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Ime osobe koja sastavlja izvestaj"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Datum sastavljanja</label>
              <input
                type="date"
                value={(formData.datumSastavljanja as string) || new Date().toISOString().split('T')[0]}
                onChange={(e) => updateField('datumSastavljanja', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/app/povrede" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nova prijava povrede na radu</h1>
          <p className="text-muted-foreground text-sm">Izvestaj o povredi na radu (9 sekcija)</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {steps.map((step) => (
          <button
            key={step.id}
            onClick={() => setCurrentStep(step.id)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
              currentStep === step.id
                ? 'bg-primary text-primary-foreground'
                : step.id < currentStep
                ? 'bg-green-100 text-green-700'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <span className="font-medium">{step.id}</span>
            <span className="hidden sm:inline">{step.title}</span>
          </button>
        ))}
      </div>

      {/* Current step content */}
      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">{steps[currentStep - 1].title}</h2>
          <p className="text-sm text-muted-foreground">{steps[currentStep - 1].description}</p>
        </div>

        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50 flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Prethodni korak
        </button>

        {currentStep < 9 ? (
          <button
            onClick={() => setCurrentStep(Math.min(9, currentStep + 1))}
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 flex items-center gap-1"
          >
            Sledeci korak
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button className="rounded-md bg-green-600 text-white px-4 py-2 text-sm font-medium hover:bg-green-700 flex items-center gap-1">
            <Save className="h-4 w-4" />
            Sacuvaj izvestaj
          </button>
        )}
      </div>
    </div>
  );
}
