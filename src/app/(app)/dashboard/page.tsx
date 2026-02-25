'use client';

import Link from 'next/link';
import { Building2, Users, FileText, AlertTriangle, Search, CreditCard, Shield } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

function AgencyDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Pregled vaseg poslovanja</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Building2, label: 'Ukupno klijenata', value: '0', color: 'text-blue-600' },
          { icon: Users, label: 'Ukupno zaposlenih', value: '0', color: 'text-green-600' },
          { icon: FileText, label: 'Generisani dokumenti', value: '0', color: 'text-purple-600' },
          { icon: AlertTriangle, label: 'Visok rizik', value: '0', color: 'text-red-600' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Brze akcije</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/app/klijenti/novi" className="rounded-lg border p-4 text-left hover:bg-muted transition-colors block">
            <Building2 className="h-5 w-5 text-primary mb-2" />
            <p className="font-medium text-sm">Dodaj klijenta</p>
            <p className="text-xs text-muted-foreground">Registrujte novu firmu</p>
          </Link>
          <button className="rounded-lg border p-4 text-left hover:bg-muted transition-colors">
            <FileText className="h-5 w-5 text-primary mb-2" />
            <p className="font-medium text-sm">Generisi dokument</p>
            <p className="text-xs text-muted-foreground">Akt o proceni rizika</p>
          </button>
          <Link href="/app/agenti" className="rounded-lg border p-4 text-left hover:bg-muted transition-colors block">
            <Users className="h-5 w-5 text-primary mb-2" />
            <p className="font-medium text-sm">Dodaj agenta</p>
            <p className="text-xs text-muted-foreground">Pozovite kolegu</p>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Nedavna aktivnost</h2>
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Nema nedavne aktivnosti</p>
          <p className="text-sm mt-1">Dodajte prvog klijenta da biste poceli</p>
        </div>
      </div>
    </div>
  );
}

function CompanyDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Pregled bezbednosti i zdravlja na radu vase firme</p>
      </div>

      {/* Connect Agency Banner */}
      <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-6">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Povezite se sa BZR agencijom</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Pronadjite licenciranu agenciju za bezbednost i zdravlje na radu
              koja ce pregledati i potpisati vasu dokumentaciju.
            </p>
            <Link
              href="/app/pronadji-agenciju"
              className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-primary hover:underline"
            >
              <Search className="h-4 w-4" />
              Pronadji agenciju
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          { icon: FileText, label: 'Dokumenti', value: '0', color: 'text-purple-600' },
          { icon: Users, label: 'Zaposleni', value: '0', color: 'text-green-600' },
          { icon: AlertTriangle, label: 'Visok rizik', value: '0', color: 'text-red-600' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Brze akcije</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <button className="rounded-lg border p-4 text-left hover:bg-muted transition-colors">
            <FileText className="h-5 w-5 text-primary mb-2" />
            <p className="font-medium text-sm">Generisi dokument</p>
            <p className="text-xs text-muted-foreground">Akt o proceni rizika</p>
          </button>
          <Link href="/app/pronadji-agenciju" className="rounded-lg border p-4 text-left hover:bg-muted transition-colors block">
            <Search className="h-5 w-5 text-primary mb-2" />
            <p className="font-medium text-sm">Pronadji agenciju</p>
            <p className="text-xs text-muted-foreground">Povezite se sa BZR agencijom</p>
          </Link>
          <Link href="/app/pretplata" className="rounded-lg border p-4 text-left hover:bg-muted transition-colors block">
            <CreditCard className="h-5 w-5 text-primary mb-2" />
            <p className="font-medium text-sm">Pretplata</p>
            <p className="text-xs text-muted-foreground">Upravljajte planom</p>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Nedavna aktivnost</h2>
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Nema nedavne aktivnosti</p>
          <p className="text-sm mt-1">Generisaite prvi dokument da biste poceli</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { userType } = useAuth();

  if (userType === 'company') {
    return <CompanyDashboard />;
  }

  return <AgencyDashboard />;
}
