'use client';
import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';

const LANGS = [
  { code: 'bn', label: 'বাংলা', name: 'Bangla' },
  { code: 'hi', label: 'हिन्दी', name: 'Hindi' },
  { code: 'ne', label: 'नेपाली', name: 'Nepali' },
  { code: 'en', label: 'English', name: 'English' },
];
const TRACKS = ['trgovac', 'konobar', 'kuvar', 'pekar', 'kuhinja-pomoć',
  'magacioner', 'magacin-pomoć', 'vozač', 'građevina'];

export default function Onboarding() {
  const [step, setStep] = useState<'auth' | 'lang' | 'track' | 'phone'>('auth');
  const [lang, setLang] = useState('');
  const [track, setTrack] = useState('');
  const [phone, setPhone] = useState('');

  async function google() {
    await signInWithPopup(auth, googleProvider);
    setStep('lang');
  }

  async function finish() {
    const u = auth.currentUser!;
    await setDoc(doc(db, 'users', u.uid), {
      profile: {
        firstName: u.displayName?.split(' ')[0] ?? '',
        lastName: u.displayName?.split(' ').slice(1).join(' ') ?? '',
        email: u.email, phone, nativeLang: lang, track,
      },
    }, { merge: true });
    location.href = '/';
  }

  return (
    <main className="container">
      {step === 'auth' && (
        <>
          <h1>Dobrodošao / স্বাগতম / Welcome</h1>
          <p style={{ color: 'var(--c-text-soft)' }}>Nauči srpski za posao i život u Srbiji.</p>
          <button className="btn-primary" onClick={google}>Nastavi sa Google nalogom</button>
        </>
      )}
      {step === 'lang' && (
        <>
          <h1>Tvoj jezik / Your language</h1>
          {LANGS.map((l) => (
            <button key={l.code} className="quiz-option"
              onClick={() => { setLang(l.code); setStep('track'); }}>
              {l.label} <span style={{ color: 'var(--c-text-soft)' }}>({l.name})</span>
            </button>
          ))}
        </>
      )}
      {step === 'track' && (
        <>
          <h1>Tvoj posao / Your job</h1>
          {TRACKS.map((t) => (
            <button key={t} className="quiz-option"
              onClick={() => { setTrack(t); setStep('phone'); }}>{t}</button>
          ))}
        </>
      )}
      {step === 'phone' && (
        <>
          <h1>Broj telefona</h1>
          <p style={{ color: 'var(--c-text-soft)' }}>Obavezan — poslodavac te kontaktira ovim brojem.</p>
          <input value={phone} onChange={(e) => setPhone(e.target.value)}
            placeholder="+381 6x xxx xxxx" inputMode="tel"
            style={{ width: '100%', padding: 16, fontSize: '1.1rem',
              borderRadius: 'var(--radius)', border: '2px solid var(--c-border)' }} />
          <button className="btn-primary" style={{ marginTop: 16 }}
            disabled={phone.length < 9} onClick={finish}>Završi</button>
        </>
      )}
    </main>
  );
}
