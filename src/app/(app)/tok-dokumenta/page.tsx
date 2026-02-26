'use client';

/**
 * Document Workflow Page
 *
 * Shows all document generation workflows with status pipeline.
 * Nedostaju podaci -> U pripremi -> Generisan -> Potpisan
 */

import { useState } from 'react';
import {
  FileText,
  Plus,
  AlertCircle,
  Clock,
  CheckCircle,
  PenTool,
  ArrowRight,
  Download,
  Upload,
  Bot,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

const statusPipeline = [
  { key: 'nedostaju_podaci', label: 'Nedostaju podaci', icon: AlertCircle, color: 'text-orange-600 bg-orange-100' },
  { key: 'u_pripremi', label: 'U pripremi', icon: Clock, color: 'text-blue-600 bg-blue-100' },
  { key: 'generisan', label: 'Generisan', icon: CheckCircle, color: 'text-green-600 bg-green-100' },
  { key: 'potpisan', label: 'Potpisan', icon: PenTool, color: 'text-purple-600 bg-purple-100' },
];

const documentTypes = [
  { value: 'akt_o_proceni_rizika', label: 'Akt o proceni rizika' },
  { value: 'pravilnik_bzr', label: 'Pravilnik o BZR' },
  { value: 'program_osposobljavanja', label: 'Program osposobljavanja' },
  { value: 'elaborat', label: 'Elaborat o uredjenju gradilista' },
  { value: 'obrazac_1', label: 'Obrazac 1' },
  { value: 'obrazac_2', label: 'Obrazac 2' },
  { value: 'izvestaj_o_povredi', label: 'Izvestaj o povredi' },
];

export default function TokDokumentaPage() {
  const { userType } = useAuth();
  const [showNewWorkflow, setShowNewWorkflow] = useState(false);
  const [workflows] = useState<any[]>([]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tok dokumenta</h1>
          <p className="text-muted-foreground mt-1">
            AI-voden tok generisanja BZR dokumenata
          </p>
        </div>
        {userType !== 'company' && (
          <button
            onClick={() => setShowNewWorkflow(!showNewWorkflow)}
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Novi tok
          </button>
        )}
      </div>

      {/* New Workflow Form */}
      {showNewWorkflow && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Pokreni novi tok generisanja dokumenta
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Tip dokumenta</label>
              <select className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                <option value="">Izaberite tip</option>
                {documentTypes.map(dt => (
                  <option key={dt.value} value={dt.value}>{dt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Naziv dokumenta</label>
              <input
                type="text"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Npr: Akt o proceni rizika za ABC d.o.o."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowNewWorkflow(false)}
              className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
            >
              Otkazi
            </button>
            <button className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90">
              Pokreni
            </button>
          </div>
        </div>
      )}

      {/* Status Pipeline Visualization */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {statusPipeline.map((status, idx) => (
          <div key={status.key} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${status.color}`}>
              <status.icon className="h-3 w-3" />
              {status.label}
              <span className="ml-1 font-bold">
                {workflows.filter(w => w.status === status.key).length}
              </span>
            </div>
            {idx < statusPipeline.length - 1 && (
              <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Workflows List */}
      <div className="space-y-4">
        {workflows.length === 0 && (
          <div className="rounded-lg border bg-card p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Nema aktivnih tokova dokumenta</p>
            <p className="text-xs text-muted-foreground mt-1">
              Kliknite "Novi tok" da pokrenete AI-vodjeno generisanje dokumenta
            </p>
          </div>
        )}

        {workflows.map((workflow) => {
          const statusInfo = statusPipeline.find(s => s.key === workflow.status);
          const StatusIcon = statusInfo?.icon || Clock;
          const missingData = (workflow.nedostajuciPodaci as any[]) || [];

          return (
            <div key={workflow.id} className="rounded-lg border bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-medium">{workflow.naziv}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {documentTypes.find(dt => dt.value === workflow.tipDokumenta)?.label || workflow.tipDokumenta}
                  </p>
                </div>
                <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${statusInfo?.color || ''}`}>
                  <StatusIcon className="h-3 w-3" />
                  {statusInfo?.label || workflow.status}
                </span>
              </div>

              {/* Missing data list */}
              {workflow.status === 'nedostaju_podaci' && missingData.length > 0 && (
                <div className="mt-3 p-3 rounded bg-orange-50 border border-orange-100">
                  <p className="text-xs font-medium text-orange-700 mb-2">Nedostajuci podaci:</p>
                  <ul className="space-y-1">
                    {missingData.map((item: any, idx: number) => (
                      <li key={idx} className="text-xs text-orange-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {item.opis}
                      </li>
                    ))}
                  </ul>
                  <button className="mt-2 text-xs text-primary hover:underline flex items-center gap-1">
                    <Upload className="h-3 w-3" />
                    Otpremi nedostajuce podatke
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-3">
                {workflow.status === 'generisan' && workflow.generisanFileKey && (
                  <button className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    Preuzmi dokument
                  </button>
                )}
                {workflow.status === 'generisan' && (
                  <button className="text-xs text-purple-600 hover:underline flex items-center gap-1">
                    <PenTool className="h-3 w-3" />
                    Oznaci kao potpisan
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
