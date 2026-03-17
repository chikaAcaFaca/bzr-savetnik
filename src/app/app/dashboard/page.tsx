'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Building2, Users, FileText, AlertTriangle, Search, CreditCard,
  Shield, ClipboardList, RefreshCw, TrendingUp, Bell, ChevronRight,
  CheckCircle, Clock, AlertCircle, Stethoscope, GraduationCap,
  Wrench, Zap, Wind, FileCheck, Activity,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { refreshCachedToken } from '@/lib/trpc';
import ObligationsWidget from '@/components/obligations-widget';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Obligation {
  id: number;
  tip: string;
  opis: string;
  workerName?: string | null;
  rokDatum: string;
  status: string;
}

interface DashboardStats {
  overdue: Obligation[];
  upcoming: Obligation[];
  healthScore: number;
  totalObligations: number;
  overdueCount: number;
  urgentCount: number;
  warningCount: number;
}

async function fetchWithAuth(path: string) {
  const token = await refreshCachedToken();
  const url = `${API_URL}/trpc/${path}`;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.result?.data?.json;
}

async function mutateWithAuth(path: string, input?: any) {
  const token = await refreshCachedToken();
  const res = await fetch(`${API_URL}/trpc/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ json: input || {} }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.result?.data?.json;
}

function HealthScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#16a34a' : score >= 50 ? '#ea580c' : '#dc2626';
  const bgColor = score >= 80 ? 'bg-green-50' : score >= 50 ? 'bg-orange-50' : 'bg-red-50';
  const label = score >= 80 ? 'Odlicno' : score >= 50 ? 'Potrebna paznja' : 'Hitno reagujte';

  return (
    <div className={`flex flex-col items-center gap-2 p-6 rounded-2xl ${bgColor}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="#e5e7eb" strokeWidth={10}
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={10}
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{score}</span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>
      <div className="text-center">
        <p className="font-semibold text-sm" style={{ color }}>{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">BZR Health Score</p>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, alert }: {
  icon: typeof Shield; label: string; value: string | number; color: string; alert?: boolean;
}) {
  return (
    <div className={`rounded-xl border bg-card p-5 ${alert ? 'ring-2 ring-red-200 border-red-200' : ''}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <p className={`text-3xl font-bold mt-2 ${alert ? 'text-red-600' : ''}`}>{value}</p>
    </div>
  );
}

function CompanyDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    overdue: [], upcoming: [], healthScore: 100,
    totalObligations: 0, overdueCount: 0, urgentCount: 0, warningCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [overdue, upcoming] = await Promise.all([
        fetchWithAuth('evidence.obligationsOverdue'),
        fetchWithAuth('evidence.obligationsUpcoming'),
      ]);

      const overdueList: Obligation[] = Array.isArray(overdue) ? overdue : [];
      const upcomingList: Obligation[] = Array.isArray(upcoming) ? upcoming : [];

      const now = new Date();
      const urgentCount = upcomingList.filter(o => {
        const d = Math.ceil((new Date(o.rokDatum).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return d <= 7;
      }).length;
      const warningCount = upcomingList.filter(o => {
        const d = Math.ceil((new Date(o.rokDatum).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return d > 7 && d <= 30;
      }).length;

      const healthScore = Math.max(0, 100 - (overdueList.length * 20) - (urgentCount * 10) - (warningCount * 5));

      setStats({
        overdue: overdueList,
        upcoming: upcomingList,
        healthScore,
        totalObligations: upcomingList.length,
        overdueCount: overdueList.length,
        urgentCount,
        warningCount,
      });
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await mutateWithAuth('evidence.obligationsSync');
      await loadDashboard();
    } catch {
    } finally {
      setSyncing(false);
    }
  };

  const handleMarkComplete = async (id: number) => {
    await mutateWithAuth('evidence.obligationMarkComplete', { id });
    await loadDashboard();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">BZR Kontrolna tabla</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Pregled bezbednosti i zdravlja na radu</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm hover:bg-muted transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          Osveži
        </button>
      </div>

      {/* Hero: Health Score + Critical Stats */}
      <div className="grid gap-4 lg:grid-cols-4">
        <HealthScoreRing score={loading ? 0 : stats.healthScore} />

        <div className="lg:col-span-3 grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={AlertCircle}
            label="Istekli rokovi"
            value={loading ? '-' : stats.overdueCount}
            color="text-red-600"
            alert={stats.overdueCount > 0}
          />
          <StatCard
            icon={Clock}
            label="Istice za 7 dana"
            value={loading ? '-' : stats.urgentCount}
            color="text-orange-500"
          />
          <StatCard
            icon={Bell}
            label="Istice za 30 dana"
            value={loading ? '-' : stats.warningCount}
            color="text-yellow-500"
          />
        </div>
      </div>

      {/* Overdue Alert Banner */}
      {stats.overdueCount > 0 && (
        <div className="rounded-xl bg-red-50 border-2 border-red-200 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-red-900">
                Imate {stats.overdueCount} isteklih zakonskih obaveza!
              </h3>
              <p className="text-sm text-red-700 mt-1">
                Inspekcija rada moze izreci kaznu za nepostovanje zakonskih rokova. Preporucujemo da odmah preduzmete akciju.
              </p>
              <Link
                href="/app/evidencije"
                className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-red-800 hover:text-red-900"
              >
                Pogledaj evidencije <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Obligations Widget (full data) */}
      <ObligationsWidget
        overdue={stats.overdue}
        upcoming={stats.upcoming}
        onSync={handleSync}
        onMarkComplete={handleMarkComplete}
        loading={loading}
      />

      {/* Quick Actions */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Brze akcije</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          <Link href="/app/evidencije" className="rounded-lg border p-4 text-left hover:bg-muted transition-colors block">
            <ClipboardList className="h-5 w-5 text-primary mb-2" />
            <p className="font-medium text-sm">Evidencije</p>
            <p className="text-xs text-muted-foreground">Obrasci 1-11</p>
          </Link>
          <Link href="/app/dokumenti-firme" className="rounded-lg border p-4 text-left hover:bg-muted transition-colors block">
            <FileText className="h-5 w-5 text-primary mb-2" />
            <p className="font-medium text-sm">Otpremi dokument</p>
            <p className="text-xs text-muted-foreground">Ugovori, doznake, odluke</p>
          </Link>
          <Link href="/app/pronadji-agenciju" className="rounded-lg border p-4 text-left hover:bg-muted transition-colors block">
            <Search className="h-5 w-5 text-primary mb-2" />
            <p className="font-medium text-sm">Pronadji agenciju</p>
            <p className="text-xs text-muted-foreground">BZR agencija za potpis</p>
          </Link>
          <Link href="/app/pretplata" className="rounded-lg border p-4 text-left hover:bg-muted transition-colors block">
            <CreditCard className="h-5 w-5 text-primary mb-2" />
            <p className="font-medium text-sm">Pretplata</p>
            <p className="text-xs text-muted-foreground">Upravljajte planom</p>
          </Link>
        </div>
      </div>

      {/* Connect Agency Banner (only if not connected) */}
      <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6">
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
    </div>
  );
}

function AgencyDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    overdue: [], upcoming: [], healthScore: 100,
    totalObligations: 0, overdueCount: 0, urgentCount: 0, warningCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [overdue, upcoming] = await Promise.all([
        fetchWithAuth('evidence.obligationsOverdue'),
        fetchWithAuth('evidence.obligationsUpcoming'),
      ]);

      const overdueList: Obligation[] = Array.isArray(overdue) ? overdue : [];
      const upcomingList: Obligation[] = Array.isArray(upcoming) ? upcoming : [];

      const now = new Date();
      const urgentCount = upcomingList.filter(o => {
        const d = Math.ceil((new Date(o.rokDatum).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return d <= 7;
      }).length;
      const warningCount = upcomingList.filter(o => {
        const d = Math.ceil((new Date(o.rokDatum).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return d > 7 && d <= 30;
      }).length;

      const healthScore = Math.max(0, 100 - (overdueList.length * 20) - (urgentCount * 10) - (warningCount * 5));

      setStats({
        overdue: overdueList, upcoming: upcomingList, healthScore,
        totalObligations: upcomingList.length, overdueCount: overdueList.length,
        urgentCount, warningCount,
      });
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await mutateWithAuth('evidence.obligationsSync');
      await loadDashboard();
    } finally {
      setSyncing(false);
    }
  };

  const handleMarkComplete = async (id: number) => {
    await mutateWithAuth('evidence.obligationMarkComplete', { id });
    await loadDashboard();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">BZR Kontrolna tabla</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Pregled svih klijenata i obaveza</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm hover:bg-muted transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          Osveži
        </button>
      </div>

      {/* Hero: Health Score + Stats */}
      <div className="grid gap-4 lg:grid-cols-5">
        <HealthScoreRing score={loading ? 0 : stats.healthScore} />

        <div className="lg:col-span-4 grid gap-4 sm:grid-cols-4">
          <StatCard
            icon={AlertCircle}
            label="Istekli rokovi"
            value={loading ? '-' : stats.overdueCount}
            color="text-red-600"
            alert={stats.overdueCount > 0}
          />
          <StatCard
            icon={Clock}
            label="Istice za 7 dana"
            value={loading ? '-' : stats.urgentCount}
            color="text-orange-500"
          />
          <StatCard
            icon={Bell}
            label="Istice za 30 dana"
            value={loading ? '-' : stats.warningCount}
            color="text-yellow-500"
          />
          <StatCard
            icon={Activity}
            label="Ukupno aktivnih"
            value={loading ? '-' : stats.totalObligations}
            color="text-blue-500"
          />
        </div>
      </div>

      {/* Overdue Alert */}
      {stats.overdueCount > 0 && (
        <div className="rounded-xl bg-red-50 border-2 border-red-200 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-900">
                {stats.overdueCount} isteklih obaveza kod klijenata!
              </h3>
              <p className="text-sm text-red-700 mt-1">
                Pregledajte evidencije i kontaktirajte klijente ciji su rokovi istekli.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Obligations Widget */}
      <ObligationsWidget
        overdue={stats.overdue}
        upcoming={stats.upcoming}
        onSync={handleSync}
        onMarkComplete={handleMarkComplete}
        loading={loading}
      />

      {/* Quick Actions */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Brze akcije</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          <Link href="/app/klijenti/novi" className="rounded-lg border p-4 text-left hover:bg-muted transition-colors block">
            <Building2 className="h-5 w-5 text-primary mb-2" />
            <p className="font-medium text-sm">Dodaj klijenta</p>
            <p className="text-xs text-muted-foreground">Registrujte novu firmu</p>
          </Link>
          <Link href="/app/evidencije" className="rounded-lg border p-4 text-left hover:bg-muted transition-colors block">
            <ClipboardList className="h-5 w-5 text-primary mb-2" />
            <p className="font-medium text-sm">Evidencije</p>
            <p className="text-xs text-muted-foreground">Obrasci 1-11</p>
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
