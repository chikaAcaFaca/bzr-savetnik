'use client';

import { useEffect, useRef, useState } from 'react';
import { CreditCard, CheckCircle, AlertTriangle, Clock, Copy, Check } from 'lucide-react';
import { generateIpsQrString, getPaymentAccount, getPaymentRecipient } from '@/lib/ips-qr';
import QRCode from 'qrcode';

/**
 * Pretplata (Subscription) Page
 *
 * Shows IPS QR code for payment, current subscription status,
 * and manual payment details for companies.
 */

// Pricing tiers matching backend PRICING_TIERS
const PRICING_TIERS: Record<string, { label: string; monthlyRsd: number; annualRsd: number }> = {
  tier_1: { label: '1 zaposlen', monthlyRsd: 990, annualRsd: 9900 },
  tier_5: { label: 'Do 5 zaposlenih', monthlyRsd: 1990, annualRsd: 19900 },
  tier_10: { label: 'Do 10 zaposlenih', monthlyRsd: 3990, annualRsd: 39900 },
  tier_20: { label: 'Do 20 zaposlenih', monthlyRsd: 6990, annualRsd: 69900 },
  tier_50: { label: 'Do 50 zaposlenih', monthlyRsd: 9990, annualRsd: 99900 },
  tier_50plus: { label: '51+ zaposlenih', monthlyRsd: 14990, annualRsd: 149900 },
};

function formatRsd(amount: number): string {
  return amount.toLocaleString('sr-RS');
}

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('sr-RS', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function PretplataPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // TODO: Replace with real data from trpc query (companies.getPaymentInfo)
  // For now, use placeholder data
  const paymentInfo = {
    companyId: 1,
    companyName: 'Moja Firma d.o.o.',
    pricingTier: 'tier_5' as string,
    tierLabel: 'Do 5 zaposlenih',
    monthlyPrice: 1990,
    annualPrice: 19900,
    pozivNaBroj: '1-022026',
    status: 'trial' as 'trial' | 'active' | 'expired',
    trialExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    subscriptionPaidUntil: null as string | null,
    lastPaymentAt: null as string | null,
  };

  const tier = PRICING_TIERS[paymentInfo.pricingTier];
  const amount = billingCycle === 'monthly' ? (tier?.monthlyRsd ?? 0) : (tier?.annualRsd ?? 0);
  const racunPrimaoca = getPaymentAccount();
  const nazivPrimaoca = getPaymentRecipient();

  const ipsQrString = generateIpsQrString({
    racunPrimaoca,
    nazivPrimaoca,
    iznos: amount,
    pozivNaBroj: paymentInfo.pozivNaBroj,
    svrhaPlacanja: `BZR Savetnik pretplata - ${billingCycle === 'monthly' ? 'mesecna' : 'godisnja'}`,
  });

  useEffect(() => {
    if (canvasRef.current && ipsQrString) {
      QRCode.toCanvas(canvasRef.current, ipsQrString, {
        width: 280,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      });
    }
  }, [ipsQrString]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <button
      onClick={() => handleCopy(text, field)}
      className="ml-2 p-1 rounded hover:bg-muted transition-colors"
      title="Kopiraj"
    >
      {copied === field ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Pretplata</h1>
        <p className="text-muted-foreground mt-1">Upravljajte vasim planom i placanjem</p>
      </div>

      {/* Status Banner */}
      {paymentInfo.status === 'trial' && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 flex items-start gap-3">
          <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Besplatni probni period</p>
            <p className="text-sm text-blue-700">
              Vas trial istice {formatDate(paymentInfo.trialExpiryDate)}.
              Platite pretplatu da biste nastavili da koristite sve funkcionalnosti.
            </p>
          </div>
        </div>
      )}

      {paymentInfo.status === 'active' && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <p className="font-medium text-green-900">Aktivna pretplata</p>
            <p className="text-sm text-green-700">
              Placeno do: {formatDate(paymentInfo.subscriptionPaidUntil)}.
              Poslednja uplata: {formatDate(paymentInfo.lastPaymentAt)}.
            </p>
          </div>
        </div>
      )}

      {paymentInfo.status === 'expired' && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Pretplata je istekla</p>
            <p className="text-sm text-red-700">
              Nemate aktivnu pretplatu. Mozete pregledati postojeca dokumenta,
              ali ne mozete generisati nova dok ne platite.
            </p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Current Plan */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Vas plan</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paket</span>
              <span className="font-medium">{tier?.label ?? paymentInfo.tierLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mesecna cena</span>
              <span className="font-medium">{formatRsd(tier?.monthlyRsd ?? 0)} RSD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Godisnja cena</span>
              <span className="font-medium">{formatRsd(tier?.annualRsd ?? 0)} RSD</span>
            </div>
            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground">
                Godisnjim planom ustedite 2 meseca!
              </p>
            </div>
          </div>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Period placanja</h2>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              Mesecno
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'annual'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              Godisnje
            </button>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">
              {formatRsd(amount)} <span className="text-base font-normal text-muted-foreground">RSD</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {billingCycle === 'monthly' ? 'mesecno' : 'godisnje (usteda 2 meseca)'}
            </p>
          </div>
        </div>
      </div>

      {/* IPS QR Payment Section */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Platite IPS QR kodom</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* QR Code */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <canvas ref={canvasRef} />
            </div>
            <p className="text-sm text-muted-foreground mt-3 text-center">
              Skenirajte QR kod bankarskom aplikacijom na telefonu
            </p>
          </div>

          {/* Manual Payment Details */}
          <div className="space-y-4">
            <h3 className="font-medium">Podaci za rucni unos</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                <div>
                  <span className="text-muted-foreground block">Racun primaoca</span>
                  <span className="font-mono font-medium">{racunPrimaoca || 'Nije konfigurisan'}</span>
                </div>
                {racunPrimaoca && <CopyButton text={racunPrimaoca} field="racun" />}
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                <div>
                  <span className="text-muted-foreground block">Primalac</span>
                  <span className="font-medium">{nazivPrimaoca}</span>
                </div>
                <CopyButton text={nazivPrimaoca} field="primalac" />
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                <div>
                  <span className="text-muted-foreground block">Iznos</span>
                  <span className="font-medium">{formatRsd(amount)} RSD</span>
                </div>
                <CopyButton text={String(amount)} field="iznos" />
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                <div>
                  <span className="text-muted-foreground block">Poziv na broj</span>
                  <span className="font-mono font-medium">{paymentInfo.pozivNaBroj}</span>
                </div>
                <CopyButton text={paymentInfo.pozivNaBroj} field="poziv" />
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                <div>
                  <span className="text-muted-foreground block">Svrha placanja</span>
                  <span className="font-medium">BZR Savetnik pretplata</span>
                </div>
                <CopyButton text="BZR Savetnik pretplata" field="svrha" />
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                <div>
                  <span className="text-muted-foreground block">Sifra placanja</span>
                  <span className="font-mono font-medium">289</span>
                </div>
                <CopyButton text="289" field="sifra" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-3 rounded-md bg-blue-50 border border-blue-200 text-xs text-blue-800">
          <strong>Kako funkcionise:</strong> Nakon skeniranja QR koda bankarskom aplikacijom,
          uplata se procesira odmah (instant transfer). Vas nalog ce biti aktiviran u roku od 24h
          nakon sto potvrdimo uplatu.
        </div>
      </div>
    </div>
  );
}
