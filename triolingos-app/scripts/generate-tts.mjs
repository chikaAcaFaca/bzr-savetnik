/**
 * Soniox TTS generator — snima srpski (LATINICA!) glas jednom u LOKALNI folder.
 * Fajlovi se potom sinhronizuju na server (nginx) — vidi `npm run tts:push`.
 *
 *   Pokretanje:  npm run tts        (iz scripts/, čita .env)
 *   Ili:         SONIOX_API_KEY=... node --env-file=.env generate-tts.mjs
 *
 * Model: REST POST https://tts-rt.soniox.com/tts, mp3. Fajl → OUT_DIR/tts/{ttsHash}.mp3.
 * App ga pušta preko playWord(ttsHash); sporo = 0.75x istog fajla (bez novog poziva).
 */
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { FREE_WORDS_WITH_HASH } from '../web/src/lib/content/freeWords.mjs';

const KEY = process.env.SONIOX_API_KEY;
if (!KEY) { console.error('❌ Nedostaje SONIOX_API_KEY (u scripts/.env)'); process.exit(1); }
const VOICE = process.env.TTS_VOICE || 'Adrian';
const OUT_DIR = process.env.OUT_DIR || './audio-out';

async function synth(text) {
  const res = await fetch('https://tts-rt.soniox.com/tts', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'tts-rt-v1', language: 'sr', voice: VOICE,
      text, audio_format: 'mp3', sample_rate: 24000,
    }),
  });
  if (!res.ok) throw new Error(`Soniox ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

mkdirSync(`${OUT_DIR}/tts`, { recursive: true });

// Za sada FREE reči; kasnije proširiti na sav sadržaj (latinica slova, situacije po zanimanju).
const words = FREE_WORDS_WITH_HASH;

let made = 0, skipped = 0;
for (const w of words) {
  const path = `${OUT_DIR}/tts/${w.ttsHash}.mp3`;
  if (existsSync(path)) { console.log('skip (postoji):', w.sr); skipped++; continue; }
  const buf = await synth(w.sr);
  writeFileSync(path, buf);
  console.log('✅', w.sr, '→', path, `(${buf.length}B)`);
  made++;
}
console.log(`\nGotovo: ${made} generisano, ${skipped} preskočeno. Glas: ${VOICE}.`);
console.log('Sledeće: `npm run tts:push` da prebaciš na server.');
