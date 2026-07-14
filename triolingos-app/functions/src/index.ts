/**
 * Triolingos Cloud Functions
 *  - freemiusWebhook : jedini put kojim pretplata postaje aktivna (uz admin panel)
 *  - startTest       : servira test IZ banke (klijent nikad ne vidi tačne odgovore)
 *  - gradeTest       : ocenjuje server-side, upisuje progress
 *  - tutorToken      : izdaje LiveKit token SAMO ako ima kvote
 *  - tutorMeter      : agent worker javlja aktivne sekunde; ovde se troši kvota
 *  - adminGrant      : ručna aktivacija sa audit logom
 */
import { onRequest, onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { defineSecret } from 'firebase-functions/params';
import * as crypto from 'crypto';
import { AccessToken } from 'livekit-server-sdk';

initializeApp();
const db = getFirestore();

const FREEMIUS_SECRET = defineSecret('FREEMIUS_SECRET');
const LIVEKIT_API_KEY = defineSecret('LIVEKIT_API_KEY');
const LIVEKIT_API_SECRET = defineSecret('LIVEKIT_API_SECRET');
const AGENT_SHARED_SECRET = defineSecret('AGENT_SHARED_SECRET');

// ---------------------------------------------------------------- Freemius

export const freemiusWebhook = onRequest(
  { secrets: [FREEMIUS_SECRET], region: 'europe-west1' },
  async (req, res) => {
    // Verifikacija potpisa je OBAVEZNA — bez nje bilo ko POST-uje "active".
    const signature = req.get('x-signature') ?? '';
    const expected = crypto
      .createHmac('sha256', FREEMIUS_SECRET.value())
      .update(JSON.stringify(req.body))
      .digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      res.status(401).send('bad signature');
      return;
    }

    const { type, objects } = req.body;
    const email: string | undefined = objects?.user?.email;
    if (!email) { res.status(400).send('no user'); return; }

    const snap = await db.collection('users').where('profile.email', '==', email).limit(1).get();
    if (snap.empty) { res.status(404).send('user not found'); return; }
    const userRef = snap.docs[0].ref;

    const cfg = (await db.doc('config/tutor').get()).data() ?? {};
    const monthlyMin = cfg.monthlyMinutes ?? 600;      // 10h — config, ne hardkod
    const quarterlyBonus = cfg.quarterlyBonusMinutes ?? 120; // +2h/mesec

    const plan: string = objects?.subscription?.plan_name ?? 'monthly';
    const isQuarterly = plan.includes('quarter') || plan.includes('3');

    switch (type) {
      case 'subscription.created':
      case 'subscription.renewed': {
        const days = isQuarterly ? 92 : 31;
        await userRef.set({
          subscription: {
            status: 'active', source: 'freemius', plan: isQuarterly ? 'quarterly' : 'monthly',
            expiresAt: Timestamp.fromMillis(Date.now() + days * 86400_000),
            freemiusLicenseId: objects?.license?.id ?? null, grantedBy: null,
          },
          tutor: {
            minutesIncluded: monthlyMin,
            minutesBonus: isQuarterly ? quarterlyBonus : 0,
            minutesPurchased: 0, minutesUsed: 0,
            dailyUsed: 0, dailyCap: cfg.dailyCapMinutes ?? 60,
            dailyResetAt: Timestamp.now(),
            monthlyResetAt: Timestamp.fromMillis(Date.now() + 31 * 86400_000),
          },
        }, { merge: true });
        break;
      }
      case 'payment.failed': {
        // grace 3 dana, pa expired — cron (dnevni scheduled fn) proverava expiresAt
        await userRef.set({ subscription: {
          expiresAt: Timestamp.fromMillis(Date.now() + 3 * 86400_000) } }, { merge: true });
        break;
      }
      case 'subscription.cancelled':
        // status ostaje 'active' do expiresAt; ništa ne radimo odmah
        break;
      case 'license.plan.changed': {
        // dopune tutor minuta prodajemo kao Freemius add-on planove
        const addon: string = objects?.license?.plan_name ?? '';
        const addMin = addon.includes('10h') ? 600 : addon.includes('5h') ? 300 : 0;
        if (addMin) await userRef.set(
          { tutor: { minutesPurchased: FieldValue.increment(addMin) } }, { merge: true });
        break;
      }
    }
    res.status(200).send('ok');
  });

// ---------------------------------------------------------------- Testovi

function requireAuth(auth: { uid: string } | undefined): string {
  if (!auth) throw new HttpsError('unauthenticated', 'Prijavi se.');
  return auth.uid;
}

async function requireActiveSub(uid: string) {
  const u = (await db.doc(`users/${uid}`).get()).data();
  const sub = u?.subscription;
  const active = sub && ['active', 'trial', 'manual'].includes(sub.status)
    && sub.expiresAt?.toMillis() > Date.now();
  // BZR modul je BESPLATAN — to rešava startTest izuzetkom, ne ovde
  if (!active) throw new HttpsError('permission-denied', 'Pretplata nije aktivna.');
  return u;
}

/** Servira ~15 nasumičnih pitanja BEZ correctIndex-a; tačni odgovori ostaju na serveru. */
export const startTest = onCall({ region: 'europe-west1' }, async (req) => {
  const uid = requireAuth(req.auth);
  const { lessonId } = req.data as { lessonId: string };

  const lesson = (await db.doc(`lessons/${lessonId}`).get()).data();
  if (!lesson) throw new HttpsError('not-found', 'Lekcija ne postoji.');
  if (lesson.type !== 'bzr') await requireActiveSub(uid);   // BZR besplatan

  const bank = await db.collection(`questionBank/${lessonId}/questions`).get();
  if (bank.size < 15) throw new HttpsError('failed-precondition', 'Banka pitanja nije spremna.');

  const picked = bank.docs.sort(() => Math.random() - 0.5).slice(0, 15);
  const attemptRef = db.collection(`users/${uid}/attempts`).doc();
  await attemptRef.set({
    lessonId, createdAt: FieldValue.serverTimestamp(),
    questionIds: picked.map((d) => d.id),
    answers: picked.map((d) => d.data().correctIndex),   // ostaje na serveru
    graded: false,
  });

  return {
    attemptId: attemptRef.id,
    questions: picked.map((d) => {
      const { correctIndex, ...pub } = d.data();
      return { id: d.id, ...pub };
    }),
  };
});

export const gradeTest = onCall({ region: 'europe-west1' }, async (req) => {
  const uid = requireAuth(req.auth);
  const { attemptId, answers } = req.data as { attemptId: string; answers: number[] };

  const attemptRef = db.doc(`users/${uid}/attempts/${attemptId}`);
  const attempt = (await attemptRef.get()).data();
  if (!attempt || attempt.graded) throw new HttpsError('failed-precondition', 'Nevažeći pokušaj.');

  const correct = (attempt.answers as number[])
    .reduce((acc, a, i) => acc + (answers[i] === a ? 1 : 0), 0);
  const score = Math.round((correct / attempt.answers.length) * 100);
  const passed = score >= 80;

  await attemptRef.update({ graded: true, score, gradedAt: FieldValue.serverTimestamp() });
  const progRef = db.doc(`users/${uid}/progress/${attempt.lessonId}`);
  const prev = (await progRef.get()).data();
  await progRef.set({
    status: passed ? 'testPassed' : (prev?.status ?? 'open'),
    bestScore: Math.max(score, prev?.bestScore ?? 0),
    attempts: FieldValue.increment(1),
    tutorApproved: prev?.tutorApproved ?? false,
  }, { merge: true });

  return { score, passed };
});

// ---------------------------------------------------------------- Tutor

export const tutorToken = onCall(
  { secrets: [LIVEKIT_API_KEY, LIVEKIT_API_SECRET], region: 'europe-west1' },
  async (req) => {
    const uid = requireAuth(req.auth);
    const { lessonId } = req.data as { lessonId: string };
    await requireActiveSub(uid);

    const prog = (await db.doc(`users/${uid}/progress/${lessonId}`).get()).data();
    if (!prog || !['testPassed', 'completed'].includes(prog.status)) {
      throw new HttpsError('permission-denied', 'Prvo položi test lekcije (≥80%).');
    }

    const t = (await db.doc(`users/${uid}`).get()).data()?.tutor ?? {};
    const available = (t.minutesIncluded ?? 0) + (t.minutesBonus ?? 0)
      + (t.minutesPurchased ?? 0) - (t.minutesUsed ?? 0);
    if (available <= 0) throw new HttpsError('resource-exhausted', 'Kvota potrošena. Dopuni sate.');
    if ((t.dailyUsed ?? 0) >= (t.dailyCap ?? 60)) {
      throw new HttpsError('resource-exhausted', 'Dnevni limit od 60 min dostignut.');
    }

    const room = `tutor-${uid}-${Date.now()}`;
    const at = new AccessToken(LIVEKIT_API_KEY.value(), LIVEKIT_API_SECRET.value(), {
      identity: uid, ttl: '2h',
      metadata: JSON.stringify({ lessonId, availableMinutes: Math.min(available, 60) }),
    });
    at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });
    return { token: await at.toJwt(), room, availableMinutes: available };
  });

/** Agent worker javlja aktivne sekunde (idle-cut već primenjen na strani agenta). */
export const tutorMeter = onRequest(
  { secrets: [AGENT_SHARED_SECRET], region: 'europe-west1' },
  async (req, res) => {
    if (req.get('x-agent-secret') !== AGENT_SHARED_SECRET.value()) {
      res.status(401).send('unauthorized'); return;
    }
    const { uid, sessionId, activeSeconds, lessonId, done } = req.body;
    const minutes = Math.ceil(activeSeconds / 60);

    await db.doc(`tutorSessions/${sessionId}`).set({
      uid, lessonId, activeSeconds, updatedAt: FieldValue.serverTimestamp(), done: !!done,
    }, { merge: true });

    await db.doc(`users/${uid}`).set({
      tutor: {
        minutesUsed: FieldValue.increment(minutes),
        dailyUsed: FieldValue.increment(minutes),
      },
    }, { merge: true });
    res.status(200).send('ok');
  });

/** Tutor odlučuje da je lekcija savladana → poziva ovaj endpoint (tool call iz agenta). */
export const markLessonComplete = onRequest(
  { secrets: [AGENT_SHARED_SECRET], region: 'europe-west1' },
  async (req, res) => {
    if (req.get('x-agent-secret') !== AGENT_SHARED_SECRET.value()) {
      res.status(401).send('unauthorized'); return;
    }
    const { uid, lessonId } = req.body;
    await db.doc(`users/${uid}/progress/${lessonId}`).set({
      status: 'completed', tutorApproved: true, completedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    res.status(200).send('ok');
  });

// ---------------------------------------------------------------- Admin

export const adminGrant = onCall({ region: 'europe-west1' }, async (req) => {
  if (!req.auth?.token?.admin) throw new HttpsError('permission-denied', 'Samo admin.');
  const { targetUid, days, note } = req.data as { targetUid: string; days: number; note?: string };

  const cfg = (await db.doc('config/tutor').get()).data() ?? {};
  await db.doc(`users/${targetUid}`).set({
    subscription: {
      status: 'manual', source: 'admin', plan: 'monthly',
      expiresAt: Timestamp.fromMillis(Date.now() + days * 86400_000),
      grantedBy: req.auth.uid, freemiusLicenseId: null,
    },
    tutor: {
      minutesIncluded: cfg.monthlyMinutes ?? 600,
      minutesBonus: 0, minutesPurchased: 0, minutesUsed: 0,
      dailyUsed: 0, dailyCap: cfg.dailyCapMinutes ?? 60,
      dailyResetAt: Timestamp.now(),
      monthlyResetAt: Timestamp.fromMillis(Date.now() + 31 * 86400_000),
    },
  }, { merge: true });

  // Audit log: ko, kad, kome, koliko, zašto
  await db.collection('auditLog').add({
    action: 'manual_grant', by: req.auth.uid, target: targetUid,
    days, note: note ?? '', at: FieldValue.serverTimestamp(),
  });
  return { ok: true };
});
