/**
 * FREE TIER — 5 FIKSNIH reči (demo učenja pre kupovine).
 * Fiksne su namerno: štite od zloupotrebe (i free test i free AI tutor rade samo ove).
 * Prevodi su AI NACRT — bn/hi/ne kroz reviziju.
 *
 * .mjs jer ga dele i web (TS import) i scripts/generate-tts.mjs (Node) — kao numberToSerbian.
 */

/** Deterministički keš-ključ za TTS mp3 (isti u app-u i u generatoru). FNV-1a → 8 hex. */
export function ttsHashFor(text) {
  const s = String(text).normalize('NFC').trim().toLowerCase();
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return ('0000000' + h.toString(16)).slice(-8);
}

/** sr je i tekst za TTS (latinica!) i reč koja se uči. */
export const FREE_WORDS = [
  { sr: 'Zdravo', en: 'Hello',     bn: 'হ্যালো',   hi: 'नमस्ते',   ne: 'नमस्ते' },
  { sr: 'Hvala',  en: 'Thank you', bn: 'ধন্যবাদ',  hi: 'धन्यवाद',  ne: 'धन्यवाद' },
  { sr: 'Pažnja', en: 'Attention', bn: 'সতর্কতা',  hi: 'सावधान',   ne: 'सावधान' },
  { sr: 'Voda',   en: 'Water',     bn: 'পানি',     hi: 'पानी',     ne: 'पानी' },
  { sr: 'Pomoć',  en: 'Help',      bn: 'সাহায্য',  hi: 'मदद',      ne: 'मद्दत' },
];

/** Reč + njen ttsHash (koristi i app za playWord i generator za ime fajla). */
export const FREE_WORDS_WITH_HASH = FREE_WORDS.map((w) => ({ ...w, ttsHash: ttsHashFor(w.sr) }));
