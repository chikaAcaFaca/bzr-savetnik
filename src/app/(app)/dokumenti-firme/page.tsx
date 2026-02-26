'use client';

/**
 * Client Document Upload Page
 *
 * Companies upload contracts, decisions, sistematizacija, doznake, etc.
 * Documents are processed by AI for data extraction.
 */

import { useState } from 'react';
import {
  Upload,
  FileText,
  File,
  CheckCircle,
  Clock,
  AlertCircle,
  Bot,
  FolderOpen,
  X,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

const documentTypes = [
  { value: 'ugovor_o_radu', label: 'Ugovor o radu' },
  { value: 'odluka', label: 'Odluka' },
  { value: 'resenje', label: 'Resenje' },
  { value: 'sistematizacija', label: 'Sistematizacija' },
  { value: 'doznaka', label: 'Doznaka' },
  { value: 'lekarski_nalaz', label: 'Lekarski nalaz' },
  { value: 'polisa_osiguranja', label: 'Polisa osiguranja' },
  { value: 'zapisnik', label: 'Zapisnik' },
  { value: 'ostalo', label: 'Ostalo' },
];

const processingStatusBadge: Record<string, { label: string; icon: typeof CheckCircle; className: string }> = {
  pending: { label: 'Ceka obradu', icon: Clock, className: 'bg-gray-100 text-gray-600' },
  processing: { label: 'Obradjuje se...', icon: Bot, className: 'bg-blue-100 text-blue-600' },
  completed: { label: 'Obradjen', icon: CheckCircle, className: 'bg-green-100 text-green-600' },
  failed: { label: 'Greska', icon: AlertCircle, className: 'bg-red-100 text-red-600' },
};

export default function DokumentiFirmePage() {
  const { userType } = useAuth();
  const [selectedType, setSelectedType] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [documents] = useState<any[]>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    // TODO: Handle file upload to S3 + create document record
    console.log('Dropped files:', files);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dokumenti firme</h1>
        <p className="text-muted-foreground mt-1">
          Otpremite dokumente firme za AI obradu i generisanje BZR dokumentacije
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
        <p className="font-medium">Prevucite dokumente ovde</p>
        <p className="text-sm text-muted-foreground mt-1">ili kliknite da biste izabrali fajlove</p>
        <div className="flex items-center gap-3 justify-center mt-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">Tip dokumenta</option>
            {documentTypes.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <label className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 cursor-pointer">
            Izaberi fajl
            <input type="file" className="hidden" accept=".pdf,.docx,.doc,.jpg,.png" multiple />
          </label>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Podrzani formati: PDF, DOCX, JPG, PNG (max 10MB)
        </p>
      </div>

      {/* Document Categories */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Ugovori', icon: FileText, count: 0 },
          { label: 'Odluke i resenja', icon: File, count: 0 },
          { label: 'Sistematizacija', icon: FolderOpen, count: 0 },
          { label: 'Doznake', icon: FileText, count: 0 },
          { label: 'Lekarski nalazi', icon: FileText, count: 0 },
          { label: 'Ostalo', icon: File, count: 0 },
        ].map((cat) => (
          <div key={cat.label} className="rounded-lg border bg-card p-4 flex items-center gap-3">
            <cat.icon className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{cat.label}</p>
              <p className="text-xs text-muted-foreground">{cat.count} dokument(a)</p>
            </div>
          </div>
        ))}
      </div>

      {/* Documents List */}
      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Otpremljeni dokumenti</h3>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Nema otpremljenih dokumenata</p>
            <p className="text-xs mt-1">Prevucite ili izaberite dokumente iznad</p>
          </div>
        ) : (
          <div className="divide-y">
            {documents.map((doc) => {
              const statusInfo = processingStatusBadge[doc.processingStatus || 'pending'];
              const StatusIcon = statusInfo?.icon || Clock;

              return (
                <div key={doc.id} className="p-4 flex items-center gap-4">
                  <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{doc.naziv}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {documentTypes.find(t => t.value === doc.tip)?.label || doc.tip}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(doc.createdAt).toLocaleDateString('sr-RS')}
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${statusInfo?.className}`}>
                    <StatusIcon className="h-3 w-3" />
                    {statusInfo?.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
