import { LocalizedText } from '@/lib/i18n';

export type Occupation = { code: string } & LocalizedText;

/**
 * Zanimanja / radna mesta.
 * ⚠️ PREVODI SU AI-GENERISAN NACRT (Faza A) — bn/hi/ne obavezno kroz ljudsku reviziju
 *    pre produkcije. `code` je stabilan identifikator (ne menjati — čuva se u profilu).
 */
export const OCCUPATIONS: Occupation[] = [
  { code: 'trgovac',        sr: 'Trgovac',              en: 'Salesperson',        bn: 'বিক্রয়কর্মী',        hi: 'विक्रेता',        ne: 'बिक्रेता' },
  { code: 'konobar',        sr: 'Konobar',              en: 'Waiter',             bn: 'ওয়েটার',            hi: 'वेटर',            ne: 'वेटर' },
  { code: 'kuvar',          sr: 'Kuvar',                en: 'Cook',               bn: 'রাঁধুনি',            hi: 'रसोइया',          ne: 'भान्से' },
  { code: 'pekar',          sr: 'Pekar',                en: 'Baker',              bn: 'রুটি প্রস্তুতকারক',   hi: 'बेकर',            ne: 'बेकर' },
  { code: 'kuhinja-pomoc',  sr: 'Pomoćnik u kuhinji',   en: 'Kitchen helper',     bn: 'রান্নাঘর সহকারী',    hi: 'रसोई सहायक',      ne: 'भान्सा सहायक' },
  { code: 'magacioner',     sr: 'Magacioner',           en: 'Warehouse worker',   bn: 'গুদাম কর্মী',        hi: 'गोदाम कर्मचारी',  ne: 'गोदाम कर्मचारी' },
  { code: 'magacin-pomoc',  sr: 'Pomoćnik u magacinu',  en: 'Warehouse helper',   bn: 'গুদাম সহকারী',       hi: 'गोदाम सहायक',     ne: 'गोदाम सहायक' },
  { code: 'vozac',          sr: 'Vozač',                en: 'Driver',             bn: 'চালক',              hi: 'चालक',            ne: 'चालक' },
  { code: 'gradjevina',     sr: 'Građevinski radnik',   en: 'Construction worker', bn: 'নির্মাণ শ্রমিক',    hi: 'निर्माण मज़दूर',   ne: 'निर्माण मजदुर' },
];

export const OCCUPATION_BY_CODE: Record<string, Occupation> =
  Object.fromEntries(OCCUPATIONS.map((o) => [o.code, o]));
