'use client';
import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { Lang, LANGS, NATIVE_LANGS, resolveLangs, writeLangPref } from '@/lib/i18n';
import { OCCUPATIONS } from '@/lib/content/occupations';

// Primer za pregled "koliko jezira vidiš odjednom"
const PREVIEW = { sr: 'Dobar dan', en: 'Good day', bn: 'শুভ দিন', hi: 'नमस्ते', ne: 'नमस्ते' } as const;

export default function Onboarding() {
  const [step, setStep] = useState<'auth' | 'lang' | 'count' | 'track' | 'phone'>('auth');
  const [nativeLang, setNativeLang] = useState<Lang>('en');
  const [langCount, setLangCount] = useState(3);
  const [track, setTrack] = useState('');
  const [phone, setPhone] = useState('');

  async function google() {
    await signInWithPopup(auth, googleProvider);
    setStep('lang');
  }

  async function finish() {
    const u = auth.currentUser!;
    writeLangPref({ nativeLang, langCount });
    await setDoc(doc(db, 'users', u.uid), {
      profile: {
        firstName: u.displayName?.split(' ')[0] ?? '',
        lastName: u.displayName?.split(' ').slice(1).join(' ') ?? '',
        email: u.email, phone, nativeLang, langCount, track,
      },
    }, { merge: true });
    location.href = '/';
  }

  return (
    <main className="container">
      {step === 'auth' && (
        <>
          <h1>Dobrodošao · স্বাগতম · स्वागत · Welcome</h1>
          <p style={{ color: 'var(--c-text-soft)' }}>
            Nauči srpski za posao i život u Srbiji · Learn Serbian for work and life in Serbia
          </p>
          <button className="btn-primary" onClick={google}>Nastavi sa Google nalogom · Continue with Google</button>
        </>
      )}

      {step === 'lang' && (
        <>
          <h1>Tvoj maternji jezik · Your language</h1>
          {NATIVE_LANGS.map((code) => (
            <button key={code} className="quiz-option"
              onClick={() => { setNativeLang(code); setStep('count'); }}>
              {LANGS[code].label} <span style={{ color: 'var(--c-text-soft)' }}>({LANGS[code].name})</span>
            </button>
          ))}
        </>
      )}

      {step === 'count' && (
        <>
          <h1>Koliko jezika da prikažemo? · How many languages?</h1>
          <p style={{ color: 'var(--c-text-soft)' }}>Srpski se uvek uči — ostali su ti pomoć. Kasnije možeš promeniti.</p>
          {[1, 2, 3].map((c) => {
            const langs = resolveLangs(nativeLang, c);
            return (
              <button key={c} className="quiz-option"
                onClick={() => { setLangCount(c); setStep('track'); }}>
                <strong>{c} {c === 1 ? 'jezik' : 'jezika'}</strong>
                <span style={{ display: 'block', marginTop: 6, color: 'var(--c-text-soft)', fontSize: '.95rem' }}>
                  {langs.map((l) => PREVIEW[l]).join('  ·  ')}
                </span>
              </button>
            );
          })}
        </>
      )}

      {step === 'track' && (
        <>
          <h1>Tvoj posao · Your job</h1>
          {OCCUPATIONS.map((o) => {
            const langs = resolveLangs(nativeLang, langCount);
            return (
              <button key={o.code} className="quiz-option"
                onClick={() => { setTrack(o.code); setStep('phone'); }}>
                {langs.map((l, i) => (
                  <span key={l} style={{
                    display: 'block',
                    fontWeight: i === 0 ? 700 : 400,
                    color: i === 0 ? 'var(--c-text)' : 'var(--c-text-soft)',
                    fontSize: i === 0 ? '1.15rem' : '.95rem',
                  }}>{o[l]}</span>
                ))}
              </button>
            );
          })}
        </>
      )}

      {step === 'phone' && (
        <>
          <h1>Broj telefona · Phone number</h1>
          <p style={{ color: 'var(--c-text-soft)' }}>
            Obavezan — poslodavac te kontaktira ovim brojem · Required — your employer contacts you here.
          </p>
          <input value={phone} onChange={(e) => setPhone(e.target.value)}
            placeholder="+381 6x xxx xxxx" inputMode="tel"
            style={{
              width: '100%', padding: 16, fontSize: '1.1rem',
              borderRadius: 'var(--radius)', border: '2px solid var(--c-border)',
            }} />
          <button className="btn-primary" style={{ marginTop: 16 }}
            disabled={phone.length < 9} onClick={finish}>Završi · Finish</button>
        </>
      )}
    </main>
  );
}
