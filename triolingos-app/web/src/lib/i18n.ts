/**
 * Triolingos i18n temelj (Faza A).
 * Princip: UČIMO SRPSKI sa maternjeg jezika. Srpski je uvek CILJ (prikazan prvi/istaknut),
 * a maternji + engleski su most. Korisnik bira koliko jezika vidi odjednom (1/2/3).
 */

export type Lang = 'sr' | 'en' | 'bn' | 'hi' | 'ne';

/** Svaki sadržaj koji učenik čita nosi prevode. sr i en su obavezni; maternji po potrebi. */
export type LocalizedText = { sr: string; en: string; bn?: string; hi?: string; ne?: string };

export const LANGS: Record<Lang, { label: string; name: string }> = {
  sr: { label: 'Srpski', name: 'Serbian' },
  en: { label: 'English', name: 'English' },
  bn: { label: 'বাংলা', name: 'Bangla' },
  hi: { label: 'हिन्दी', name: 'Hindi' },
  ne: { label: 'नेपाली', name: 'Nepali' },
};

/** Jezici koje učenik može izabrati kao maternji (srpski je cilj, ne bira se kao maternji). */
export const NATIVE_LANGS: Lang[] = ['bn', 'hi', 'ne', 'en'];

/**
 * Redosled prikaza za dati maternji jezik i broj jezika:
 * uvek srpski prvo (cilj), pa maternji, pa engleski kao most — bez duplikata.
 */
export function resolveLangs(nativeLang: Lang, count: number): Lang[] {
  const order: Lang[] = ['sr', nativeLang, 'en'];
  const uniq: Lang[] = [];
  for (const l of order) if (!uniq.includes(l)) uniq.push(l);
  return uniq.slice(0, Math.min(Math.max(1, count), uniq.length));
}

export type LangPref = { nativeLang: Lang; langCount: number };
export const DEFAULT_PREF: LangPref = { nativeLang: 'en', langCount: 3 };
const PREF_KEY = 'triolingos.langpref';

export function readLangPref(): LangPref {
  if (typeof window === 'undefined') return DEFAULT_PREF;
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (!raw) return DEFAULT_PREF;
    const p = JSON.parse(raw);
    return {
      nativeLang: (NATIVE_LANGS.includes(p.nativeLang) || p.nativeLang === 'sr' ? p.nativeLang : 'en') as Lang,
      langCount: Math.min(3, Math.max(1, Number(p.langCount) || 3)),
    };
  } catch { return DEFAULT_PREF; }
}

export function writeLangPref(p: LangPref) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(PREF_KEY, JSON.stringify(p)); } catch { /* private mode */ }
}
