'use client';

/**
 * Obligations Widget
 *
 * Reusable dashboard widget showing upcoming and overdue legal obligations.
 * Color-coded by urgency: red (overdue), orange (7 days), yellow (30 days), green (30-90 days).
 * Displayed on both agency and company dashboards.
 */

import { useState } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  CheckCircle,
  ChevronRight,
  RefreshCw,
  Shield,
  Stethoscope,
  GraduationCap,
  Wrench,
  Zap,
  Wind,
  FileCheck,
} from 'lucide-react';

interface Obligation {
  id: number;
  tip: string;
  opis: string;
  workerName?: string | null;
  rokDatum: string;
  status: string;
}

interface ObligationsWidgetProps {
  overdue?: Obligation[];
  upcoming?: Obligation[];
  onSync?: () => void;
  onMarkComplete?: (id: number) => void;
  loading?: boolean;
}

const tipIcons: Record<string, typeof Shield> = {
  lekarski_pregled: Stethoscope,
  sanitarni_pregled: Stethoscope,
  obuka_bzr: GraduationCap,
  pregled_opreme: Wrench,
  ispitivanje_instalacija: Zap,
  ispitivanje_okoline: Wind,
  akt_procene_rizika: FileCheck,
  osiguranje: Shield,
  licenca_obnova: FileCheck,
};

function getUrgencyGroup(rokDatum: string): 'overdue' | 'urgent' | 'warning' | 'upcoming' {
  const now = new Date();
  const deadline = new Date(rokDatum);
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays <= 7) return 'urgent';
  if (diffDays <= 30) return 'warning';
  return 'upcoming';
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('sr-RS', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function daysUntil(dateStr: string) {
  const now = new Date();
  const deadline = new Date(dateStr);
  return Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function ObligationItem({ obligation, onMarkComplete }: { obligation: Obligation; onMarkComplete?: (id: number) => void }) {
  const urgency = getUrgencyGroup(obligation.rokDatum);
  const Icon = tipIcons[obligation.tip] || Shield;
  const days = daysUntil(obligation.rokDatum);

  const urgencyStyles = {
    overdue: 'border-l-4 border-l-red-500 bg-red-50',
    urgent: 'border-l-4 border-l-orange-500 bg-orange-50',
    warning: 'border-l-4 border-l-yellow-500 bg-yellow-50',
    upcoming: 'border-l-4 border-l-green-500 bg-green-50',
  };

  const urgencyBadge = {
    overdue: { text: `Istekao pre ${Math.abs(days)} dana`, className: 'bg-red-100 text-red-700' },
    urgent: { text: `Jos ${days} dana`, className: 'bg-orange-100 text-orange-700' },
    warning: { text: `Jos ${days} dana`, className: 'bg-yellow-100 text-yellow-700' },
    upcoming: { text: `Jos ${days} dana`, className: 'bg-green-100 text-green-700' },
  };

  return (
    <div className={`p-3 rounded-lg ${urgencyStyles[urgency]} mb-2`}>
      <div className="flex items-start gap-3">
        <Icon className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{obligation.opis}</p>
          {obligation.workerName && (
            <p className="text-xs text-muted-foreground">{obligation.workerName}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">{formatDate(obligation.rokDatum)}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${urgencyBadge[urgency].className}`}>
              {urgencyBadge[urgency].text}
            </span>
          </div>
        </div>
        {onMarkComplete && (
          <button
            onClick={() => onMarkComplete(obligation.id)}
            className="text-xs text-green-600 hover:text-green-800 flex-shrink-0"
            title="Oznaci kao zavrseno"
          >
            <CheckCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function ObligationsWidget({
  overdue = [],
  upcoming = [],
  onSync,
  onMarkComplete,
  loading = false,
}: ObligationsWidgetProps) {
  const [expanded, setExpanded] = useState(false);

  // Split upcoming into urgency groups
  const urgent = upcoming.filter(o => daysUntil(o.rokDatum) <= 7);
  const warning = upcoming.filter(o => {
    const d = daysUntil(o.rokDatum);
    return d > 7 && d <= 30;
  });
  const future = upcoming.filter(o => daysUntil(o.rokDatum) > 30);

  const totalCount = overdue.length + upcoming.length;
  const displayItems = expanded ? Infinity : 5;

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <h3 className="font-semibold">Zakonske obaveze</h3>
          {totalCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
              {totalCount}
            </span>
          )}
        </div>
        {onSync && (
          <button
            onClick={onSync}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            disabled={loading}
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            Osveži
          </button>
        )}
      </div>

      <div className="p-4 space-y-3">
        {totalCount === 0 && !loading && (
          <div className="text-center py-4 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm">Sve obaveze su ispunjene</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">Ucitavanje...</p>
          </div>
        )}

        {/* Overdue (red) */}
        {overdue.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-red-600 uppercase mb-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Istekli rokovi ({overdue.length})
            </p>
            {overdue.slice(0, displayItems).map(o => (
              <ObligationItem key={o.id} obligation={o} onMarkComplete={onMarkComplete} />
            ))}
          </div>
        )}

        {/* Urgent - 7 days (orange) */}
        {urgent.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-orange-600 uppercase mb-1 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Istice za 7 dana ({urgent.length})
            </p>
            {urgent.slice(0, displayItems).map(o => (
              <ObligationItem key={o.id} obligation={o} onMarkComplete={onMarkComplete} />
            ))}
          </div>
        )}

        {/* Warning - 30 days (yellow) */}
        {warning.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-yellow-600 uppercase mb-1 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Istice za 30 dana ({warning.length})
            </p>
            {warning.slice(0, displayItems).map(o => (
              <ObligationItem key={o.id} obligation={o} onMarkComplete={onMarkComplete} />
            ))}
          </div>
        )}

        {/* Upcoming - 30-90 days (green) */}
        {!expanded && future.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-green-600 uppercase mb-1">
              Predstojeće ({future.length})
            </p>
            {future.slice(0, 3).map(o => (
              <ObligationItem key={o.id} obligation={o} onMarkComplete={onMarkComplete} />
            ))}
          </div>
        )}

        {expanded && future.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-green-600 uppercase mb-1">
              Predstojeće ({future.length})
            </p>
            {future.map(o => (
              <ObligationItem key={o.id} obligation={o} onMarkComplete={onMarkComplete} />
            ))}
          </div>
        )}

        {totalCount > 5 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-primary hover:underline flex items-center gap-1 mx-auto"
          >
            {expanded ? 'Prikaži manje' : `Prikaži sve (${totalCount})`}
            <ChevronRight className={`h-3 w-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
        )}
      </div>
    </div>
  );
}
