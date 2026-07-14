/**
 * Audio sloj.
 *  - Atomi brojeva: /audio/atoms/{voice}/{atom}.mp3 — spajaju se sekvencijalno
 *  - Reči/situacije: TTS keš URL iz Firestore ttsCache (on-demand, keširano)
 *  - Spora brzina: playbackRate 0.75 — bez posebnog TTS poziva
 */

const CDN = process.env.NEXT_PUBLIC_AUDIO_CDN ?? '/audio';

export type Voice = 'zensky' | 'muski';

export async function playAtoms(atoms: string[], voice: Voice = 'zensky', slow = false) {
  for (const atom of atoms) {
    await playOne(`${CDN}/atoms/${voice}/${encodeURIComponent(atom)}.mp3`, slow);
  }
}

export async function playWord(hash: string, slow = false) {
  await playOne(`${CDN}/tts/${hash}.mp3`, slow);
}

function playOne(src: string, slow: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    const a = new Audio(src);
    a.playbackRate = slow ? 0.75 : 1;
    a.onended = () => resolve();
    a.onerror = () => reject(new Error(`Audio nije nađen: ${src}`));
    a.play().catch(reject);
  });
}
