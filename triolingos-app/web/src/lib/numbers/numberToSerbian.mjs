/**
 * numberToSerbian — pretvara broj u niz srpskih audio "atoma".
 *
 * Svaki atom odgovara jednom snimljenom audio segmentu (~90 ukupno).
 * Random generator brojeva spaja segmente => beskonačno vežbanja,
 * bez snimanja miliona fajlova.
 *
 * Pokriva srpsku paradigmu brojnosti (1 / 2–4 / 5+) i gramatički rod:
 *   1.000         → "hiljadu"          (NE "jedan hiljada")
 *   2.000         → "dve hiljade"      (hiljada je ŽENSKI rod)
 *   5.000         → "pet hiljada"      (genitiv množine)
 *   21.000        → "dvadeset jedna hiljada"
 *   2.000.000     → "dva miliona"      (milion je MUŠKI rod)
 *   2.000.000.000 → "dve milijarde"
 *   5.000.000.000 → "pet milijardi"
 *
 * Opseg: 0 .. 999.999.999.999 (dovoljno za milijarde iz lekcije N6)
 */

const ONES_M = ['nula', 'jedan', 'dva', 'tri', 'četiri', 'pet', 'šest', 'sedam', 'osam', 'devet'];
const ONES_F = ['nula', 'jedna', 'dve', 'tri', 'četiri', 'pet', 'šest', 'sedam', 'osam', 'devet'];
const TEENS = ['deset', 'jedanaest', 'dvanaest', 'trinaest', 'četrnaest', 'petnaest',
  'šesnaest', 'sedamnaest', 'osamnaest', 'devetnaest'];
const TENS = ['', '', 'dvadeset', 'trideset', 'četrdeset', 'pedeset',
  'šezdeset', 'sedamdeset', 'osamdeset', 'devedeset'];
const HUNDREDS = ['', 'sto', 'dvesta', 'trista', 'četiristo', 'petsto',
  'šeststo', 'sedamsto', 'osamsto', 'devetsto'];

/** Paradigma brojnosti: kojim oblikom se završava grupa od `n` jedinica. */
function paradigm(n) {
  const lastTwo = n % 100;
  const last = n % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return 'many';   // 11–14 → genitiv množine
  if (last === 1) return 'one';
  if (last >= 2 && last <= 4) return 'few';            // paukal
  return 'many';
}

/** 1–999 u atome. gender: 'm' | 'f' (utiče samo na 1 i 2). */
function threeDigits(n, gender) {
  const atoms = [];
  const ones = gender === 'f' ? ONES_F : ONES_M;
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (h > 0) atoms.push(HUNDREDS[h]);
  if (rest >= 10 && rest <= 19) {
    atoms.push(TEENS[rest - 10]);
  } else {
    const t = Math.floor(rest / 10);
    const o = rest % 10;
    if (t >= 2) atoms.push(TENS[t]);
    if (o > 0) atoms.push(ones[o]);
  }
  return atoms;
}

/**
 * @param {number|bigint} input
 * @returns {string[]} niz atoma, npr. 21847 → ["dvadeset","jedna","hiljada","osamsto","četrdeset","sedam"]
 */
export function numberToSerbian(input) {
  let n = BigInt(input);
  if (n < 0n) throw new RangeError('Negativni brojevi nisu podržani');
  if (n > 999_999_999_999n) throw new RangeError('Maksimum je 999.999.999.999');
  if (n === 0n) return ['nula'];

  const milijarde = Number(n / 1_000_000_000n);
  const milioni = Number((n / 1_000_000n) % 1000n);
  const hiljade = Number((n / 1000n) % 1000n);
  const ostatak = Number(n % 1000n);

  const atoms = [];

  // MILIJARDE — ženski rod: jedna/dve; milijarda / milijarde / milijardi
  if (milijarde > 0) {
    const p = paradigm(milijarde);
    if (milijarde === 1) {
      atoms.push('milijarda');                       // 10⁹ → "milijarda"
    } else {
      atoms.push(...threeDigits(milijarde, 'f'));
      atoms.push(p === 'one' ? 'milijarda' : p === 'few' ? 'milijarde' : 'milijardi');
    }
  }

  // MILIONI — muški rod: jedan/dva; milion / miliona / miliona
  if (milioni > 0) {
    const p = paradigm(milioni);
    if (milioni === 1) {
      atoms.push('milion');                          // 10⁶ → "milion"
    } else {
      atoms.push(...threeDigits(milioni, 'm'));
      atoms.push(p === 'one' ? 'milion' : 'miliona');
    }
  }

  // HILJADE — ženski rod: jedna/dve; hiljadu / hiljada / hiljade / hiljada
  if (hiljade > 0) {
    const p = paradigm(hiljade);
    if (hiljade === 1) {
      atoms.push('hiljadu');                         // 1.000 → "hiljadu", NE "jedan hiljada"
    } else {
      atoms.push(...threeDigits(hiljade, 'f'));
      atoms.push(p === 'one' ? 'hiljada' : p === 'few' ? 'hiljade' : 'hiljada');
    }
  }

  if (ostatak > 0) atoms.push(...threeDigits(ostatak, 'm'));

  return atoms;
}

/** Tekstualni oblik za prikaz/test. */
export function numberToSerbianText(input) {
  return numberToSerbian(input).join(' ');
}

/** Kompletna lista audio atoma koje treba snimiti (za TTS batch / proveru keša). */
export function allAtoms() {
  return [...new Set([
    ...ONES_M, ...ONES_F, ...TEENS,
    ...TENS.filter(Boolean), ...HUNDREDS.filter(Boolean),
    'hiljadu', 'hiljada', 'hiljade',
    'milion', 'miliona',
    'milijarda', 'milijarde', 'milijardi',
  ])];
}
