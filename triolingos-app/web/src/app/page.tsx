'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

type Lesson = { id: string; type: string; order: number; title: string; letter?: string };
type Progress = Record<string, { status: string; bestScore?: number }>;

export default function Home() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Progress>({});
  const [tutorLeft, setTutorLeft] = useState<number | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => onAuthStateChanged(auth, async (u) => {
    setAuthed(!!u);
    if (!u) return;
    const ls = await getDocs(query(collection(db, 'lessons'), orderBy('order')));
    setLessons(ls.docs.map((d) => ({ id: d.id, ...d.data() } as Lesson)));
    const ps = await getDocs(collection(db, `users/${u.uid}/progress`));
    setProgress(Object.fromEntries(ps.docs.map((d) => [d.id, d.data() as any])));
    const me = await getDoc(doc(db, 'users', u.uid));
    const t = me.data()?.tutor;
    if (t) setTutorLeft(Math.max(0,
      (t.minutesIncluded ?? 0) + (t.minutesBonus ?? 0) + (t.minutesPurchased ?? 0) - (t.minutesUsed ?? 0)));
  }), []);

  if (authed === false) {
    if (typeof window !== 'undefined') window.location.href = '/onboarding';
    return null;
  }

  // Prva neotključana lekcija je "open"; sve iza zaključano — osim BZR (uvek otvoren, besplatan)
  let unlocked = true;
  const tiles = lessons.map((l) => {
    const p = progress[l.id];
    const done = p?.status === 'completed';
    const isBzr = l.type === 'bzr';
    const locked = !isBzr && !done && !unlocked;
    if (!done && !isBzr) unlocked = false;
    return { ...l, done, locked, score: p?.bestScore };
  });

  return (
    <main className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Triolingos</h1>
        {tutorLeft !== null && (
          <span className="quota-pill">
            Tutor: {Math.floor(tutorLeft / 60)}h {tutorLeft % 60}min
          </span>
        )}
      </header>

      {tiles.map((l) => (
        <Link key={l.id} href={`/lessons/${l.id}`} className="lesson-tile"
          data-locked={l.locked} data-done={l.done}>
          <span className="badge">{l.letter ?? (l.type === 'bzr' ? '⛑' : '#')}</span>
          <span style={{ flex: 1 }}>
            <strong>{l.title}</strong>
            {l.type === 'bzr' && (
              <span style={{ display: 'block', fontSize: '.85rem', color: 'var(--c-teal)' }}>
                Besplatno · Bezbednost na radu
              </span>
            )}
            {l.score !== undefined && (
              <span style={{ display: 'block', fontSize: '.85rem', color: 'var(--c-text-soft)' }}>
                Najbolji rezultat: {l.score}%
              </span>
            )}
          </span>
          <span>{l.done ? '✓' : l.locked ? '🔒' : '→'}</span>
        </Link>
      ))}
    </main>
  );
}
