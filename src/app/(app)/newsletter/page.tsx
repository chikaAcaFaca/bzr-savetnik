'use client';

/**
 * Newsletter Admin Page
 *
 * Manage newsletter campaigns and subscribers.
 * Agency admin only.
 */

import { useState } from 'react';
import {
  Mail,
  Plus,
  Send,
  Users,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  BarChart3,
} from 'lucide-react';

const recipientTypes = [
  { value: 'svi', label: 'Svi pretplatnici' },
  { value: 'agencija', label: 'Samo agencije' },
  { value: 'firma', label: 'Samo firme' },
  { value: 'neregistrovan', label: 'Neregistrovani korisnici' },
];

export default function NewsletterPage() {
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [campaigns] = useState<any[]>([]);
  const [newCampaign, setNewCampaign] = useState({
    naslov: '',
    sadrzaj: '',
    tipPrimaoca: 'svi',
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Newsletter</h1>
          <p className="text-muted-foreground mt-1">Upravljanje newsletter kampanjama</p>
        </div>
        <button
          onClick={() => setShowNewCampaign(!showNewCampaign)}
          className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova kampanja
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Pretplatnici</p>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold mt-1">0</p>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Poslate kampanje</p>
            <Send className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold mt-1">0</p>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Prosecno otvoreno</p>
            <BarChart3 className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold mt-1">0%</p>
        </div>
      </div>

      {/* New Campaign Form */}
      {showNewCampaign && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Nova kampanja</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Naslov</label>
              <input
                type="text"
                value={newCampaign.naslov}
                onChange={(e) => setNewCampaign({ ...newCampaign, naslov: e.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Naslov newsletter-a"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Primaoci</label>
              <select
                value={newCampaign.tipPrimaoca}
                onChange={(e) => setNewCampaign({ ...newCampaign, tipPrimaoca: e.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                {recipientTypes.map(rt => (
                  <option key={rt.value} value={rt.value}>{rt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Sadrzaj (HTML)</label>
              <textarea
                value={newCampaign.sadrzaj}
                onChange={(e) => setNewCampaign({ ...newCampaign, sadrzaj: e.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[200px] font-mono"
                placeholder="<h2>Naslov clanka</h2><p>Tekst clanka...</p>"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewCampaign(false)}
                className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
              >
                Otkazi
              </button>
              <button className="rounded-md border px-4 py-2 text-sm hover:bg-muted flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Sacuvaj nacrt
              </button>
              <button className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 flex items-center gap-1">
                <Send className="h-4 w-4" />
                Posalji
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaigns List */}
      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Kampanje</h3>
        </div>
        {campaigns.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Mail className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Nema kampanja</p>
            <p className="text-xs mt-1">Kreirajte prvu newsletter kampanju</p>
          </div>
        ) : (
          <div className="divide-y">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{campaign.naslov}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {recipientTypes.find(rt => rt.value === campaign.tipPrimaoca)?.label || 'Svi'}
                    </span>
                    {campaign.sentAt && (
                      <span className="text-xs text-muted-foreground">
                        Poslato: {new Date(campaign.sentAt).toLocaleDateString('sr-RS')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {campaign.status === 'sent' && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Poslato ({campaign.ukupnoPoslato})
                    </span>
                  )}
                  {campaign.status === 'draft' && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Nacrt
                    </span>
                  )}
                  {campaign.status === 'draft' && (
                    <button className="text-xs text-primary hover:underline flex items-center gap-1">
                      <Send className="h-3 w-3" />
                      Posalji
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
