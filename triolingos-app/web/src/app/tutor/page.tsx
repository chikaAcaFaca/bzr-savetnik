'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Room, RoomEvent, Track } from 'livekit-client';
import { callTutorToken } from '@/lib/firebase';

const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL!;   // wss://livekit.nknet-consulting.com

export default function TutorPage() {
  const lessonId = useSearchParams().get('lesson') ?? '';
  const [state, setState] = useState<'idle' | 'connecting' | 'live' | 'ended'>('idle');
  const [minutesLeft, setMinutesLeft] = useState<number | null>(null);
  const [err, setErr] = useState('');
  const [room, setRoom] = useState<Room | null>(null);

  async function start() {
    setState('connecting'); setErr('');
    try {
      const r: any = await callTutorToken({ lessonId });
      setMinutesLeft(r.data.availableMinutes);

      const rm = new Room();
      rm.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === Track.Kind.Audio) track.attach();   // agentov glas
      });
      rm.on(RoomEvent.Disconnected, () => setState('ended'));  // idle-cut ili kraj

      await rm.connect(LIVEKIT_URL, r.data.token);
      await rm.localParticipant.setMicrophoneEnabled(true);
      setRoom(rm);
      setState('live');
    } catch (e: any) {
      setErr(e.message); setState('idle');
    }
  }

  function stop() { room?.disconnect(); }

  return (
    <main className="container" style={{ textAlign: 'center' }}>
      <h1>AI Tutor</h1>
      {minutesLeft !== null && (
        <span className="quota-pill">Preostalo: {Math.floor(minutesLeft / 60)}h {minutesLeft % 60}min</span>
      )}

      <div className="tutor-orb" data-live={state === 'live'}>
        {state === 'live' ? 'UŽIVO' : state === 'connecting' ? '…' : '🎙'}
      </div>

      {state === 'idle' && (
        <>
          <p style={{ color: 'var(--c-text-soft)' }}>
            Tutor govori srpski i tvoj jezik. Vežbaćete reči i situacije iz lekcije.
            Vreme se troši samo dok razgovarate — pauze se ne računaju.
          </p>
          <button className="btn-primary" style={{ background: 'var(--c-teal)' }} onClick={start}>
            Počni razgovor
          </button>
        </>
      )}
      {state === 'live' && (
        <button className="btn-primary" onClick={stop}>Završi razgovor</button>
      )}
      {state === 'ended' && (
        <>
          <p>Razgovor je završen.</p>
          <button className="btn-primary" style={{ background: 'var(--c-teal)' }} onClick={start}>
            Nastavi
          </button>
        </>
      )}
      {err && <p style={{ color: 'var(--c-error)' }}>{err}</p>}
    </main>
  );
}
