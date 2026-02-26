'use client';

/**
 * Injury Reports List Page
 *
 * Shows all injury reports with status badges, filters, and "Nova prijava" button.
 */

import { useState } from 'react';
import Link from 'next/link';
import { Plus, FileText, AlertTriangle, Filter, Search } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

const statusBadge: Record<string, { label: string; className: string }> = {
  draft: { label: 'Nacrt', className: 'bg-gray-100 text-gray-700' },
  submitted: { label: 'Podnesen', className: 'bg-blue-100 text-blue-700' },
  distributed: { label: 'Distribuiran', className: 'bg-green-100 text-green-700' },
};

const severityBadge: Record<string, { label: string; className: string }> = {
  laka: { label: 'Laka', className: 'bg-yellow-100 text-yellow-700' },
  teska: { label: 'Teska', className: 'bg-orange-100 text-orange-700' },
  smrtna: { label: 'Smrtna', className: 'bg-red-100 text-red-700' },
};

export default function PovredePage() {
  const { userType } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');
  const [reports] = useState<any[]>([]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Povrede na radu</h1>
          <p className="text-muted-foreground mt-1">Izvestaji o povredama na radu sa ESAW klasifikacijom</p>
        </div>
        {userType !== 'company' && (
          <Link
            href="/app/povrede/nova"
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova prijava
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-md border px-3 py-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm bg-transparent border-none outline-none"
          >
            <option value="">Svi statusi</option>
            <option value="draft">Nacrt</option>
            <option value="submitted">Podnesen</option>
            <option value="distributed">Distribuiran</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Povredjeni</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Datum</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Radno mesto</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Tezina</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Firma</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    <AlertTriangle className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Nema prijavljenih povreda</p>
                    <p className="text-xs mt-1">Kliknite "Nova prijava" da biste prijavili povredu na radu</p>
                  </td>
                </tr>
              )}
              {reports.map((report) => (
                <tr key={report.id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm font-medium">{report.imeIPrezime}</td>
                  <td className="px-4 py-3 text-sm">{report.datumPovrede}</td>
                  <td className="px-4 py-3 text-sm">{report.radnoMesto || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    {report.tezinaPovrede && (
                      <span className={`text-xs px-2 py-0.5 rounded ${severityBadge[report.tezinaPovrede]?.className || ''}`}>
                        {severityBadge[report.tezinaPovrede]?.label || report.tezinaPovrede}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`text-xs px-2 py-0.5 rounded ${statusBadge[report.status]?.className || ''}`}>
                      {statusBadge[report.status]?.label || report.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{report.companyName || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/app/povrede/${report.id}`}
                      className="text-xs text-primary hover:underline"
                    >
                      Detalji
                    </Link>
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
