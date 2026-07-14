/** Test suite za numberToSerbian — pokreni: node numberToSerbian.test.mjs */
import { numberToSerbianText as t, numberToSerbian, allAtoms } from './numberToSerbian.mjs';

let pass = 0, fail = 0;
function eq(n, expected) {
  const got = t(n);
  if (got === expected) { pass++; }
  else { fail++; console.error(`✗ ${n}: očekivano "${expected}", dobijeno "${got}"`); }
}

// ---- N1: 0–10 ----
eq(0, 'nula'); eq(1, 'jedan'); eq(2, 'dva'); eq(3, 'tri'); eq(4, 'četiri');
eq(5, 'pet'); eq(6, 'šest'); eq(7, 'sedam'); eq(8, 'osam'); eq(9, 'devet'); eq(10, 'deset');

// ---- N2: 11–20 ----
eq(11, 'jedanaest'); eq(12, 'dvanaest'); eq(13, 'trinaest'); eq(14, 'četrnaest');
eq(15, 'petnaest'); eq(16, 'šesnaest'); eq(17, 'sedamnaest'); eq(18, 'osamnaest');
eq(19, 'devetnaest'); eq(20, 'dvadeset');

// ---- N3: desetice ----
eq(30, 'trideset'); eq(40, 'četrdeset'); eq(50, 'pedeset'); eq(60, 'šezdeset');
eq(70, 'sedamdeset'); eq(80, 'osamdeset'); eq(90, 'devedeset');

// ---- N4: složeni dvocifreni ----
eq(21, 'dvadeset jedan'); eq(22, 'dvadeset dva'); eq(25, 'dvadeset pet');
eq(34, 'trideset četiri'); eq(47, 'četrdeset sedam'); eq(56, 'pedeset šest');
eq(68, 'šezdeset osam'); eq(73, 'sedamdeset tri'); eq(89, 'osamdeset devet');
eq(99, 'devedeset devet');

// ---- N5: stotine ----
eq(100, 'sto'); eq(200, 'dvesta'); eq(300, 'trista'); eq(400, 'četiristo');
eq(500, 'petsto'); eq(600, 'šeststo'); eq(700, 'sedamsto'); eq(800, 'osamsto');
eq(900, 'devetsto');
eq(101, 'sto jedan'); eq(110, 'sto deset'); eq(111, 'sto jedanaest');
eq(253, 'dvesta pedeset tri'); eq(999, 'devetsto devedeset devet');
eq(347, 'trista četrdeset sedam'); eq(618, 'šeststo osamnaest');

// ---- N5: hiljade — KLJUČNA PARADIGMA ----
eq(1000, 'hiljadu');                                  // NE "jedan hiljada"
eq(2000, 'dve hiljade');                              // ŽENSKI rod + paukal
eq(3000, 'tri hiljade');
eq(4000, 'četiri hiljade');
eq(5000, 'pet hiljada');                              // genitiv množine
eq(10000, 'deset hiljada');
eq(11000, 'jedanaest hiljada');                       // 11 → genitiv, NE "jedanaest hiljade"
eq(12000, 'dvanaest hiljada');
eq(13000, 'trinaest hiljada');
eq(14000, 'četrnaest hiljada');
eq(21000, 'dvadeset jedna hiljada');                  // jednA + hiljadA singular
eq(22000, 'dvadeset dve hiljade');                    // dvE
eq(24000, 'dvadeset četiri hiljade');
eq(25000, 'dvadeset pet hiljada');
eq(100000, 'sto hiljada');
eq(101000, 'sto jedna hiljada');
eq(102000, 'sto dve hiljade');
eq(111000, 'sto jedanaest hiljada');                  // 111 → genitiv
eq(121000, 'sto dvadeset jedna hiljada');             // 121 → jedna hiljada
eq(200000, 'dvesta hiljada');
eq(999000, 'devetsto devedeset devet hiljada');
eq(1847, 'hiljadu osamsto četrdeset sedam');
eq(2500, 'dve hiljade petsto');
eq(21847, 'dvadeset jedna hiljada osamsto četrdeset sedam');
eq(35712, 'trideset pet hiljada sedamsto dvanaest');

// ---- N6: milioni — MUŠKI rod ----
eq(1000000, 'milion');                                // NE "jedan milion"
eq(2000000, 'dva miliona');                           // dvA (muški) + paukal
eq(3000000, 'tri miliona');
eq(4000000, 'četiri miliona');
eq(5000000, 'pet miliona');
eq(11000000, 'jedanaest miliona');
eq(21000000, 'dvadeset jedan milion');                // jedaN milioN
eq(22000000, 'dvadeset dva miliona');
eq(25000000, 'dvadeset pet miliona');
eq(100000000, 'sto miliona');
eq(101000000, 'sto jedan milion');
eq(1500000, 'milion petsto hiljada');
eq(2750000, 'dva miliona sedamsto pedeset hiljada');

// ---- N6: milijarde — ŽENSKI rod ----
eq(1000000000, 'milijarda');
eq(2000000000, 'dve milijarde');                      // paukal
eq(3000000000, 'tri milijarde');
eq(4000000000, 'četiri milijarde');
eq(5000000000, 'pet milijardi');                      // genitiv množine
eq(11000000000, 'jedanaest milijardi');
eq(21000000000, 'dvadeset jedna milijarda');          // jednA milijardA
eq(22000000000, 'dvadeset dve milijarde');
eq(25000000000, 'dvadeset pet milijardi');
eq(999000000000, 'devetsto devedeset devet milijardi');

// ---- Kombinovani ----
eq(1234567, 'milion dvesta trideset četiri hiljade petsto šezdeset sedam');
eq(2000001, 'dva miliona jedan');
eq(1001000, 'milion hiljadu');
eq(1002000, 'milion dve hiljade');
eq(3021847, 'tri miliona dvadeset jedna hiljada osamsto četrdeset sedam');
eq(7654321000, 'sedam milijardi šeststo pedeset četiri miliona trista dvadeset jedna hiljada');
eq(999999999999, 'devetsto devedeset devet milijardi devetsto devedeset devet miliona devetsto devedeset devet hiljada devetsto devedeset devet');

// ---- Property testovi: svaki atom u izlazu mora postojati u atomskoj listi ----
const atoms = new Set(allAtoms());
let propFail = 0;
for (let i = 0; i < 120; i++) {
  const n = BigInt(Math.floor(Math.random() * 999_999_999)) * BigInt(1 + Math.floor(Math.random() * 1000));
  const capped = n > 999_999_999_999n ? n % 999_999_999_999n : n;
  for (const a of numberToSerbian(capped)) {
    if (!atoms.has(a)) { propFail++; console.error(`✗ nepoznat atom "${a}" za ${capped}`); }
  }
}
if (propFail === 0) pass++; else fail += propFail;

// ---- Granice ----
try { numberToSerbian(-1); fail++; console.error('✗ negativan broj nije bacio grešku'); }
catch { pass++; }
try { numberToSerbian(1_000_000_000_000n); fail++; console.error('✗ prekoračenje nije bacilo grešku'); }
catch { pass++; }

console.log(`\nAtoma za snimanje: ${allAtoms().length}`);
console.log(`${pass} prošlo, ${fail} palo`);
process.exit(fail ? 1 : 0);
