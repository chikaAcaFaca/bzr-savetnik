/** Ucitava content/seed/lessons.json u Firestore + generise banku pitanja za brojeve.
 *  Pokretanje: GOOGLE_APPLICATION_CREDENTIALS=sa.json node scripts/seed.mjs   */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { generateNumberQuestion } from '../web/src/lib/questions/generateNumberQuestion.mjs';

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

const lessons = JSON.parse(readFileSync(new URL('../content/seed/lessons.json', import.meta.url)));

for (const [id, data] of Object.entries(lessons)) {
  if (id.startsWith('_')) continue;
  await db.doc(`lessons/${id}`).set(data);
  console.log('lesson', id);

  if (data.type === 'numbers') {
    const batch = db.batch();
    for (let i = 0; i < 120; i++) {
      const type = i % 2 ? 'audioToDigit' : 'digitToAudio';
      const q = generateNumberQuestion(id, type);
      batch.set(db.collection(`questionBank/${id}/questions`).doc(), q);
    }
    await batch.commit();
    console.log('  +120 pitanja');
  }
}

await db.doc('config/tutor').set({
  monthlyMinutes: 600,
  quarterlyBonusMinutes: 120,
  dailyCapMinutes: 60,
  topup5hPriceRsd: 1000,
  topup10hPriceRsd: 1500,
});
await db.doc('config/pricing').set({
  monthlyRsd: 3000, quarterlyRsd: 9000, rsdPerEur: 117.0,
});
console.log('config ok');
