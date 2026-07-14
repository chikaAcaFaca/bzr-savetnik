'use client';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

/**
 * B2B dashboard. Poslodavac ne kupuje "srpski jezik" — kupuje
 * "moj radnik razume nalog". Zato je centralni signal: SPREMAN ZA POSAO
 * = završen BZR modul + završen track.
 */
type Row = { uid: string; name: string; phone: string; pct: number; bzr: boolean; ready: boolean };

export default function OrgDashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [orgName, setOrgName] = useState('');

  useEffect(() => onAuthStateChanged(auth, async (u) => {
    if (!u) return;
    const me = await getDoc(doc(db, 'users', u.uid));
    const orgId = me.data()?.org?.orgId;
    if (!orgId) return;

    const org = await getDoc(doc(db, 'orgs', orgId));
    setOrgName(org.data()?.info?.name ?? '');

    const members = await getDocs(collection(db, `orgs/${orgId}/members`));
    const lessons = await getDocs(collection(db, 'lessons'));
    const total = lessons.size;

    const out: Row[] = [];
    for (const m of members.docs) {
      if (m.data().role !== 'worker') continue;
      const wu = await getDoc(doc(db, 'users', m.id));
      const prog = await getDocs(collection(db, `users/${m.id}/progress`));
      const completed = prog.docs.filter((d) => d.data().status === 'completed').length;
      const bzr = wu.data()?.bzr?.completed === true;
      out.push({
        uid: m.id,
        name: `${wu.data()?.profile?.firstName ?? ''} ${wu.data()?.profile?.lastName ?? ''}`,
        phone: wu.data()?.profile?.phone ?? '',
        pct: total ? Math.round((completed / total) * 100) : 0,
        bzr,
        ready: bzr && completed >= Math.ceil(total * 0.5),
      });
    }
    setRows(out.sort((a, b) => a.pct - b.pct));   // ko zaostaje — na vrh
  }), []);

  return (
    <main className="container">
      <h1>{orgName || 'Moja firma'}</h1>
      <p style={{ color: 'var(--c-text-soft)' }}>
        Radnici koji zaostaju su na vrhu liste.
      </p>
      {rows.map((r) => (
        <div key={r.uid} className="lesson-tile">
          <span className="badge" style={{
            background: r.ready ? '#ECFDF5' : r.pct < 30 ? '#FEF2F2' : '#FFF7ED',
            color: r.ready ? 'var(--c-success)' : r.pct < 30 ? 'var(--c-error)' : 'var(--c-primary)',
            fontSize: '.9rem',
          }}>{r.pct}%</span>
          <span style={{ flex: 1 }}>
            <strong>{r.name}</strong>
            <span style={{ display: 'block', fontSize: '.85rem', color: 'var(--c-text-soft)' }}>
              {r.phone} · BZR: {r.bzr ? '✓ završen' : '— nije završen'}
            </span>
          </span>
          {r.ready && (
            <span style={{ color: 'var(--c-success)', fontWeight: 800, fontSize: '.85rem' }}>
              SPREMAN<br />ZA POSAO
            </span>
          )}
        </div>
      ))}
    </main>
  );
}
