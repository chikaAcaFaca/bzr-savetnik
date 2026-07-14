'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { callStartTest, callGradeTest } from '@/lib/firebase';
import { playAtoms, playWord } from '@/lib/audio';

type Q = {
  id: string; type: string;
  promptText?: string; promptAtoms?: string[]; promptTtsHash?: string; promptDigit?: string;
  options: (string | { text: string; atoms?: string[]; ttsHash?: string })[];
};

export default function TestPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [attemptId, setAttemptId] = useState('');
  const [questions, setQuestions] = useState<Q[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [i, setI] = useState(0);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    callStartTest({ lessonId: id })
      .then((r: any) => { setAttemptId(r.data.attemptId); setQuestions(r.data.questions); })
      .catch((e) => setErr(e.message));
  }, [id]);

  async function answer(optIdx: number) {
    const next = [...answers, optIdx];
    setAnswers(next);
    if (i + 1 < questions.length) { setI(i + 1); return; }
    const r: any = await callGradeTest({ attemptId, answers: next });
    setResult(r.data);
  }

  if (err) return <main className="container"><p>{err}</p></main>;
  if (result) return (
    <main className="container" style={{ textAlign: 'center' }}>
      <h1>{result.passed ? 'Položio si!' : 'Nije prošlo ovog puta'}</h1>
      <div className="word-card"><p className="sr">{result.score}%</p>
        <p className="native">{result.passed ? 'Tutor je otključan.' : 'Potrebno je 80%. Probaj ponovo.'}</p>
      </div>
      {result.passed
        ? <button className="btn-primary" style={{ marginTop: 20, background: 'var(--c-teal)' }}
            onClick={() => router.push(`/tutor?lesson=${id}`)}>Razgovaraj sa tutorom</button>
        : <button className="btn-primary" style={{ marginTop: 20 }}
            onClick={() => location.reload()}>Novi test</button>}
    </main>
  );
  if (!questions.length) return <main className="container">Priprema testa…</main>;

  const q = questions[i];
  return (
    <main className="container">
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${(i / questions.length) * 100}%` }} />
      </div>
      <p style={{ color: 'var(--c-text-soft)' }}>Pitanje {i + 1} od {questions.length}</p>

      <div className="word-card">
        {q.promptDigit && <p className="sr">{Number(q.promptDigit).toLocaleString('sr-RS')}</p>}
        {q.promptText && !q.promptDigit && <p className="native">{q.promptText}</p>}
        {(q.promptAtoms || q.promptTtsHash) && (
          <button className="audio-btn" onClick={() =>
            q.promptAtoms ? playAtoms(q.promptAtoms) : playWord(q.promptTtsHash!)}>
            🔊 Slušaj pitanje
          </button>
        )}
      </div>

      {q.options.map((o, oi) => {
        const isObj = typeof o !== 'string';
        return (
          <button key={oi} className="quiz-option" onClick={() => answer(oi)}>
            {isObj && (o as any).atoms
              ? <span onClick={(e) => { e.stopPropagation(); playAtoms((o as any).atoms); }}>
                  🔊 Opcija {oi + 1}
                </span>
              : isObj ? (o as any).text : Number(o).toLocaleString('sr-RS')}
          </button>
        );
      })}
    </main>
  );
}
