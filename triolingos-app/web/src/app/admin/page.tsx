'use client';
import { useState } from 'react';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db, callAdminGrant } from '@/lib/firebase';

/** Super admin: pretraga korisnika + "Odobri pristup" (source: 'admin', audit log na serveru). */
export default function AdminPage() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [msg, setMsg] = useState('');

  async function search() {
    const byEmail = await getDocs(query(
      collection(db, 'users'), where('profile.email', '==', q), limit(5)));
    const byPhone = await getDocs(query(
      collection(db, 'users'), where('profile.phone', '==', q), limit(5)));
    setResults([...byEmail.docs, ...byPhone.docs].map((d) => ({ uid: d.id, ...d.data() })));
  }

  async function grant(uid: string, days: number) {
    const note = prompt('Razlog aktivacije (ide u audit log):') ?? '';
    await callAdminGrant({ targetUid: uid, days, note });
    setMsg(`Odobreno ${days} dana za ${uid}`);
  }

  return (
    <main className="container">
      <h1>Admin</h1>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="email ili telefon"
          style={{ flex: 1, padding: 12, borderRadius: 'var(--radius)',
            border: '2px solid var(--c-border)', font: 'inherit' }} />
        <button className="audio-btn" onClick={search}>Traži</button>
      </div>

      {results.map((u) => (
        <div key={u.uid} className="lesson-tile">
          <span style={{ flex: 1 }}>
            <strong>{u.profile?.firstName} {u.profile?.lastName}</strong>
            <span style={{ display: 'block', fontSize: '.85rem', color: 'var(--c-text-soft)' }}>
              {u.profile?.email} · {u.profile?.phone}
              <br />Status: {u.subscription?.status ?? 'bez pretplate'}
              {u.subscription?.source === 'admin' && ' (ručno odobreno)'}
            </span>
          </span>
          <button className="audio-btn" onClick={() => grant(u.uid, 31)}>+31 dan</button>
          <button className="audio-btn slow" onClick={() => grant(u.uid, 92)}>+92 dana</button>
        </div>
      ))}
      {msg && <p style={{ color: 'var(--c-success)' }}>{msg}</p>}
    </main>
  );
}
