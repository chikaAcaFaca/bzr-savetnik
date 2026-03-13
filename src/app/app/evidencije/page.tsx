'use client';

/**
 * Evidence Management Dashboard
 *
 * Main page showing all 11 Obrazac cards with record counts,
 * upcoming deadlines, and quick actions.
 */

import { useState } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  Users,
  AlertTriangle,
  FlaskConical,
  Skull,
  Wrench,
  Zap,
  Wind,
  HardHat,
  GraduationCap,
  FileText,
  Plus,
  Download,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

interface ObrazacCard {
  broj: number;
  naziv: string;
  opisKratak: string;
  icon: typeof ClipboardList;
  color: string;
  readonly?: boolean;
}

const obrazacCards: ObrazacCard[] = [
  {
    broj: 1,
    naziv: 'Radna mesta sa povecenim rizikom',
    opisKratak: 'Evidencija o radnim mestima sa povecenim rizikom',
    icon: AlertTriangle,
    color: 'text-red-600',
  },
  {
    broj: 2,
    naziv: 'Zaposleni na rizicnim mestima',
    opisKratak: 'Evidencija o zaposlenima na radnim mestima sa povecenim rizikom',
    icon: Users,
    color: 'text-orange-600',
  },
  {
    broj: 3,
    naziv: 'Povrede na radu',
    opisKratak: 'Evidencija o povredama na radu',
    icon: AlertTriangle,
    color: 'text-red-700',
  },
  {
    broj: 4,
    naziv: 'Profesionalna oboljenja',
    opisKratak: 'Evidencija o profesionalnim oboljenjima',
    icon: FlaskConical,
    color: 'text-purple-600',
  },
  {
    broj: 5,
    naziv: 'Izlozenost stetnostima',
    opisKratak: 'Evidencija o zaposlenima izlozenim biohemijskim stetnostima',
    icon: Skull,
    color: 'text-yellow-600',
  },
  {
    broj: 6,
    naziv: 'Osposobljavanje',
    opisKratak: 'Evidencija o osposobljavanju zaposlenih za bezbedan rad',
    icon: GraduationCap,
    color: 'text-blue-600',
    readonly: true,
  },
  {
    broj: 7,
    naziv: 'Opasne materije',
    opisKratak: 'Evidencija o opasnim materijama koje se koriste u radu',
    icon: Skull,
    color: 'text-orange-700',
  },
  {
    broj: 8,
    naziv: 'Pregledi opreme',
    opisKratak: 'Evidencija o izvrsenim pregledima i ispitivanjima opreme za rad',
    icon: Wrench,
    color: 'text-blue-700',
  },
  {
    broj: 9,
    naziv: 'Elektricne instalacije',
    opisKratak: 'Evidencija o pregledima elektricnih instalacija',
    icon: Zap,
    color: 'text-yellow-500',
  },
  {
    broj: 10,
    naziv: 'Uslovi radne okoline',
    opisKratak: 'Evidencija o ispitivanjima uslova radne okoline',
    icon: Wind,
    color: 'text-green-600',
  },
  {
    broj: 11,
    naziv: 'Licna zastitna sredstva',
    opisKratak: 'Evidencija o izdatim sredstvima i opremi za licnu zastitu',
    icon: HardHat,
    color: 'text-indigo-600',
  },
];

export default function EvidencijePage() {
  const { userType } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Evidencije</h1>
          <p className="text-muted-foreground mt-1">
            Obrasci 1-11 po Pravilniku o evidencijama u oblasti BZR (Sl. glasnik RS, br. 5/2025)
          </p>
        </div>
      </div>

      {/* Obrazac Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {obrazacCards.map((card) => (
          <Link
            key={card.broj}
            href={card.readonly ? '#' : `/app/evidencije/obrazac-${card.broj}`}
            className={`rounded-lg border bg-card p-5 hover:shadow-md transition-shadow ${
              card.readonly ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`rounded-lg p-2 bg-muted ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Obrazac {card.broj}</span>
                  {card.readonly && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700">
                      Papirna forma
                    </span>
                  )}
                </div>
                <h3 className="font-medium text-sm mt-1">{card.naziv}</h3>
                <p className="text-xs text-muted-foreground mt-1">{card.opisKratak}</p>
              </div>
            </div>

            {card.readonly && (
              <p className="text-xs text-yellow-600 mt-3 p-2 bg-yellow-50 rounded">
                Obrazac 6 mora biti u papirnoj formi prema Pravilniku
              </p>
            )}
          </Link>
        ))}
      </div>

      {/* Info panel */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-semibold">O evidencijama</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Pravilnik o nacinu vodjenja i rokovima cuvanja evidencija u oblasti bezbednosti i zdravlja na radu
              (Sl. glasnik RS, br. 5/2025, 38/2025, 118/2025) stupa na snagu 1. jula 2026. godine.
              Zamenjuje stari Pravilnik (62/2007) - sada ima 11 obrazaca umesto 14.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-muted text-muted-foreground">
                Obrazac 1-5, 7, 11: Cuva se 40 godina
              </span>
              <span className="px-2 py-1 rounded bg-muted text-muted-foreground">
                Obrazac 8-10: Cuva se 6 godina
              </span>
              <span className="px-2 py-1 rounded bg-yellow-50 text-yellow-700">
                Obrazac 6: Samo papirna forma
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
