'use client';
/**
 * WordCard — reč koja se uči, sa ANIMACIJOM SLOVA sinhronizovanom uz audio.
 * Model (po viziji): snimljeno jednom → keširano → klik ne košta ništa; sporo = 0.75x
 * istog fajla; "Ponavljaj" vrti u nedogled dok učenik ne stane.
 * Ako mp3 još ne postoji (audio se tek generiše), animacija radi na default tajmingu.
 */
import { useEffect, useRef, useState } from 'react';
import { useLangPref } from '@/lib/LangPref';
import { Lang, LocalizedText } from '@/lib/i18n';

const CDN = process.env.NEXT_PUBLIC_AUDIO_CDN ?? '/audio';
type Word = Partial<LocalizedText> & { sr: string; ttsHash?: string };

export function WordCard({ word, focusLetter }: { word: Word; focusLetter?: string }) {
  const letters = [...word.sr];
  const { langs } = useLangPref();
  const transLangs = langs.filter((l) => l !== 'sr') as Lang[];

  const [active, setActive] = useState(-1);
  const [looping, setLooping] = useState(false);
  const loopRef = useRef(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => hardStop(), []); // cleanup

  function clearTimer() { if (timer.current) { clearInterval(timer.current); timer.current = null; } }
  function hardStop() {
    loopRef.current = false; setLooping(false); setActive(-1);
    clearTimer();
    if (audio.current) { audio.current.pause(); audio.current = null; }
  }

  function animate(durationMs: number) {
    clearTimer();
    const per = Math.max(90, durationMs / Math.max(1, letters.length));
    let i = 0; setActive(0);
    timer.current = setInterval(() => {
      i++;
      if (i >= letters.length) { clearTimer(); setActive(-1); return; }
      setActive(i);
    }, per);
  }

  function playOnce(slow: boolean): Promise<void> {
    const fallbackMs = letters.length * 260;
    const src = word.ttsHash ? `${CDN}/tts/${word.ttsHash}.mp3` : '';
    if (!src) { animate(fallbackMs); return wait(fallbackMs + 120); }
    return new Promise<void>((resolve) => {
      const a = new Audio(src);
      audio.current = a;
      a.playbackRate = slow ? 0.75 : 1;
      a.onloadedmetadata = () => animate((a.duration * 1000) / a.playbackRate);
      a.onended = () => { setActive(-1); resolve(); };
      const fallback = () => { animate(fallbackMs); setTimeout(resolve, fallbackMs + 120); };
      a.onerror = fallback;
      a.play().catch(fallback);
    });
  }

  async function play(slow: boolean, loop: boolean) {
    hardStop();
    loopRef.current = loop; setLooping(loop);
    do {
      await playOnce(slow);
      if (loopRef.current) await wait(450);
    } while (loopRef.current);
  }

  return (
    <div className="word-card">
      <p className="sr word-anim">
        {letters.map((ch, i) => {
          const isFocus = !!focusLetter && ch.toLowerCase() === focusLetter.toLowerCase();
          return (
            <span key={i} className={`wl ${i === active ? 'wl-active' : ''} ${isFocus ? 'focus-letter' : ''}`}>
              {ch}
            </span>
          );
        })}
      </p>
      {transLangs.length > 0 && (
        <p className="native">{transLangs.map((l) => word[l]).filter(Boolean).join('  ·  ')}</p>
      )}

      <div style={{ textAlign: 'center', marginTop: 14 }}>
        <button className="audio-btn" onClick={() => play(false, false)}>🔊 Slušaj</button>
        <button className="audio-btn slow" onClick={() => play(true, false)}>🐢 Sporo</button>
      </div>
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        {!looping
          ? <button className="audio-btn" style={{ background: 'var(--c-saffron)', color: 'var(--c-text)' }}
              onClick={() => play(false, true)}>♾️ Ponavljaj</button>
          : <button className="audio-btn" style={{ background: 'var(--c-error)' }}
              onClick={hardStop}>⏹ Stani</button>}
      </div>
    </div>
  );
}

function wait(ms: number) { return new Promise<void>((r) => setTimeout(r, ms)); }
