'use client';
/**
 * Kontekst za jezičku preferencu + <ML> komponenta za višejezični prikaz.
 * Preferenca živi u localStorage (instant na klijentu) i sinhronizuje se sa
 * users/{uid}.profile u Firestore-u kad je korisnik ulogovan.
 */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import {
  DEFAULT_PREF, Lang, LangPref, LocalizedText,
  readLangPref, resolveLangs, writeLangPref,
} from '@/lib/i18n';

type Ctx = { pref: LangPref; langs: Lang[]; setPref: (patch: Partial<LangPref>) => void };
const LangCtx = createContext<Ctx | null>(null);

export function LangPrefProvider({ children }: { children: React.ReactNode }) {
  const [pref, setPrefState] = useState<LangPref>(DEFAULT_PREF);

  // 1) instant iz localStorage
  useEffect(() => { setPrefState(readLangPref()); }, []);

  // 2) sinhronizuj iz Firestore profila kad se korisnik uloguje
  useEffect(() => onAuthStateChanged(auth, async (u) => {
    if (!u) return;
    try {
      const snap = await getDoc(doc(db, 'users', u.uid));
      const p = snap.data()?.profile;
      if (p && (p.nativeLang || p.langCount)) {
        const base = readLangPref();
        const merged: LangPref = {
          nativeLang: (p.nativeLang ?? base.nativeLang) as Lang,
          langCount: Math.min(3, Math.max(1, Number(p.langCount) || base.langCount)),
        };
        setPrefState(merged);
        writeLangPref(merged);
      }
    } catch { /* offline / rules */ }
  }), []);

  const setPref = useCallback((patch: Partial<LangPref>) => {
    setPrefState((prev) => {
      const next: LangPref = { ...prev, ...patch };
      writeLangPref(next);
      const u = auth.currentUser;
      if (u) {
        setDoc(doc(db, 'users', u.uid),
          { profile: { nativeLang: next.nativeLang, langCount: next.langCount } },
          { merge: true }).catch(() => { /* best-effort */ });
      }
      return next;
    });
  }, []);

  return (
    <LangCtx.Provider value={{ pref, langs: resolveLangs(pref.nativeLang, pref.langCount), setPref }}>
      {children}
    </LangCtx.Provider>
  );
}

export function useLangPref(): Ctx {
  const c = useContext(LangCtx);
  if (!c) {
    const langs = resolveLangs(DEFAULT_PREF.nativeLang, DEFAULT_PREF.langCount);
    return { pref: DEFAULT_PREF, langs, setPref: () => {} };
  }
  return c;
}

/**
 * Prikaz višejezičnog teksta. Prva linija (srpski) je istaknuta — to je što se uči;
 * ostale linije (maternji/engleski) su most. `langs` override-uje globalnu preferencu.
 */
export function ML({ text, langs, block = true }:
  { text: Partial<LocalizedText>; langs?: Lang[]; block?: boolean }) {
  const { langs: ctxLangs } = useLangPref();
  const show = langs ?? ctxLangs;
  return (
    <span className={block ? 'ml ml-block' : 'ml'}>
      {show.map((l, i) => {
        const val = text[l] ?? text.sr ?? text.en;
        if (!val) return null;
        return (
          <span key={l} className={`ml-line ${i === 0 ? 'ml-primary' : 'ml-secondary'}`}>{val}</span>
        );
      })}
    </span>
  );
}
