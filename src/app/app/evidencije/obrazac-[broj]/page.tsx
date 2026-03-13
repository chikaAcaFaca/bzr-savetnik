'use client';

/**
 * Individual Obrazac Page
 *
 * Dynamic route for Obrazac 1-11. Shows data table with all records,
 * add button, inline editing, export, and auto-populate options.
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Download,
  RefreshCw,
  Trash2,
  Edit,
  Save,
  X,
  Wand2,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

// Obrazac metadata (field definitions per form type)
const obrazacMeta: Record<number, { naziv: string; fields: { key: string; label: string; type: string }[] }> = {
  1: {
    naziv: 'Radna mesta sa povecenim rizikom',
    fields: [
      { key: 'redniBroj', label: 'R.br.', type: 'number' },
      { key: 'nazivRadnogMesta', label: 'Naziv radnog mesta', type: 'text' },
      { key: 'opisPoslova', label: 'Opis poslova', type: 'textarea' },
      { key: 'brojZaposlenih', label: 'Broj zaposlenih', type: 'number' },
      { key: 'datumUtvrdjivanja', label: 'Datum utvrdjivanja', type: 'date' },
      { key: 'napomena', label: 'Napomena', type: 'textarea' },
    ],
  },
  2: {
    naziv: 'Zaposleni na radnim mestima sa povecenim rizikom',
    fields: [
      { key: 'redniBroj', label: 'R.br.', type: 'number' },
      { key: 'imeIPrezime', label: 'Ime i prezime', type: 'text' },
      { key: 'nazivRadnogMesta', label: 'Radno mesto', type: 'text' },
      { key: 'datumRasporeda', label: 'Datum rasporeda', type: 'date' },
      { key: 'lekarskiPregled', label: 'Lekarski pregled', type: 'text' },
      { key: 'datumPregleda', label: 'Datum pregleda', type: 'date' },
      { key: 'osposobljen', label: 'Osposobljen', type: 'boolean' },
    ],
  },
  3: {
    naziv: 'Povrede na radu',
    fields: [
      { key: 'redniBroj', label: 'R.br.', type: 'number' },
      { key: 'imeIPrezime', label: 'Ime i prezime', type: 'text' },
      { key: 'radnoMesto', label: 'Radno mesto', type: 'text' },
      { key: 'datumPovrede', label: 'Datum povrede', type: 'date' },
      { key: 'tezinaPovrede', label: 'Tezina', type: 'text' },
      { key: 'opisPovrede', label: 'Opis', type: 'textarea' },
    ],
  },
  4: {
    naziv: 'Profesionalna oboljenja',
    fields: [
      { key: 'redniBroj', label: 'R.br.', type: 'number' },
      { key: 'imeIPrezime', label: 'Ime i prezime', type: 'text' },
      { key: 'radnoMesto', label: 'Radno mesto', type: 'text' },
      { key: 'dijagnoza', label: 'Dijagnoza', type: 'text' },
      { key: 'mkbSifra', label: 'MKB sifra', type: 'text' },
      { key: 'datumDijagnoze', label: 'Datum dijagnoze', type: 'date' },
    ],
  },
  5: {
    naziv: 'Zaposleni izlozeni stetnostima',
    fields: [
      { key: 'redniBroj', label: 'R.br.', type: 'number' },
      { key: 'imeIPrezime', label: 'Ime i prezime', type: 'text' },
      { key: 'radnoMesto', label: 'Radno mesto', type: 'text' },
      { key: 'vrstaStetnosti', label: 'Vrsta stetnosti', type: 'text' },
      { key: 'nazivStetnosti', label: 'Naziv stetnosti', type: 'text' },
      { key: 'nivoIzlozenosti', label: 'Nivo izlozenosti', type: 'text' },
    ],
  },
  7: {
    naziv: 'Opasne materije',
    fields: [
      { key: 'redniBroj', label: 'R.br.', type: 'number' },
      { key: 'nazivMaterije', label: 'Naziv materije', type: 'text' },
      { key: 'hemijskiNaziv', label: 'Hemijski naziv', type: 'text' },
      { key: 'casBroj', label: 'CAS broj', type: 'text' },
      { key: 'klasaOpasnosti', label: 'Klasa opasnosti', type: 'text' },
      { key: 'kolicina', label: 'Kolicina', type: 'text' },
      { key: 'lokacija', label: 'Lokacija', type: 'text' },
    ],
  },
  8: {
    naziv: 'Pregledi opreme za rad',
    fields: [
      { key: 'redniBroj', label: 'R.br.', type: 'number' },
      { key: 'nazivOpreme', label: 'Naziv opreme', type: 'text' },
      { key: 'vrstaOpreme', label: 'Vrsta opreme', type: 'text' },
      { key: 'datumPregleda', label: 'Datum pregleda', type: 'date' },
      { key: 'rezultat', label: 'Rezultat', type: 'text' },
      { key: 'sledeciPregled', label: 'Sledeci pregled', type: 'date' },
    ],
  },
  9: {
    naziv: 'Pregledi elektricnih instalacija',
    fields: [
      { key: 'redniBroj', label: 'R.br.', type: 'number' },
      { key: 'vrstaInstalacije', label: 'Vrsta instalacije', type: 'text' },
      { key: 'lokacija', label: 'Lokacija', type: 'text' },
      { key: 'datumPregleda', label: 'Datum pregleda', type: 'date' },
      { key: 'rezultat', label: 'Rezultat', type: 'text' },
      { key: 'sledeciPregled', label: 'Sledeci pregled', type: 'date' },
    ],
  },
  10: {
    naziv: 'Ispitivanja uslova radne okoline',
    fields: [
      { key: 'redniBroj', label: 'R.br.', type: 'number' },
      { key: 'vrstaIspitivanja', label: 'Vrsta ispitivanja', type: 'text' },
      { key: 'lokacija', label: 'Lokacija', type: 'text' },
      { key: 'datumIspitivanja', label: 'Datum ispitivanja', type: 'date' },
      { key: 'izmerenaVrednost', label: 'Izmerena vrednost', type: 'text' },
      { key: 'rezultat', label: 'Rezultat', type: 'text' },
      { key: 'sledeciPregled', label: 'Sledeci pregled', type: 'date' },
    ],
  },
  11: {
    naziv: 'Izdata sredstva licne zastite',
    fields: [
      { key: 'redniBroj', label: 'R.br.', type: 'number' },
      { key: 'imeIPrezime', label: 'Ime i prezime', type: 'text' },
      { key: 'radnoMesto', label: 'Radno mesto', type: 'text' },
      { key: 'nazivSredstva', label: 'Naziv sredstva', type: 'text' },
      { key: 'datumIzdavanja', label: 'Datum izdavanja', type: 'date' },
      { key: 'rokTrajanja', label: 'Rok trajanja', type: 'date' },
      { key: 'potpisPrimio', label: 'Potpis', type: 'boolean' },
    ],
  },
};

export default function ObrazacPage() {
  const params = useParams();
  const router = useRouter();
  const { userType } = useAuth();
  const broj = parseInt(params.broj as string, 10);
  const meta = obrazacMeta[broj];

  const [records, setRecords] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRecord, setNewRecord] = useState<Record<string, unknown>>({});

  // Obrazac 6 is read-only
  if (broj === 6) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/app/evidencije" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Obrazac 6: Osposobljavanje</h1>
            <p className="text-muted-foreground">Evidencija o osposobljavanju zaposlenih za bezbedan rad</p>
          </div>
        </div>
        <div className="rounded-lg border-2 border-dashed border-yellow-300 bg-yellow-50 p-8 text-center">
          <FileText className="h-12 w-12 mx-auto mb-3 text-yellow-500" />
          <h3 className="font-semibold text-lg">Papirna forma</h3>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            Obrazac 6 (Evidencija o osposobljavanju zaposlenih za bezbedan rad)
            mora biti u papirnoj formi prema vazecim propisima.
            Ne moze se voditi u elektronskom obliku.
          </p>
        </div>
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Obrazac {broj} nije pronadjen</p>
        <Link href="/app/evidencije" className="text-primary hover:underline text-sm mt-2 inline-block">
          Nazad na evidencije
        </Link>
      </div>
    );
  }

  const canAutoPopulate = [1, 2, 11].includes(broj);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/app/evidencije" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Obrazac {broj}: {meta.naziv}</h1>
            <p className="text-muted-foreground text-sm">{meta.fields.length} polja po zapisu</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canAutoPopulate && userType !== 'company' && (
            <button className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted flex items-center gap-1">
              <Wand2 className="h-4 w-4" />
              Popuni iz Akta
            </button>
          )}
          <button className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted flex items-center gap-1">
            <Download className="h-4 w-4" />
            Izvezi
          </button>
          {userType !== 'company' && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:bg-primary/90 flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Dodaj zapis
            </button>
          )}
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Novi zapis</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {meta.fields.map((field) => (
              <div key={field.key}>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={(newRecord[field.key] as string) || ''}
                    onChange={(e) => setNewRecord({ ...newRecord, [field.key]: e.target.value })}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[60px]"
                  />
                ) : field.type === 'boolean' ? (
                  <input
                    type="checkbox"
                    checked={(newRecord[field.key] as boolean) || false}
                    onChange={(e) => setNewRecord({ ...newRecord, [field.key]: e.target.checked })}
                    className="h-4 w-4"
                  />
                ) : (
                  <input
                    type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                    value={(newRecord[field.key] as string) || ''}
                    onChange={(e) => setNewRecord({ ...newRecord, [field.key]: e.target.value })}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => { setShowAddForm(false); setNewRecord({}); }}
              className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
            >
              Otkazi
            </button>
            <button className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 flex items-center gap-1">
              <Save className="h-4 w-4" />
              Sacuvaj
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                {meta.fields.slice(0, 6).map((field) => (
                  <th key={field.key} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                    {field.label}
                  </th>
                ))}
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 && (
                <tr>
                  <td colSpan={meta.fields.length + 1} className="text-center py-12 text-muted-foreground">
                    <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Nema unetih zapisa</p>
                    <p className="text-xs mt-1">
                      {canAutoPopulate
                        ? 'Koristite "Popuni iz Akta" ili dodajte zapis rucno'
                        : 'Kliknite "Dodaj zapis" da biste poceli'}
                    </p>
                  </td>
                </tr>
              )}
              {records.map((record, idx) => (
                <tr key={record.id || idx} className="border-b hover:bg-muted/50">
                  {meta.fields.slice(0, 6).map((field) => (
                    <td key={field.key} className="px-4 py-3 text-sm">
                      {field.type === 'boolean'
                        ? (record[field.key] ? 'Da' : 'Ne')
                        : (record[field.key] ?? '-')}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button className="p-1 text-muted-foreground hover:text-foreground">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-muted-foreground hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
