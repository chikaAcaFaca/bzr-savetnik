/**
 * IPS QR Code Generator
 *
 * Generates IPS (Instant Payment System) QR code strings
 * according to NBS (National Bank of Serbia) specification.
 *
 * Used for instant bank transfers via mobile banking apps.
 * No payment processor needed - direct bank-to-bank transfer.
 */

export interface IpsQrParams {
  /** Recipient bank account number (tekuci racun) */
  racunPrimaoca: string;
  /** Recipient name */
  nazivPrimaoca: string;
  /** Amount in RSD (e.g., 1990 for 1.990 RSD) */
  iznos: number;
  /** Payment reference number (poziv na broj) */
  pozivNaBroj: string;
  /** Payment purpose */
  svrhaPlacanja?: string;
  /** Payment code (sifra placanja) - default 289 */
  sifraPlacanja?: string;
}

/**
 * Generate IPS QR payload string per NBS specification
 *
 * Format: K:PR|V:01|C:1|R:{account}|N:{name}|I:RSD{amount}|P:{purpose}|SF:{code}|S:{reference}
 *
 * Fields:
 * - K:PR - Payment request identifier
 * - V:01 - Version 01
 * - C:1 - Character set (1 = UTF-8)
 * - R: - Recipient account number
 * - N: - Recipient name
 * - I: - Currency and amount (RSD followed by amount with comma as decimal)
 * - P: - Payment purpose
 * - SF: - Payment code (sifra placanja)
 * - S: - Payment reference (poziv na broj)
 */
export function generateIpsQrString(params: IpsQrParams): string {
  const {
    racunPrimaoca,
    nazivPrimaoca,
    iznos,
    pozivNaBroj,
    svrhaPlacanja = 'BZR Savetnik pretplata',
    sifraPlacanja = '289',
  } = params;

  // Format amount: NBS uses comma as decimal separator, 2 decimal places
  const formattedAmount = iznos.toFixed(2).replace('.', ',');

  const parts = [
    'K:PR',
    'V:01',
    'C:1',
    `R:${racunPrimaoca}`,
    `N:${nazivPrimaoca}`,
    `I:RSD${formattedAmount}`,
    `P:${svrhaPlacanja}`,
    `SF:${sifraPlacanja}`,
    `S:${pozivNaBroj}`,
  ];

  return parts.join('|');
}

/**
 * Get payment account from environment variables
 */
export function getPaymentAccount(): string {
  return process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT || '';
}

/**
 * Get payment recipient name from environment variables
 */
export function getPaymentRecipient(): string {
  return process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT || 'BZR Savetnik';
}
