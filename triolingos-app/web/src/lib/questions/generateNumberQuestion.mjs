/**
 * Generator pitanja za modul BROJEVI.
 * Distraktori NISU nasumični — testiraju stvarnu konfuziju:
 *   - iste cifre, drugi red (253 → 235, 352)
 *   - jedna cifra pomerena (253 → 263, 153)
 *   - red veličine (253 → 2053, 2530)
 */
import { numberToSerbian, numberToSerbianText } from '../numbers/numberToSerbian.mjs';

const RANGES = {
  N1: [0, 10], N2: [11, 20], N3: [20, 100], N4: [21, 99],
  N5: [100, 999_999], N6: [1_000_000, 999_999_999_999],
};

function randIn([lo, hi]) {
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

function shuffleDigits(n) {
  const d = String(n).split('');
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  const s = d.join('');
  return s[0] === '0' ? null : Number(s);
}

function nudgeDigit(n) {
  const d = String(n).split('');
  const i = Math.floor(Math.random() * d.length);
  const delta = Math.random() < 0.5 ? 1 : -1;
  const nd = (Number(d[i]) + 10 + delta) % 10;
  d[i] = String(nd);
  const s = d.join('');
  return s[0] === '0' ? null : Number(s);
}

function magnitudeTrap(n) {
  // 253 → 2053 (ubačena nula) ili 2530 (dodata nula)
  const s = String(n);
  if (Math.random() < 0.5 && s.length >= 2) {
    const i = 1 + Math.floor(Math.random() * (s.length - 1));
    return Number(s.slice(0, i) + '0' + s.slice(i));
  }
  return n * 10;
}

const MAX_N = 999_999_999_999;

/** Napravi 3 distraktora različita od tačnog i međusobno. */
export function makeDistractors(correct, range) {
  const out = new Set();
  const makers = [shuffleDigits, nudgeDigit, magnitudeTrap];
  let guard = 0;
  while (out.size < 3 && guard++ < 60) {
    const maker = makers[out.size % makers.length];
    const cand = maker(correct);
    if (cand !== null && cand !== correct && !out.has(cand) && cand >= 0 && cand <= MAX_N) out.add(cand);
  }
  while (out.size < 3) {                 // fallback za jednocifrene
    const cand = randIn(range);
    if (cand !== correct && !out.has(cand)) out.add(cand);
  }
  return [...out];
}

/**
 * @param {'N1'|'N2'|'N3'|'N4'|'N5'|'N6'} lessonId
 * @param {'audioToDigit'|'digitToAudio'} type
 */
export function generateNumberQuestion(lessonId, type) {
  const range = RANGES[lessonId];
  const correct = randIn(range);
  const distractors = makeDistractors(correct, range);
  const options = [correct, ...distractors].sort(() => Math.random() - 0.5);

  if (type === 'audioToDigit') {
    return {
      type, lessonId,
      promptAtoms: numberToSerbian(correct),          // klijent spaja audio segmente
      promptText: numberToSerbianText(correct),        // za sporo/tekst prikaz
      options: options.map(String),
      correctIndex: options.indexOf(correct),
    };
  }
  // digitToAudio: pitanje je cifra, odgovori su 4 audio opcije
  return {
    type, lessonId,
    promptDigit: String(correct),
    options: options.map((n) => ({ atoms: numberToSerbian(n), text: numberToSerbianText(n) })),
    correctIndex: options.indexOf(correct),
  };
}
