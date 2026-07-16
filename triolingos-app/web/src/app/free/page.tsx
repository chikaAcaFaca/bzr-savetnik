'use client';
/**
 * FREE TIER demo — javno (bez prijave). 5 fiksnih reči sa animacijom + audio.
 * Cilj: klijent vidi kako izgleda učenje pre kupovine. Test + 10 min AI tutor demo
 * dolaze u sledećem koraku (backend gating).
 */
import { useState } from 'react';
import Link from 'next/link';
import { WordCard } from '@/components/WordCard';
import { FREE_WORDS_WITH_HASH } from '@/lib/content/freeWords.mjs';

type FreeWord = { sr: string; en: string; bn?: string; hi?: string; ne?: string; ttsHash: string };
const WORDS = FREE_WORDS_WITH_HASH as FreeWord[];

export default function FreePage() {
  const [i, setI] = useState(0);
  const w = WORDS[i];
  const last = i === WORDS.length - 1;

  return (
    <main className="container">
      <h1>Besplatna proba · Free demo</h1>
      <p style={{ color: 'var(--c-text-soft)' }}>
        Nauči 5 reči srpskog · Learn 5 Serbian words — {i + 1}/{WORDS.length}
      </p>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${((i + 1) / WORDS.length) * 100}%` }} />
      </div>

      <div style={{ marginTop: 16 }}>
        <WordCard word={w} />
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button className="btn-primary" style={{ background: 'var(--c-border)', color: 'var(--c-text)' }}
          disabled={i === 0} onClick={() => setI(i - 1)}>Nazad · Back</button>
        {!last
          ? <button className="btn-primary" onClick={() => setI(i + 1)}>Dalje · Next</button>
          : <Link href="/onboarding" style={{ flex: 1 }}>
              <button className="btn-primary" style={{ background: 'var(--c-teal)' }}>
                Nastavi · Continue
              </button>
            </Link>}
      </div>
    </main>
  );
}
