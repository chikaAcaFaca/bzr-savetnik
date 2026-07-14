'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { playAtoms, playWord } from '@/lib/audio';
import { numberToSerbian, numberToSerbianText } from '@/lib/numbers/numberToSerbian.mjs';

type Word = { sr: string; en: string; bn?: string; hi?: string; ne?: string; ttsHash?: string };
type Lesson = {
  id: string; type: 'numbers' | 'letter' | 'bzr'; title: string; letter?: string;
  range?: [number, number]; words?: Word[]; situations?: Word[];
};

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    getDoc(doc(db, 'lessons', id)).then((d) =>
      setLesson({ id: d.id, ...d.data() } as Lesson));
  }, [id]);

  if (!lesson) return <main className="container">Učitavanje…</main>;

  return lesson.type === 'numbers'
    ? <NumberDrill lesson={lesson} />
    : <WordDrill lesson={lesson} idx={idx} setIdx={setIdx} />;
}

/* ---------- BROJEVI: random broj iz opsega, audio se sklapa iz atoma ---------- */
function NumberDrill({ lesson }: { lesson: Lesson }) {
  const [n, setN] = useState<number>(() => rand(lesson.range ?? [0, 10]));
  const [revealed, setRevealed] = useState(false);
  const atoms = useMemo(() => numberToSerbian(n), [n]);

  function next() {
    setRevealed(false);
    setN(rand(lesson.range ?? [0, 10]));
  }

  return (
    <main className="container">
      <h1>{lesson.title}</h1>
      <div className="word-card">
        <p className="sr">{n.toLocaleString('sr-RS')}</p>
        {revealed && <p className="native">{numberToSerbianText(n)}</p>}
      </div>
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <button className="audio-btn" onClick={() => { setRevealed(true); playAtoms(atoms); }}>
          🔊 Slušaj
        </button>
        <button className="audio-btn slow" onClick={() => { setRevealed(true); playAtoms(atoms, 'zensky', true); }}>
          🐢 Sporo
        </button>
      </div>
      <button className="btn-primary" style={{ marginTop: 24 }} onClick={next}>
        Sledeći broj
      </button>
      <Link href={`/test/${lesson.id}`}>
        <button className="btn-primary" style={{ marginTop: 10, background: 'var(--c-teal)' }}>
          Idi na test
        </button>
      </Link>
    </main>
  );
}

/* ---------- SLOVA / BZR: velika reč, fokus-slovo obojeno, audio primaran ---------- */
function WordDrill({ lesson, idx, setIdx }:
  { lesson: Lesson; idx: number; setIdx: (i: number) => void }) {
  const words = lesson.words ?? [];
  const w = words[idx];
  if (!w) return <main className="container">Nema reči.</main>;

  const highlighted = lesson.letter
    ? w.sr.split('').map((ch, i) =>
        ch.toLowerCase() === lesson.letter!.toLowerCase()
          ? <span key={i} className="focus-letter">{ch}</span> : ch)
    : w.sr;

  return (
    <main className="container">
      <h1>{lesson.title}</h1>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${((idx + 1) / words.length) * 100}%` }} />
      </div>

      <div className="word-card" style={{ marginTop: 20 }}>
        <p className="sr">{highlighted}</p>
        <p className="native">{w.en}{w.bn ? ` · ${w.bn}` : ''}</p>
      </div>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <button className="audio-btn" onClick={() => w.ttsHash && playWord(w.ttsHash)}>🔊 Slušaj</button>
        <button className="audio-btn slow" onClick={() => w.ttsHash && playWord(w.ttsHash, true)}>🐢 Sporo</button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
        <button className="btn-primary" style={{ background: 'var(--c-border)', color: 'var(--c-text)' }}
          disabled={idx === 0} onClick={() => setIdx(idx - 1)}>Nazad</button>
        {idx < words.length - 1
          ? <button className="btn-primary" onClick={() => setIdx(idx + 1)}>Dalje</button>
          : <Link href={`/test/${lesson.id}`} style={{ flex: 1 }}>
              <button className="btn-primary" style={{ background: 'var(--c-teal)' }}>Test</button>
            </Link>}
      </div>
    </main>
  );
}

function rand([lo, hi]: [number, number]) {
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}
